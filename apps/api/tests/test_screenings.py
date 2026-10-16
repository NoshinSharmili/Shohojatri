"""Screening Part 1 API: start, consent, answers, "Other" mapping, completion (SCREENING_SPEC
§2-§3, §10)."""

from collections.abc import Callable
from datetime import date
from typing import Any

import pytest
from fastapi.testclient import TestClient
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai import llm
from app.core.dates import today_bd
from app.models import (
    AccessGrant,
    AuditLog,
    Child,
    GrantScope,
    Role,
    Screening,
    ScreeningAnswer,
    ScreeningStatus,
    User,
)
from tests.conftest import MakeChild, MakeUser

SCREENINGS = "/api/v1/screenings"
CONSENT = "screening-consent-1"
ClientFor = Callable[[str], TestClient]


def dob_months_ago(months: int) -> date:
    """A date of birth that makes the child exactly `months` old today."""
    today = today_bd()
    year, month = divmod(today.year * 12 + today.month - 1 - months, 12)
    return date(year, month + 1, 1)


@pytest.fixture
def parent(make_user: MakeUser) -> User:
    return make_user(Role.parent)


@pytest.fixture
def child(parent: User, make_child: MakeChild) -> Child:
    return make_child(parent, name="Rafi", dob=dob_months_ago(36))


@pytest.fixture
def as_parent(parent: User, client_for: ClientFor) -> TestClient:
    return client_for("parent@test.bd")


def start(client: TestClient, child_id: int, consent: bool = True) -> dict[str, Any]:
    response = client.post(
        SCREENINGS, json={"child_id": child_id, "locale": "bn", "informant": "mother"}
    )
    assert response.status_code == 201, response.text
    screening = response.json()
    if consent:
        accepted = client.post(f"{SCREENINGS}/{screening['id']}/consent", json={"version": CONSENT})
        assert accepted.status_code == 200, accepted.text
        screening = accepted.json()
    return screening


def answer(
    client: TestClient, screening_id: int, item_id: str, option: str, other_text: str | None = None
) -> Any:
    body: dict[str, Any] = {"option": option}
    if other_text is not None:
        body["other_text"] = other_text
    return client.put(f"{SCREENINGS}/{screening_id}/answers/{item_id}", json=body)


def calm_option(item: dict[str, Any]) -> str:
    return {"freq": "usually", "communication": "sentences", "regression": "no"}.get(
        item["type"], "yes_normal"
    )


def fake_mapper(monkeypatch: pytest.MonkeyPatch, option: str, confidence: float = 0.8) -> None:
    def structured(
        _prompt: llm.Prompt, _input: str, output: type[BaseModel], **_: object
    ) -> BaseModel:
        return output.model_validate(
            {"mapped_option": option, "confidence": confidence, "short_reason": "বুঝেছি।"}
        )

    monkeypatch.setattr(llm, "structured", structured)


# --- starting -------------------------------------------------------------------------------


def test_start_returns_the_questionnaire_for_the_childs_age(
    as_parent: TestClient, child: Child
) -> None:
    screening = start(as_parent, child.id, consent=False)
    assert screening["child_name"] == "Rafi"
    assert screening["age_months"] == 36
    assert screening["age_notice"] is None
    assert screening["informant"] == "mother"
    assert screening["status"] == "in_progress"
    assert screening["consent_at"] is None
    assert (screening["answered"], screening["total"]) == (0, 20)
    first = screening["items"][0]
    assert first["id"] == "q01" and first["text_bn"] and first["text_en"]
    assert first["options"] == ["usually", "sometimes", "rarely", "not_sure"]


@pytest.mark.parametrize(
    ("months", "notice", "total"),
    [(12, "younger", 11), (15, "younger", 16), (16, None, 18), (48, None, 20), (49, "older", 20)],
)
def test_age_notice_and_items_by_age(
    as_parent: TestClient,
    parent: User,
    make_child: MakeChild,
    months: int,
    notice: str | None,
    total: int,
) -> None:
    child = make_child(parent, dob=dob_months_ago(months))
    screening = start(as_parent, child.id, consent=False)
    assert screening["age_notice"] == notice
    assert screening["total"] == total


@pytest.mark.parametrize("months", [11, 73])
def test_ages_outside_12_to_72_months_are_turned_away(
    as_parent: TestClient, parent: User, make_child: MakeChild, months: int
) -> None:
    child = make_child(parent, dob=dob_months_ago(months))
    response = as_parent.post(
        SCREENINGS, json={"child_id": child.id, "locale": "en", "informant": "father"}
    )
    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "screening_age_out_of_range"
    assert error["detail"] == {"age_months": months}


def test_one_open_screening_per_child(as_parent: TestClient, child: Child) -> None:
    first = start(as_parent, child.id)
    response = as_parent.post(
        SCREENINGS, json={"child_id": child.id, "locale": "bn", "informant": "mother"}
    )
    assert response.status_code == 409
    assert response.json()["error"]["detail"] == {"screening_id": first["id"]}

    # Deleting it (the consent promise) lets the parent start again.
    assert as_parent.delete(f"{SCREENINGS}/{first['id']}").status_code == 200
    assert as_parent.get(f"{SCREENINGS}/{first['id']}").status_code == 404
    start(as_parent, child.id)


def test_delete_removes_the_answers(as_parent: TestClient, child: Child, db: Session) -> None:
    screening = start(as_parent, child.id)
    answer(as_parent, screening["id"], "q01", "usually")
    as_parent.delete(f"{SCREENINGS}/{screening['id']}")
    db.expire_all()
    assert db.scalars(select(ScreeningAnswer)).all() == []


def test_finalized_screening_doesnt_block_a_new_one(
    as_parent: TestClient, child: Child, db: Session
) -> None:
    first = start(as_parent, child.id)
    db.get(Screening, first["id"]).status = ScreeningStatus.finalized
    db.commit()
    second = start(as_parent, child.id)
    listed = as_parent.get(f"/api/v1/children/{child.id}/screenings").json()
    assert [s["id"] for s in listed] == [second["id"], first["id"]]


# --- who may do what --------------------------------------------------------------------------


def test_other_parents_cant_see_or_start(
    as_parent: TestClient, child: Child, make_user: MakeUser, client_for: ClientFor
) -> None:
    screening = start(as_parent, child.id)
    make_user(Role.parent, email="other@test.bd")
    other = client_for("other@test.bd")
    body = {"child_id": child.id, "locale": "bn", "informant": "mother"}
    assert other.post(SCREENINGS, json=body).status_code == 404
    assert other.get(f"{SCREENINGS}/{screening['id']}").status_code == 404
    assert answer(other, screening["id"], "q01", "rarely").status_code == 404
    assert other.delete(f"{SCREENINGS}/{screening['id']}").status_code == 404


def test_specialist_reads_audited_teacher_doesnt(
    as_parent: TestClient,
    child: Child,
    make_user: MakeUser,
    client_for: ClientFor,
    db: Session,
) -> None:
    screening = start(as_parent, child.id)
    doctor = make_user(Role.specialist)
    teacher = make_user(Role.teacher)
    db.add_all(
        [
            AccessGrant(child_id=child.id, user_id=doctor.id, scope=GrantScope.clinical),
            AccessGrant(child_id=child.id, user_id=teacher.id, scope=GrantScope.education),
        ]
    )
    db.commit()

    as_doctor = client_for("specialist@test.bd")
    assert as_doctor.get(f"{SCREENINGS}/{screening['id']}").status_code == 200
    assert as_doctor.get(f"/api/v1/children/{child.id}/screenings").status_code == 200
    # Running a screening is the parent's.
    assert answer(as_doctor, screening["id"], "q01", "rarely").status_code == 403
    assert as_doctor.delete(f"{SCREENINGS}/{screening['id']}").status_code == 403
    audited = db.scalars(select(AuditLog).where(AuditLog.actor_id == doctor.id)).all()
    assert [(a.action, a.resource) for a in audited] == [("read", "screenings")] * 2

    as_teacher = client_for("teacher@test.bd")
    assert as_teacher.get(f"{SCREENINGS}/{screening['id']}").status_code == 403
    assert as_teacher.get(f"/api/v1/children/{child.id}/screenings").status_code == 403
    body = {"child_id": child.id, "locale": "bn", "informant": "mother"}
    assert as_teacher.post(SCREENINGS, json=body).status_code == 403


# --- consent ----------------------------------------------------------------------------------


def test_answers_wait_for_consent(as_parent: TestClient, child: Child) -> None:
    screening = start(as_parent, child.id, consent=False)
    response = answer(as_parent, screening["id"], "q01", "usually")
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "consent_required"


def test_consent_stores_the_version_and_first_time(as_parent: TestClient, child: Child) -> None:
    screening = start(as_parent, child.id, consent=False)
    url = f"{SCREENINGS}/{screening['id']}/consent"

    outdated = as_parent.post(url, json={"version": "screening-consent-0"})
    assert outdated.status_code == 409
    assert outdated.json()["error"]["code"] == "consent_outdated"

    first = as_parent.post(url, json={"version": CONSENT}).json()
    assert first["consent_version"] == CONSENT and first["consent_at"]
    again = as_parent.post(url, json={"version": CONSENT}).json()
    assert again["consent_at"] == first["consent_at"]


# --- answers ----------------------------------------------------------------------------------


def test_answers_are_saved_and_changed(as_parent: TestClient, child: Child) -> None:
    screening = start(as_parent, child.id)
    saved = answer(as_parent, screening["id"], "q01", "usually")
    assert saved.status_code == 200
    assert saved.json()["final"] is True
    answer(as_parent, screening["id"], "q01", "sometimes")

    # A reload (fresh GET) sees the latest answer, once.
    reloaded = as_parent.get(f"{SCREENINGS}/{screening['id']}").json()
    assert [(a["item_id"], a["option"]) for a in reloaded["answers"]] == [("q01", "sometimes")]
    assert reloaded["answered"] == 1


@pytest.mark.parametrize(
    ("item_id", "option", "code"),
    [
        ("q01", "sentences", "invalid_option"),  # another item type's card
        ("q01", "maybe", "invalid_option"),
        ("q13", "not_sure", "invalid_option"),  # not a q13 card without own words
        ("q01", "other", "other_needs_mapping"),
        ("q20", "other", "other_text_required"),
    ],
)
def test_invalid_answers(
    as_parent: TestClient, child: Child, item_id: str, option: str, code: str
) -> None:
    screening = start(as_parent, child.id)
    response = answer(as_parent, screening["id"], item_id, option)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == code


def test_items_above_the_childs_age_dont_exist(
    as_parent: TestClient, parent: User, make_child: MakeChild
) -> None:
    child = make_child(parent, dob=dob_months_ago(18))
    screening = start(as_parent, child.id)
    assert answer(as_parent, screening["id"], "q09", "usually").status_code == 404  # from 20 m
    assert answer(as_parent, screening["id"], "q99", "usually").status_code == 404


def test_q20_other_text_is_the_answer(as_parent: TestClient, child: Child) -> None:
    screening = start(as_parent, child.id)
    saved = answer(as_parent, screening["id"], "q20", "other", "  জন্মের সময় করা হয়েছিল  ")
    assert saved.status_code == 200
    body = saved.json()
    assert body["final"] is True
    assert body["other_text"] == "জন্মের সময় করা হয়েছিল"

    mapped = as_parent.post(
        f"{SCREENINGS}/{screening['id']}/answers/q20/map-other", json={"other_text": "x"}
    )
    assert mapped.json()["error"]["code"] == "other_not_mapped"


# --- "Other" answers --------------------------------------------------------------------------


def test_other_answer_is_mapped_then_confirmed(
    as_parent: TestClient, child: Child, monkeypatch: pytest.MonkeyPatch
) -> None:
    fake_mapper(monkeypatch, "sometimes")
    screening = start(as_parent, child.id)
    base = f"{SCREENINGS}/{screening['id']}/answers/q01"
    text = "খেলার সময় ডাকলে কখনো কখনো তাকায়"

    mapped = as_parent.post(f"{base}/map-other", json={"other_text": text})
    assert mapped.status_code == 200, mapped.text
    assert mapped.json() == {
        "status": "suggested",
        "option": "sometimes",
        "confidence": 0.8,
        "reason": "বুঝেছি।",
    }

    # Waiting for confirmation: kept (survives a reload) but doesn't count yet.
    pending = as_parent.get(f"{SCREENINGS}/{screening['id']}").json()
    assert pending["answered"] == 0
    stored = pending["answers"][0]
    assert (stored["option"], stored["other_text"], stored["final"]) == ("other", text, False)
    assert stored["ai_mapping"]["option"] == "sometimes"

    confirmed = answer(as_parent, screening["id"], "q01", "sometimes", text).json()
    assert confirmed["final"] and confirmed["mapped_by_ai"]
    assert confirmed["other_text"] == text


def test_choosing_another_card_isnt_an_ai_mapping(
    as_parent: TestClient, child: Child, monkeypatch: pytest.MonkeyPatch
) -> None:
    fake_mapper(monkeypatch, "sometimes")
    screening = start(as_parent, child.id)
    text = "only with grandma"
    as_parent.post(
        f"{SCREENINGS}/{screening['id']}/answers/q01/map-other", json={"other_text": text}
    )
    changed = answer(as_parent, screening["id"], "q01", "rarely", text).json()
    assert changed["mapped_by_ai"] is False
    assert changed["ai_mapping"]["option"] == "sometimes"  # kept for the doctor report

    # New words drop the old suggestion; a plain card drops the words.
    edited = answer(as_parent, screening["id"], "q01", "rarely", "never with anyone").json()
    assert edited["ai_mapping"] is None
    plain = answer(as_parent, screening["id"], "q01", "usually").json()
    assert plain["other_text"] is None and plain["ai_mapping"] is None


def test_without_ai_the_parent_picks_or_says_not_sure(as_parent: TestClient, child: Child) -> None:
    screening = start(as_parent, child.id)
    text = "সে কথা বলে, তবে নিজের মতো করে"
    mapped = as_parent.post(
        f"{SCREENINGS}/{screening['id']}/answers/q13/map-other", json={"other_text": text}
    )
    assert mapped.json()["status"] == "unavailable"
    # q13 has no "Not sure" card, but it is the fallback for own words that fit no card.
    fallback = answer(as_parent, screening["id"], "q13", "not_sure", text)
    assert fallback.status_code == 200
    assert fallback.json()["final"] is True


def test_map_other_validates_the_text(as_parent: TestClient, child: Child) -> None:
    screening = start(as_parent, child.id)
    url = f"{SCREENINGS}/{screening['id']}/answers/q01/map-other"
    assert as_parent.post(url, json={"other_text": "   "}).status_code == 422
    assert as_parent.post(url, json={"other_text": "x" * 1001}).status_code == 422


# --- completing Part 1 ------------------------------------------------------------------------


def test_complete_needs_every_item_then_keeps_the_note(
    as_parent: TestClient, child: Child, monkeypatch: pytest.MonkeyPatch
) -> None:
    fake_mapper(monkeypatch, "usually")
    screening = start(as_parent, child.id)
    sid = screening["id"]
    url = f"{SCREENINGS}/{sid}/questionnaire"
    for item in screening["items"][:-1]:
        answer(as_parent, sid, item["id"], calm_option(item))

    missing = as_parent.post(url, json={})
    assert missing.status_code == 409
    assert missing.json()["error"]["detail"] == {"item_id": "q20"}

    answer(as_parent, sid, "q20", "not_sure")
    # An unconfirmed "Other" answer doesn't count.
    as_parent.post(f"{SCREENINGS}/{sid}/answers/q05/map-other", json={"other_text": "হ্যাঁ"})
    assert as_parent.post(url, json={}).json()["error"]["detail"] == {"item_id": "q05"}
    answer(as_parent, sid, "q05", "usually", "হ্যাঁ")

    done = as_parent.post(url, json={"note": "  রাতে ঘুম কম হয়।  "})
    assert done.status_code == 200, done.text
    body = done.json()
    assert body["questionnaire_completed_at"]
    assert body["parent_note"] == "রাতে ঘুম কম হয়।"
    assert (body["answered"], body["total"]) == (20, 20)

    blank = as_parent.post(url, json={"note": "   "}).json()
    assert blank["parent_note"] is None


def test_finalized_screenings_are_read_only(
    as_parent: TestClient, child: Child, db: Session
) -> None:
    screening = start(as_parent, child.id)
    db.get(Screening, screening["id"]).status = ScreeningStatus.finalized
    db.commit()
    for response in (
        answer(as_parent, screening["id"], "q01", "usually"),
        as_parent.post(f"{SCREENINGS}/{screening['id']}/consent", json={"version": CONSENT}),
        as_parent.post(f"{SCREENINGS}/{screening['id']}/questionnaire", json={}),
    ):
        assert response.status_code == 409
        assert response.json()["error"]["code"] == "screening_finalized"


def test_child_screening_list_shows_progress(as_parent: TestClient, child: Child) -> None:
    screening = start(as_parent, child.id)
    answer(as_parent, screening["id"], "q01", "usually")
    answer(as_parent, screening["id"], "q02", "rarely")
    [summary] = as_parent.get(f"/api/v1/children/{child.id}/screenings").json()
    assert summary["id"] == screening["id"]
    assert (summary["answered"], summary["total"]) == (2, 20)
    assert summary["questionnaire_completed_at"] is None
