"""Per-user daily cap on LLM calls (LLM_DAILY_CAP), with OpenAI mocked."""

from collections.abc import Iterator
from types import SimpleNamespace
from typing import Any

import pytest
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai import llm
from app.core.config import get_settings
from app.models import LlmUsage, Role
from tests.conftest import MakeUser


class Reply(BaseModel):
    answer: str


class FakeResponses:
    def __init__(self) -> None:
        self.calls = 0

    def parse(self, **_: Any) -> SimpleNamespace:
        self.calls += 1
        return SimpleNamespace(output_parsed=Reply(answer="ok"))


@pytest.fixture
def openai(monkeypatch: pytest.MonkeyPatch) -> Iterator[FakeResponses]:
    responses = FakeResponses()
    settings = get_settings()
    monkeypatch.setattr(settings, "openai_api_key", "sk-test")
    monkeypatch.setattr(settings, "llm_daily_cap", 3)
    monkeypatch.setattr(llm, "_client", lambda *_: SimpleNamespace(responses=responses))
    yield responses


def call(db: Session, user_id: int) -> Reply:
    return llm.structured(llm.load_prompt("answer_mapper"), "x", Reply, db=db, user_id=user_id)


def test_calls_stop_at_the_daily_cap(
    openai: FakeResponses, db: Session, make_user: MakeUser
) -> None:
    user = make_user(Role.parent)
    for _ in range(3):
        assert call(db, user.id).answer == "ok"
    with pytest.raises(llm.LLMQuotaExceededError):
        call(db, user.id)
    # Refused before OpenAI is reached.
    assert openai.calls == 3
    assert db.scalar(select(LlmUsage.calls).where(LlmUsage.user_id == user.id)) == 3


def test_the_cap_is_per_user(openai: FakeResponses, db: Session, make_user: MakeUser) -> None:
    first = make_user(Role.parent)
    second = make_user(Role.parent, email="other@test.bd")
    for _ in range(3):
        call(db, first.id)
    assert call(db, second.id).answer == "ok"


def test_the_cap_resets_the_next_day(
    openai: FakeResponses, db: Session, make_user: MakeUser
) -> None:
    user = make_user(Role.parent)
    for _ in range(3):
        call(db, user.id)
    usage = db.scalar(select(LlmUsage).where(LlmUsage.user_id == user.id))
    assert usage is not None
    usage.day = usage.day.replace(year=usage.day.year - 1)
    db.commit()
    assert call(db, user.id).answer == "ok"


def test_zero_means_no_cap(
    openai: FakeResponses, db: Session, make_user: MakeUser, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(get_settings(), "llm_daily_cap", 0)
    user = make_user(Role.parent)
    for _ in range(5):
        call(db, user.id)
    assert openai.calls == 5
    assert db.scalar(select(LlmUsage)) is None
