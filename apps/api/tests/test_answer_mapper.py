"""The "Other" answer mapper (SCREENING_SPEC §3.3) with the LLM mocked."""

from typing import Any, cast

import pytest
from pydantic import BaseModel, ValidationError
from sqlalchemy.orm import Session

from app.ai import answer_mapper, llm
from app.ai.answer_mapper import MappingStatus, OtherMapping
from app.core.questionnaire import load_questionnaire
from app.models import Locale
from app.scoring.items import Item

Q01 = load_questionnaire().item("q01")
Q13 = load_questionnaire().item("q13")


def map_other_answer(item: Item, text: str, locale: Locale) -> OtherMapping:
    # The fake LLMs below never touch the database; the real quota is tested in test_llm_quota.
    return answer_mapper.map_other_answer(item, text, locale, db=cast(Session, None), user_id=1)


def fake_llm(monkeypatch: pytest.MonkeyPatch, **reply: Any) -> list[dict[str, Any]]:
    """Replaces the OpenAI call with one that returns `reply`. Returns the recorded calls."""
    calls: list[dict[str, Any]] = []

    def structured(
        prompt: llm.Prompt, user_input: str, output: type[BaseModel], **_: object
    ) -> BaseModel:
        calls.append({"prompt": prompt, "input": user_input, "output": output})
        return output.model_validate(reply)

    monkeypatch.setattr(llm, "structured", structured)
    return calls


def failing_llm(monkeypatch: pytest.MonkeyPatch, error: type[Exception]) -> None:
    def structured(*_: object, **__: object) -> BaseModel:
        raise error

    monkeypatch.setattr(llm, "structured", structured)


def test_suggestion_from_the_model(monkeypatch: pytest.MonkeyPatch) -> None:
    calls = fake_llm(
        monkeypatch, mapped_option="sometimes", confidence=0.8, short_reason="খেলার সময় তাকায়।"
    )
    mapping = map_other_answer(Q01, "খেলার সময় ডাকলে কখনো কখনো তাকায়", Locale.bn)
    assert mapping.status is MappingStatus.suggested
    assert (mapping.option, mapping.confidence, mapping.reason) == (
        "sometimes",
        0.8,
        "খেলার সময় তাকায়।",
    )
    sent = calls[0]["input"]
    assert "<<<\nখেলার সময় ডাকলে কখনো কখনো তাকায়\n>>>" in sent
    assert "Write short_reason in: Bangla" in sent
    assert "- rarely: Rarely or never" in sent
    assert calls[0]["prompt"].version == "answer_mapper-1"


def test_the_items_own_cards_are_offered(monkeypatch: pytest.MonkeyPatch) -> None:
    calls = fake_llm(
        monkeypatch, mapped_option="single_words", confidence=0.9, short_reason="Says words."
    )
    mapping = map_other_answer(Q13, "says mama and ball", Locale.en)
    assert mapping.option == "single_words"
    assert "- sounds_gestures:" in calls[0]["input"]
    assert "Write short_reason in: English" in calls[0]["input"]


def test_output_schema_only_allows_the_items_cards() -> None:
    model = answer_mapper._output_model(Q13.options)
    with pytest.raises(ValidationError):
        model.model_validate({"mapped_option": "usually", "confidence": 1, "short_reason": "x"})
    schema = model.model_json_schema()
    assert schema["properties"]["mapped_option"]["enum"] == [*Q13.options, "unclear"]


def test_unclear_answer_asks_the_parent(monkeypatch: pytest.MonkeyPatch) -> None:
    fake_llm(monkeypatch, mapped_option="unclear", confidence=0.2, short_reason="  ")
    mapping = map_other_answer(Q01, "আমার ভাই আসছে", Locale.bn)
    assert mapping.status is MappingStatus.unclear
    assert mapping.option is None and mapping.reason is None


def test_confidence_is_clamped(monkeypatch: pytest.MonkeyPatch) -> None:
    fake_llm(monkeypatch, mapped_option="usually", confidence=1.7, short_reason="Yes.")
    assert map_other_answer(Q01, "always", Locale.en).confidence == 1.0


@pytest.mark.parametrize(
    "error", [llm.LLMNotConfiguredError, llm.LLMError, llm.LLMQuotaExceededError]
)
def test_no_ai_means_the_parent_picks(monkeypatch: pytest.MonkeyPatch, error: type) -> None:
    failing_llm(monkeypatch, error)
    mapping = map_other_answer(Q01, "sometimes", Locale.en)
    assert mapping.status is MappingStatus.unavailable
    assert mapping.option is None


def test_structured_call_needs_a_key() -> None:
    # conftest clears OPENAI_API_KEY, so no test can reach OpenAI.
    assert not llm.is_configured()
    with pytest.raises(llm.LLMNotConfiguredError):
        llm.structured(
            llm.load_prompt("answer_mapper"), "x", BaseModel, db=cast(Session, None), user_id=1
        )


def test_prompt_files_carry_a_version() -> None:
    prompt = llm.load_prompt("answer_mapper")
    assert prompt.name == "answer_mapper"
    assert prompt.text.startswith("You help")
    assert "---" not in prompt.text.splitlines()[0]
