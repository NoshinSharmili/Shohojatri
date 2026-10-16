"""Joining a care team by Child ID (COMPANION_SPEC §3.1)."""

from collections.abc import Callable
from dataclasses import dataclass
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.access_requests import DAILY_LIMIT
from app.models import AccessGrant, AccessRequest, Child, Role
from app.models.base import utcnow
from tests.conftest import MakeChild, MakeUser

REQUESTS = "/api/v1/access-requests"
UNKNOWN_CODE = "SJ-ZZZZZ"


@dataclass
class Team:
    child: Child
    parent: TestClient
    teacher: TestClient
    specialist: TestClient
    db: Session

    def incoming(self) -> list[dict[str, object]]:
        response = self.parent.get(f"/api/v1/children/{self.child.id}/access-requests")
        assert response.status_code == 200, response.text
        return response.json()  # type: ignore[no-any-return]


@pytest.fixture
def team(
    db: Session,
    make_user: MakeUser,
    make_child: MakeChild,
    client_for: Callable[[str], TestClient],
) -> Team:
    parent = make_user(Role.parent)
    make_user(Role.teacher, organisation="Test School")
    make_user(Role.specialist, registration_no="REG-1", verified=True)
    child = make_child(parent, name="Rafi")
    return Team(
        child=child,
        parent=client_for("parent@test.bd"),
        teacher=client_for("teacher@test.bd"),
        specialist=client_for("specialist@test.bd"),
        db=db,
    )


def ask(client: TestClient, code: str, message: str | None = None) -> TestClient:
    response = client.post(REQUESTS, json={"child_code": code, "message": message})
    assert response.status_code == 202, response.text
    return client


def approve(team: Team, **options: bool) -> dict[str, object]:
    [request] = team.incoming()
    response = team.parent.post(f"{REQUESTS}/{request['id']}/approve", json=options)
    assert response.status_code == 200, response.text
    return response.json()  # type: ignore[no-any-return]


def notifications(client: TestClient) -> list[dict[str, object]]:
    return client.get("/api/v1/notifications").json()["items"]  # type: ignore[no-any-return]


# --- no enumeration -------------------------------------------------------------------------


def test_response_and_own_list_look_the_same_for_real_and_unknown_codes(team: Team) -> None:
    real = team.teacher.post(REQUESTS, json={"child_code": team.child.code})
    unknown = team.teacher.post(REQUESTS, json={"child_code": UNKNOWN_CODE})
    assert (real.status_code, real.json()) == (unknown.status_code, unknown.json())
    assert real.status_code == 202

    mine = team.teacher.get(REQUESTS).json()
    assert [r["child_code"] for r in mine] == [UNKNOWN_CODE, team.child.code]
    assert {r["status"] for r in mine} == {"pending"}
    real_entry, unknown_entry = mine
    assert sorted(real_entry) == sorted(unknown_entry)
    # Nothing in a requester's view names the child.
    assert "Rafi" not in team.teacher.get(REQUESTS).text

    # Only the real one reaches the parent.
    assert [r["child_code"] for r in team.incoming()] == [team.child.code]
    assert [n["kind"] for n in notifications(team.parent)] == ["access_request_received"]


@pytest.mark.parametrize("code", ["", "SJ-123", "hello world", "SJ-UUUUU"])
def test_malformed_codes_are_rejected_with_a_field_error(team: Team, code: str) -> None:
    response = team.teacher.post(REQUESTS, json={"child_code": code})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_child_code"
    assert response.json()["error"]["detail"]["field"] == "child_code"


def test_codes_are_matched_however_they_were_typed(team: Team) -> None:
    ask(team.teacher, team.child.code.lower().replace("-", " "))
    assert len(team.incoming()) == 1


def test_asking_again_while_pending_sends_nothing_new(team: Team) -> None:
    for code in (team.child.code, team.child.code, UNKNOWN_CODE, UNKNOWN_CODE):
        ask(team.teacher, code)
    assert len(team.teacher.get(REQUESTS).json()) == 2
    assert len(team.incoming()) == 1
    assert len(notifications(team.parent)) == 1


def test_a_member_asking_again_creates_no_request(team: Team) -> None:
    ask(team.teacher, team.child.code)
    approve(team)
    ask(team.teacher, team.child.code)
    assert team.incoming() == []


@pytest.mark.parametrize("role", [Role.parent, Role.admin])
def test_only_teachers_and_specialists_request(
    team: Team, make_user: MakeUser, client_for: Callable[[str], TestClient], role: Role
) -> None:
    make_user(role, email="x@test.bd")
    client = client_for("x@test.bd")
    assert client.post(REQUESTS, json={"child_code": team.child.code}).status_code == 403
    assert client.get(REQUESTS).status_code == 403


# --- rate limit -----------------------------------------------------------------------------


def test_ten_requests_a_day_counting_unknown_codes(team: Team) -> None:
    codes = [f"SJ-{n:05d}" for n in range(DAILY_LIMIT - 1)] + [team.child.code]
    for code in codes:
        ask(team.teacher, code)

    for code in (team.child.code.replace("SJ-", "sj"), "SJ-YYYYY"):
        # The real code is already pending, so it's a repeat and costs nothing; a new one is over.
        response = team.teacher.post(REQUESTS, json={"child_code": code})
        if code == "SJ-YYYYY":
            assert response.status_code == 429
            assert response.json()["error"]["code"] == "access_request_limit"
            assert response.json()["error"]["detail"] == {"limit": DAILY_LIMIT}
        else:
            assert response.status_code == 202

    # Others aren't affected, and the limit rolls over after 24 hours.
    ask(team.specialist, "SJ-YYYYY")
    team.db.execute(update(AccessRequest).values(created_at=utcnow() - timedelta(hours=25)))
    team.db.commit()
    ask(team.teacher, "SJ-YYYYY")


def test_the_limit_answers_the_same_for_real_and_unknown_codes(team: Team, db: Session) -> None:
    for n in range(DAILY_LIMIT):
        ask(team.teacher, f"SJ-{n:05d}")
    real = team.teacher.post(REQUESTS, json={"child_code": team.child.code})
    unknown = team.teacher.post(REQUESTS, json={"child_code": UNKNOWN_CODE})
    assert (real.status_code, real.json()) == (unknown.status_code, unknown.json())
    assert team.incoming() == []


# --- deciding -------------------------------------------------------------------------------


def test_parent_sees_who_is_asking(team: Team) -> None:
    ask(team.specialist, team.child.code, "I'm Rafi's speech therapist.")
    [request] = team.incoming()
    assert request["message"] == "I'm Rafi's speech therapist."
    assert request["requester"] == {
        "id": request["requester"]["id"],  # type: ignore[index]
        "name": "Test specialist",
        "role": "specialist",
        "organisation": None,
        "specialty": None,
        "registration_no": "REG-1",
        "verified": True,
    }
    [note] = notifications(team.parent)
    assert note["payload"]["child_name"] == "Rafi"  # type: ignore[index]
    assert note["payload"]["requester_role"] == "specialist"  # type: ignore[index]


@pytest.mark.parametrize(
    ("who", "options", "medications", "documents"),
    [
        ("teacher", {}, False, False),
        ("teacher", {"share_medications": True, "share_documents": True}, True, True),
        ("specialist", {}, True, True),
        # Clinical scope always includes medications; documents can be unticked.
        ("specialist", {"share_medications": False, "share_documents": False}, True, False),
    ],
)
def test_approve_with_scope_options(
    team: Team, who: str, options: dict[str, bool], medications: bool, documents: bool
) -> None:
    member: TestClient = getattr(team, who)
    ask(member, team.child.code)
    grant = approve(team, **options)
    assert grant["scope"] == ("education" if who == "teacher" else "clinical")
    assert (grant["share_medications"], grant["share_documents"]) == (medications, documents)
    assert grant["can_add_logs"] is True

    assert team.incoming() == []
    assert member.get(REQUESTS).json()[0]["status"] == "approved"
    [card] = member.get("/api/v1/children").json()
    assert card["name"] == "Rafi" and card["code"] is None
    [note] = notifications(member)
    assert note["kind"] == "access_request_approved"
    assert note["payload"]["child_name"] == "Rafi"  # type: ignore[index]


def test_decline_tells_the_requester_without_naming_the_child(team: Team) -> None:
    ask(team.teacher, team.child.code)
    [request] = team.incoming()
    response = team.parent.post(f"{REQUESTS}/{request['id']}/decline")
    assert response.status_code == 200

    assert team.teacher.get(REQUESTS).json()[0]["status"] == "declined"
    assert team.teacher.get("/api/v1/children").json() == []
    [note] = notifications(team.teacher)
    assert note["kind"] == "access_request_declined"
    assert note["payload"]["child_code"] == team.child.code  # type: ignore[index]
    assert note["payload"]["child_name"] is None  # type: ignore[index]

    again = team.parent.post(f"{REQUESTS}/{request['id']}/approve", json={})
    assert again.status_code == 409
    assert again.json()["error"]["code"] == "request_not_pending"


def test_only_the_childs_parent_decides(
    team: Team, make_user: MakeUser, client_for: Callable[[str], TestClient]
) -> None:
    ask(team.teacher, team.child.code)
    ask(team.specialist, UNKNOWN_CODE)
    [request] = team.incoming()
    unmatched = team.specialist.get(REQUESTS).json()[0]
    make_user(Role.parent, email="other@test.bd")
    other_parent = client_for("other@test.bd")

    for client in (other_parent, team.teacher, team.specialist):
        for action in ("approve", "decline"):
            response = client.post(f"{REQUESTS}/{request['id']}/{action}", json={})
            assert response.status_code == 404, (action, response.text)
    # A request that matched no child has no one who could decide it.
    response = team.parent.post(f"{REQUESTS}/{unmatched['id']}/approve", json={})
    assert response.status_code == 404
    assert other_parent.get(f"/api/v1/children/{team.child.id}/access-requests").status_code == 404


def test_requests_expire_after_14_days(team: Team) -> None:
    ask(team.teacher, team.child.code)
    ask(team.teacher, UNKNOWN_CODE)
    [request] = team.incoming()
    team.db.execute(update(AccessRequest).values(created_at=utcnow() - timedelta(days=15)))
    team.db.commit()

    assert team.incoming() == []
    assert {r["status"] for r in team.teacher.get(REQUESTS).json()} == {"expired"}
    assert team.parent.get("/api/v1/children").json()[0]["pending_requests"] == 0
    response = team.parent.post(f"{REQUESTS}/{request['id']}/approve", json={})
    assert response.status_code == 409


def test_requester_can_cancel_a_pending_request(team: Team) -> None:
    ask(team.teacher, team.child.code)
    [mine] = team.teacher.get(REQUESTS).json()
    assert team.specialist.post(f"{REQUESTS}/{mine['id']}/cancel").status_code == 404

    response = team.teacher.post(f"{REQUESTS}/{mine['id']}/cancel")
    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"
    assert team.incoming() == []
    assert team.teacher.post(f"{REQUESTS}/{mine['id']}/cancel").status_code == 409


# --- members --------------------------------------------------------------------------------


def test_revoke_takes_effect_immediately(team: Team) -> None:
    ask(team.teacher, team.child.code)
    grant = approve(team)
    child_url = f"/api/v1/children/{team.child.id}"
    assert team.teacher.get(child_url).status_code == 200

    assert team.parent.delete(f"/api/v1/grants/{grant['id']}").status_code == 200
    assert team.teacher.get(child_url).status_code == 404
    assert team.teacher.get("/api/v1/children").json() == []
    assert team.parent.get(f"{child_url}/grants").json() == []
    assert team.parent.delete(f"/api/v1/grants/{grant['id']}").status_code == 404

    # They can ask again, and a new approval gives a new grant.
    ask(team.teacher, team.child.code)
    approve(team)
    assert team.teacher.get(child_url).status_code == 200
    grants = team.db.scalars(select(AccessGrant).where(AccessGrant.child_id == team.child.id))
    assert [g.revoked_at is None for g in grants] == [False, True]


def test_parent_changes_what_a_member_sees(team: Team) -> None:
    ask(team.teacher, team.child.code)
    grant = approve(team)
    url = f"/api/v1/grants/{grant['id']}"

    response = team.parent.patch(url, json={"share_documents": True})
    assert response.json()["share_documents"] is True
    assert response.json()["share_medications"] is False
    assert team.teacher.patch(url, json={"share_medications": True}).status_code == 403

    [member] = team.parent.get(f"/api/v1/children/{team.child.id}/grants").json()
    assert member["member"]["organisation"] == "Test School"
    assert member["share_documents"] is True


def test_activity_shows_who_did_what_and_folds_repeats(team: Team) -> None:
    ask(team.teacher, team.child.code)
    grant = approve(team)
    for _ in range(3):
        team.teacher.get(f"/api/v1/children/{team.child.id}")
    team.parent.patch(f"/api/v1/grants/{grant['id']}", json={"share_documents": True})

    activity = team.parent.get(f"/api/v1/children/{team.child.id}/activity").json()
    lines = [
        (a["actor"]["name"], a["action"], a["resource"], a["subject_name"], a["count"])
        for a in activity
    ]
    assert lines == [
        ("Test parent", "update", "grant", "Test teacher", 1),
        ("Test teacher", "read", "profile", None, 3),
        ("Test parent", "approve", "access_request", "Test teacher", 1),
        ("Test teacher", "request", "access_request", "Test teacher", 1),
    ]
    # Members can't see the audit trail.
    assert team.teacher.get(f"/api/v1/children/{team.child.id}/activity").status_code == 403
