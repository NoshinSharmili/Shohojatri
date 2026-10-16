"""Screening Part 2 uploads, finalize, reports, share links and demo mode (SCREENING_SPEC §5-§7,
§9, API §10)."""

import hashlib
from collections.abc import Callable
from datetime import timedelta
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.limits import TASK_UPLOAD_MAX_BYTES
from app.models import (
    AccessGrant,
    AuditLog,
    Child,
    GrantScope,
    ReportShare,
    Role,
    Screening,
    ScreeningTask,
    User,
)
from app.models.base import utcnow
from tests.conftest import MakeChild, MakeUser
from tests.test_screenings import SCREENINGS, answer, calm_option, dob_months_ago, start

ClientFor = Callable[[str], TestClient]
DEMO_ORDER = ("calibration", "rtn", "joint_attention", "imitation", "gaze_preference", "free_play")
CONCERN_ITEMS = {"q15", "q16", "q17", "q18"}


@pytest.fixture
def parent(make_user: MakeUser) -> User:
    return make_user(Role.parent)


@pytest.fixture
def child(parent: User, make_child: MakeChild) -> Child:
    return make_child(parent, name="Rafi", dob=dob_months_ago(36))


@pytest.fixture
def as_parent(parent: User, client_for: ClientFor) -> TestClient:
    return client_for("parent@test.bd")


def worried_option(item: dict[str, Any]) -> str:
    if item["type"] == "freq":
        return "usually" if item["id"] in CONCERN_ITEMS else "rarely"
    return {"communication": "single_words", "regression": "no"}.get(item["type"], "no")


def calm(item: dict[str, Any]) -> str:
    return "rarely" if item["id"] in CONCERN_ITEMS else calm_option(item)


def part_one(
    client: TestClient, child_id: int, pick: Callable[[dict[str, Any]], str] = calm
) -> dict[str, Any]:
    """A screening with consent, every question answered and Part 1 completed."""
    screening = start(client, child_id)
    for item in screening["items"]:
        assert answer(client, screening["id"], item["id"], pick(item)).status_code == 200
    done = client.post(f"{SCREENINGS}/{screening['id']}/questionnaire", json={"note": "ঘুম কম"})
    assert done.status_code == 200, done.text
    return done.json()


def demo_task(client: TestClient, fixture_task: str, profile: str = "elevated") -> dict[str, Any]:
    response = client.get(f"/api/v1/demo/screening-tasks/{fixture_task}?profile={profile}")
    assert response.status_code == 200, response.text
    return response.json()


def replay(client: TestClient, screening_id: int, fixture_task: str, profile: str) -> Any:
    demo = demo_task(client, fixture_task, profile)
    return client.post(f"{SCREENINGS}/{screening_id}/tasks/{demo['task']}", json=demo["upload"])


def finalize(client: TestClient, screening_id: int) -> dict[str, Any]:
    response = client.post(f"{SCREENINGS}/{screening_id}/finalize")
    assert response.status_code == 200, response.text
    return response.json()


# --- finalize ---------------------------------------------------------------------------------


def test_questionnaire_only_screening_gets_a_low_confidence_result(
    as_parent: TestClient, child: Child
) -> None:
    screening = finalize(as_parent, part_one(as_parent, child.id)["id"])
    result = screening["result"]
    assert screening["status"] == "finalized" and screening["finalized_at"]
    assert (screening["score"], screening["risk_class"]) == (0, "low")
    assert result["risk_class"] == "low" and result["confidence"] == "low"
    assert [c["name"] for c in result["components"]] == ["questionnaire"]
    # Never-uploaded activities are listed as skipped, not counted as concern.
    assert {(t["task"], t["reason"]) for t in result["excluded_tasks"]} == {
        (task, "skipped") for task in DEMO_ORDER[1:]
    }
    assert result["recommendations"] == ["recommendations.class.low"]
    assert result["strengths"]  # a calm child's answers give strengths
    assert screening["is_demo"] is False


def test_finalize_needs_part_one_completed(as_parent: TestClient, child: Child) -> None:
    screening = start(as_parent, child.id)
    response = as_parent.post(f"{SCREENINGS}/{screening['id']}/finalize")
    assert response.status_code == 409
    assert response.json()["error"]["detail"] == {"item_id": "q01"}


def test_finalize_refuses_a_pending_other_answer(
    as_parent: TestClient, child: Child, monkeypatch: pytest.MonkeyPatch
) -> None:
    screening = part_one(as_parent, child.id)
    # Back on a question after completing Part 1: own words waiting for confirmation.
    from tests.test_screenings import fake_mapper

    fake_mapper(monkeypatch, "sometimes")
    mapped = as_parent.post(
        f"{SCREENINGS}/{screening['id']}/answers/q02/map-other", json={"other_text": "মাঝে মাঝে"}
    )
    assert mapped.status_code == 200
    response = as_parent.post(f"{SCREENINGS}/{screening['id']}/finalize")
    assert response.status_code == 409
    assert response.json()["error"] == {
        "code": "questionnaire_incomplete",
        "message_key": "errors.questionnaire_incomplete",
        "detail": {"item_id": "q02"},
    }


def test_a_finalized_screening_is_read_only(as_parent: TestClient, child: Child) -> None:
    screening_id = finalize(as_parent, part_one(as_parent, child.id)["id"])["id"]
    for method, path, body in [
        ("POST", "finalize", None),
        ("POST", "tasks/rtn", demo_task(as_parent, "rtn")["upload"]),
        ("POST", "tasks/rtn/skip", None),
        ("PUT", "answers/q01", {"option": "usually"}),
    ]:
        response = as_parent.request(method, f"{SCREENINGS}/{screening_id}/{path}", json=body)
        assert response.status_code == 409, path
        assert response.json()["error"]["code"] == "screening_finalized"


@pytest.mark.parametrize(
    ("profile", "pick", "risk_class", "confidence"),
    [
        ("typical", calm, "low", "high"),
        ("elevated", worried_option, "high", "high"),
        ("noisy", calm, "low", "low"),
    ],
)
def test_demo_screening_end_to_end(
    as_parent: TestClient,
    child: Child,
    profile: str,
    pick: Callable[[dict[str, Any]], str],
    risk_class: str,
    confidence: str,
) -> None:
    screening_id = part_one(as_parent, child.id, pick)["id"]
    for task in DEMO_ORDER:
        response = replay(as_parent, screening_id, task, profile)
        assert response.status_code == 200, response.text
        assert response.json()["demo"] is True

    screening = finalize(as_parent, screening_id)
    result = screening["result"]
    assert screening["is_demo"] is True
    assert (result["risk_class"], result["confidence"]) == (risk_class, confidence)
    assert {t["task"] for t in result["tasks"]} == set(DEMO_ORDER[1:])
    if profile == "elevated":
        assert len(result["top_concerns"]) == 3
        assert "recommendations.hearing_test" in result["recommendations"]
    if profile == "noisy":
        # Calibration fell back in the dim room, so the gaze tasks are low quality.
        calibration = screening["tasks"][0]
        assert (calibration["task"], calibration["status"]) == ("calibration", "fallback")


def test_calibration_upload_reports_ok_or_fallback(as_parent: TestClient, child: Child) -> None:
    screening_id = part_one(as_parent, child.id)["id"]
    ok = replay(as_parent, screening_id, "calibration", "typical").json()
    assert (ok["status"], ok["reason"]) == ("ok", None)
    fallback = replay(as_parent, screening_id, "calibration", "noisy").json()
    assert fallback["status"] == "fallback" and fallback["reason"]
    # Re-uploading replaces the task: one row per task.
    tasks = as_parent.get(f"{SCREENINGS}/{screening_id}").json()["tasks"]
    assert [t["task"] for t in tasks] == ["calibration"]


def test_gaze_tasks_without_calibration_use_the_fallback(
    as_parent: TestClient, child: Child
) -> None:
    screening_id = part_one(as_parent, child.id)["id"]
    skipped = as_parent.post(f"{SCREENINGS}/{screening_id}/tasks/calibration/skip").json()
    assert (skipped["status"], skipped["reason"]) == ("fallback", "skipped")
    replay(as_parent, screening_id, "gaze_preference", "typical")
    result = finalize(as_parent, screening_id)["result"]
    gaze = next(t for t in result["tasks"] if t["task"] == "gaze_preference")
    assert gaze["quality"]["calibration"] == "fallback"
    assert gaze["status"] == "low"


def test_finalize_rescores_with_the_final_calibration(as_parent: TestClient, child: Child) -> None:
    """A gaze task uploaded before the calibration retry is scored again at finalize."""
    screening_id = part_one(as_parent, child.id)["id"]
    replay(as_parent, screening_id, "calibration", "noisy")
    at_upload = replay(as_parent, screening_id, "joint_attention", "typical").json()
    assert at_upload["status"] == "low"  # fallback calibration
    replay(as_parent, screening_id, "calibration", "typical")
    result = finalize(as_parent, screening_id)["result"]
    ja = next(t for t in result["tasks"] if t["task"] == "joint_attention")
    assert (ja["status"], ja["quality"]["calibration"]) == ("ok", "ok")


def test_skipped_task_is_excluded(as_parent: TestClient, child: Child) -> None:
    screening_id = part_one(as_parent, child.id)["id"]
    replay(as_parent, screening_id, "rtn", "typical")
    skipped = as_parent.post(f"{SCREENINGS}/{screening_id}/tasks/rtn/skip").json()
    assert (skipped["task"], skipped["status"], skipped["reason"]) == (
        "rtn",
        "inconclusive",
        "skipped",
    )
    result = finalize(as_parent, screening_id)["result"]
    assert "rtn" not in [c["name"] for c in result["components"]]


def test_live_joint_attention_is_scored_as_the_live_variant(
    as_parent: TestClient, child: Child
) -> None:
    screening_id = part_one(as_parent, child.id)["id"]
    demo = demo_task(as_parent, "joint_attention_live", "typical")
    assert (demo["task"], demo["upload"]["variant"]) == ("joint_attention", "live")
    uploaded = as_parent.post(
        f"{SCREENINGS}/{screening_id}/tasks/joint_attention", json=demo["upload"]
    ).json()
    assert (uploaded["variant"], uploaded["status"]) == ("live", "ok")
    result = finalize(as_parent, screening_id)["result"]
    ja = next(t for t in result["tasks"] if t["task"] == "joint_attention")
    assert ja["metrics"]["variant"] == "live"


def test_variant_only_on_tasks_that_have_one(as_parent: TestClient, child: Child) -> None:
    screening_id = part_one(as_parent, child.id)["id"]
    upload = demo_task(as_parent, "rtn")["upload"] | {"variant": "live"}
    response = as_parent.post(f"{SCREENINGS}/{screening_id}/tasks/rtn", json=upload)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_variant"


def test_frames_are_stored_in_time_order(as_parent: TestClient, child: Child, db: Session) -> None:
    screening_id = part_one(as_parent, child.id)["id"]
    upload = demo_task(as_parent, "rtn", "typical")["upload"]
    shuffled = upload | {"frames": upload["frames"][::-1], "markers": upload["markers"][::-1]}
    reversed_result = as_parent.post(f"{SCREENINGS}/{screening_id}/tasks/rtn", json=shuffled)
    assert reversed_result.json()["status"] == "ok"
    row = db.scalar(select(ScreeningTask).where(ScreeningTask.screening_id == screening_id))
    assert row is not None and row.payload_json is not None
    times = [f["t"] for f in row.payload_json["frames"]]
    assert times == sorted(times)


def test_unknown_task_and_bad_frames_are_rejected(as_parent: TestClient, child: Child) -> None:
    screening_id = part_one(as_parent, child.id)["id"]
    unknown = as_parent.post(f"{SCREENINGS}/{screening_id}/tasks/dance", json={"frames": []})
    assert unknown.status_code == 422
    # Extra fields are refused: nothing but the §4.1 features is accepted.
    video = as_parent.post(
        f"{SCREENINGS}/{screening_id}/tasks/rtn", json={"frames": [{"t": 0, "jpeg": "…"}]}
    )
    assert video.status_code == 422


def test_task_payloads_over_5_mb_are_refused(as_parent: TestClient, child: Child) -> None:
    screening_id = part_one(as_parent, child.id)["id"]
    url = f"{SCREENINGS}/{screening_id}/tasks/free_play"
    big = b'{"frames": [' + b" " * TASK_UPLOAD_MAX_BYTES + b"]}"
    response = as_parent.post(url, content=big, headers={"content-type": "application/json"})
    assert response.status_code == 413
    assert response.json()["error"]["code"] == "payload_too_large"

    def chunks() -> Any:
        yield b'{"frames": []}'

    # Without a declared length the size can't be checked up front.
    unsized = as_parent.post(url, content=chunks(), headers={"content-type": "application/json"})
    assert unsized.status_code == 411
    assert unsized.json()["error"]["code"] == "length_required"


def test_uploads_need_consent(as_parent: TestClient, child: Child) -> None:
    screening = start(as_parent, child.id, consent=False)
    response = replay(as_parent, screening["id"], "rtn", "typical")
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "consent_required"


def test_home_summaries_carry_the_result(as_parent: TestClient, child: Child) -> None:
    finalize(as_parent, part_one(as_parent, child.id)["id"])
    [summary] = as_parent.get(f"/api/v1/children/{child.id}/screenings").json()
    assert (summary["status"], summary["score"], summary["risk_class"]) == ("finalized", 0, "low")


def test_deleting_a_screening_removes_tasks_and_shares(
    as_parent: TestClient, child: Child, db: Session
) -> None:
    screening_id = part_one(as_parent, child.id)["id"]
    replay(as_parent, screening_id, "rtn", "typical")
    finalize(as_parent, screening_id)
    as_parent.post(f"{SCREENINGS}/{screening_id}/shares", json={})
    assert as_parent.delete(f"{SCREENINGS}/{screening_id}").status_code == 200
    assert db.scalars(select(ScreeningTask)).all() == []
    assert db.scalars(select(ReportShare)).all() == []


# --- who may do what ----------------------------------------------------------------------------


@pytest.fixture
def finalized(as_parent: TestClient, child: Child) -> int:
    screening_id = part_one(as_parent, child.id)["id"]
    replay(as_parent, screening_id, "rtn", "elevated")
    return int(finalize(as_parent, screening_id)["id"])


def grant(db: Session, child: Child, user: User, scope: GrantScope) -> None:
    db.add(AccessGrant(child_id=child.id, user_id=user.id, scope=scope))
    db.commit()


def test_an_approved_specialist_reads_the_reports_but_cannot_change_or_share(
    finalized: int, child: Child, db: Session, make_user: MakeUser, client_for: ClientFor
) -> None:
    doctor = make_user(Role.specialist, email="doc@test.bd")
    grant(db, child, doctor, GrantScope.clinical)
    as_doctor = client_for("doc@test.bd")

    report = as_doctor.get(f"{SCREENINGS}/{finalized}/report?audience=clinician")
    assert report.status_code == 200
    assert report.json()["items"]
    audited = db.scalars(select(AuditLog).where(AuditLog.actor_id == doctor.id)).all()
    assert [(a.action, a.resource) for a in audited] == [("read", "screenings")]

    for method, path in [
        ("POST", "shares"),
        ("GET", "shares"),
        ("POST", "tasks/rtn/skip"),
        ("POST", "finalize"),
    ]:
        response = as_doctor.request(method, f"{SCREENINGS}/{finalized}/{path}", json={})
        assert response.status_code == 403, path


@pytest.mark.parametrize("role", [Role.teacher, Role.parent])
def test_others_cannot_see_the_report(
    finalized: int,
    child: Child,
    db: Session,
    make_user: MakeUser,
    client_for: ClientFor,
    role: Role,
) -> None:
    other = make_user(role, email="other@test.bd")
    if role == Role.teacher:
        # Even an approved teacher: screening results are clinical (COMPANION_SPEC §3.2).
        grant(db, child, other, GrantScope.education)
    client = client_for("other@test.bd")
    response = client.get(f"{SCREENINGS}/{finalized}/report")
    assert response.status_code == (403 if role == Role.teacher else 404)


def test_demo_tasks_are_for_parents(make_user: MakeUser, client_for: ClientFor) -> None:
    make_user(Role.teacher, email="teacher@test.bd")
    response = client_for("teacher@test.bd").get("/api/v1/demo/screening-tasks/rtn")
    assert response.status_code == 403


# --- reports ------------------------------------------------------------------------------------


def test_reports_need_a_finalized_screening(as_parent: TestClient, child: Child) -> None:
    screening_id = part_one(as_parent, child.id)["id"]
    for method, path in [("GET", "report"), ("POST", "shares")]:
        response = as_parent.request(method, f"{SCREENINGS}/{screening_id}/{path}", json={})
        assert response.status_code == 409
        assert response.json()["error"]["code"] == "screening_not_finalized"


def test_clinician_report_has_the_questionnaire_and_capture_details(
    finalized: int, as_parent: TestClient, db: Session
) -> None:
    report = as_parent.get(f"{SCREENINGS}/{finalized}/report?audience=clinician").json()
    screening = db.get(Screening, finalized)
    assert screening is not None and screening.finalized_at is not None
    assert report["report_no"] == f"SJ-{screening.finalized_at:%y%m}-{finalized:04d}"
    assert report["child"] == {"name": "Rafi", "dob": report["child"]["dob"], "sex": None}
    assert (report["age_months"], report["informant"]) == (36, "mother")
    assert report["parent_note"] == "ঘুম কম"
    assert [i["number"] for i in report["items"]] == list(range(1, 21))
    q01 = report["items"][0]
    assert (q01["item_id"], q01["critical"], q01["option"], q01["concern"]) == (
        "q01",
        True,
        "usually",
        0,
    )
    [rtn] = report["tasks"]
    assert rtn["task"] == "rtn" and rtn["demo"] and rtn["device"]["camera"] == "front"
    assert rtn["quality"] == {"mean_luma": 128, "noise_db": -48}
    assert [b["max_score"] for b in report["score_bands"]] == [20, 45, 70, 100]
    assert report["weights"]["questionnaire"] == 0.45
    assert report["is_demo"] is True


def test_parent_report_leaves_out_the_clinician_detail(
    finalized: int, as_parent: TestClient
) -> None:
    report = as_parent.get(f"{SCREENINGS}/{finalized}/report").json()
    assert report["audience"] == "parent"
    assert report["parent_note"] is None
    [rtn] = report["tasks"]
    assert rtn["device"] is None and rtn["quality"]["mean_luma"] == 128  # for "not enough light"
    assert len(report["items"]) == 20  # sources of the findings: domain and question number
    assert report["result"]["risk_class"]


def test_other_text_is_shown_verbatim_with_its_card(
    as_parent: TestClient, child: Child, monkeypatch: pytest.MonkeyPatch
) -> None:
    from tests.test_screenings import fake_mapper

    screening = start(as_parent, child.id)
    fake_mapper(monkeypatch, "sometimes")
    words = "ডাকলে মাঝে মাঝে তাকায়"
    as_parent.post(
        f"{SCREENINGS}/{screening['id']}/answers/q01/map-other", json={"other_text": words}
    )
    answer(as_parent, screening["id"], "q01", "sometimes", other_text=words)
    for item in screening["items"][1:]:
        answer(as_parent, screening["id"], item["id"], calm(item))
    as_parent.post(f"{SCREENINGS}/{screening['id']}/questionnaire", json={})
    finalize(as_parent, screening["id"])
    report = as_parent.get(f"{SCREENINGS}/{screening['id']}/report?audience=clinician").json()
    q01 = report["items"][0]
    assert (q01["option"], q01["other_text"], q01["mapped_by_ai"]) == ("sometimes", words, True)
    assert q01["concern"] == 0.5


# --- share links --------------------------------------------------------------------------------


def create_share(client: TestClient, screening_id: int, **body: Any) -> dict[str, Any]:
    response = client.post(f"{SCREENINGS}/{screening_id}/shares", json=body)
    assert response.status_code == 201, response.text
    return response.json()


def test_share_link_opens_the_doctor_report_without_login(
    finalized: int, as_parent: TestClient, client: TestClient, db: Session
) -> None:
    share = create_share(as_parent, finalized)
    assert len(share["token"]) >= 43  # 32 random bytes, URL-safe
    assert share["status"] == "active" and share["views"] == 0
    # Only the hash is stored.
    row = db.get(ReportShare, share["id"])
    assert row is not None
    assert row.token_hash == hashlib.sha256(share["token"].encode()).hexdigest()
    assert share["token"] not in row.token_hash
    assert row.expires_at - row.created_at == timedelta(days=30)

    for _ in range(2):
        opened = client.get(f"/api/v1/share/{share['token']}")
        assert opened.status_code == 200
    shared = opened.json()
    assert shared["report"]["audience"] == "clinician"
    assert shared["report"]["items"] and shared["report"]["child"]["name"] == "Rafi"

    [listed] = as_parent.get(f"{SCREENINGS}/{finalized}/shares").json()
    assert listed["views"] == 2 and listed["last_viewed_at"]
    assert "token" not in listed


def test_share_expiry_choices(finalized: int, as_parent: TestClient, db: Session) -> None:
    share = create_share(as_parent, finalized, expires_in_days=7)
    row = db.get(ReportShare, share["id"])
    assert row is not None and row.expires_at - row.created_at == timedelta(days=7)
    refused = as_parent.post(f"{SCREENINGS}/{finalized}/shares", json={"expires_in_days": 365})
    assert refused.status_code == 422


def test_revoked_and_expired_links_stop_working(
    finalized: int, as_parent: TestClient, client: TestClient, db: Session
) -> None:
    revoked, expired = create_share(as_parent, finalized), create_share(as_parent, finalized)
    response = as_parent.delete(f"/api/v1/shares/{revoked['id']}")
    assert response.status_code == 200 and response.json()["status"] == "revoked"
    row = db.get(ReportShare, expired["id"])
    assert row is not None
    row.expires_at = utcnow() - timedelta(minutes=1)
    db.commit()

    for share, code in [(revoked, "share_revoked"), (expired, "share_expired")]:
        response = client.get(f"/api/v1/share/{share['token']}")
        assert response.status_code == 410
        assert response.json()["error"]["code"] == code
    missing = client.get("/api/v1/share/not-a-real-token")
    assert missing.status_code == 404 and missing.json()["error"]["code"] == "share_not_found"
    statuses = [s["status"] for s in as_parent.get(f"{SCREENINGS}/{finalized}/shares").json()]
    assert statuses == ["expired", "revoked"]  # newest first


def test_only_the_parent_revokes(
    finalized: int, as_parent: TestClient, make_user: MakeUser, client_for: ClientFor
) -> None:
    share = create_share(as_parent, finalized)
    make_user(Role.parent, email="other@test.bd")
    response = client_for("other@test.bd").delete(f"/api/v1/shares/{share['id']}")
    assert response.status_code == 404


def test_a_deleted_childs_link_is_gone(
    finalized: int, as_parent: TestClient, client: TestClient, child: Child, db: Session
) -> None:
    share = create_share(as_parent, finalized)
    child.deleted_at = utcnow()
    db.commit()
    assert client.get(f"/api/v1/share/{share['token']}").status_code == 404
