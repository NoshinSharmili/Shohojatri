from collections.abc import Callable
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dates import today_bd
from app.models import AccessGrant, AuditLog, Child, GrantScope, Role
from app.models.base import utcnow
from tests.conftest import MakeChild, MakeUser

CHILDREN = "/api/v1/children"


def test_parent_adds_a_child_with_a_fresh_child_id(
    client: TestClient, make_user: MakeUser, login: Callable[[str], TestClient]
) -> None:
    make_user(Role.parent)
    login("parent@test.bd")
    response = client.post(CHILDREN, json={"name": "  Rafi ", "dob": "2023-08-05", "sex": "male"})
    assert response.status_code == 201, response.text
    child = response.json()
    assert child["name"] == "Rafi"
    assert child["status"] == "screening"
    assert child["access"] == "parent"
    assert child["code"].startswith("SJ-") and len(child["code"]) == 8
    assert child["age_months"] >= 0

    assert [c["id"] for c in client.get(CHILDREN).json()] == [child["id"]]


@pytest.mark.parametrize(
    ("body", "code"),
    [
        ({"name": "", "dob": "2023-08-05"}, "validation_error"),
        ({"name": "Rafi", "dob": "not a date"}, "validation_error"),
        ({"name": "Rafi", "dob": "2023-08-05", "sex": "other"}, "validation_error"),
        ({"name": "Rafi", "dob": str(today_bd() + timedelta(days=1))}, "dob_in_future"),
    ],
)
def test_create_child_validation(
    client: TestClient,
    make_user: MakeUser,
    login: Callable[[str], TestClient],
    body: dict[str, str],
    code: str,
) -> None:
    make_user(Role.parent)
    login("parent@test.bd")
    response = client.post(CHILDREN, json=body)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == code


@pytest.mark.parametrize("role", [Role.teacher, Role.specialist, Role.admin])
def test_only_parents_add_children(
    client: TestClient, make_user: MakeUser, login: Callable[[str], TestClient], role: Role
) -> None:
    make_user(role, email="someone@test.bd")
    login("someone@test.bd")
    response = client.post(CHILDREN, json={"name": "Rafi", "dob": "2023-08-05"})
    assert response.status_code == 403


def test_children_list_is_per_viewer_and_hides_the_code_from_members(
    db: Session,
    make_user: MakeUser,
    make_child: MakeChild,
    client_for: Callable[[str], TestClient],
) -> None:
    parent = make_user(Role.parent)
    other_parent = make_user(Role.parent, email="other@test.bd")
    teacher = make_user(Role.teacher)
    rafi = make_child(parent, name="Rafi")
    make_child(parent, name="Nuha")
    make_child(other_parent, name="Someone else")
    make_child(parent, name="Deleted", deleted_at=utcnow())
    db.add(AccessGrant(child_id=rafi.id, user_id=teacher.id, scope=GrantScope.education))
    db.commit()

    as_parent = client_for("parent@test.bd").get(CHILDREN).json()
    assert [c["name"] for c in as_parent] == ["Rafi", "Nuha"]
    assert all(c["code"] for c in as_parent)

    as_teacher = client_for("teacher@test.bd").get(CHILDREN).json()
    assert [c["name"] for c in as_teacher] == ["Rafi"]
    assert as_teacher[0]["code"] is None
    assert as_teacher[0]["access"] == "education"
    assert as_teacher[0]["member_since"] is not None
    # Seeing the card is a profile read by a non-parent, so it is audited.
    rows = db.scalars(select(AuditLog).where(AuditLog.actor_id == teacher.id)).all()
    assert [(r.child_id, r.action, r.resource) for r in rows] == [(rafi.id, "read", "profile")]

    make_user(Role.admin)
    assert client_for("admin@test.bd").get(CHILDREN).status_code == 403


def test_get_child_respects_ownership(
    make_user: MakeUser, make_child: MakeChild, client_for: Callable[[str], TestClient]
) -> None:
    parent = make_user(Role.parent)
    make_user(Role.parent, email="other@test.bd")
    child = make_child(parent)
    assert client_for("parent@test.bd").get(f"{CHILDREN}/{child.id}").status_code == 200
    # Someone else's child looks exactly like a missing one.
    other = client_for("other@test.bd")
    assert other.get(f"{CHILDREN}/{child.id}").json() == other.get(f"{CHILDREN}/999").json()


def test_regenerated_code_stops_new_requests_but_keeps_members(
    db: Session,
    make_user: MakeUser,
    make_child: MakeChild,
    client_for: Callable[[str], TestClient],
) -> None:
    parent = make_user(Role.parent)
    teacher = make_user(Role.teacher)
    make_user(Role.specialist)
    child = make_child(parent)
    old_code = child.code
    db.add(AccessGrant(child_id=child.id, user_id=teacher.id, scope=GrantScope.education))
    db.commit()

    as_parent = client_for("parent@test.bd")
    response = as_parent.post(f"{CHILDREN}/{child.id}/regenerate-code")
    assert response.status_code == 200
    new_code = response.json()["code"]
    assert new_code != old_code
    assert as_parent.get(f"{CHILDREN}/{child.id}").json()["code"] == new_code

    # The teacher keeps access; a request with the old code reaches no one.
    assert client_for("teacher@test.bd").get(f"{CHILDREN}/{child.id}").status_code == 200
    specialist = client_for("specialist@test.bd")
    specialist.post("/api/v1/access-requests", json={"child_code": old_code})
    assert as_parent.get(f"{CHILDREN}/{child.id}/access-requests").json() == []
    specialist.post("/api/v1/access-requests", json={"child_code": new_code})
    assert len(as_parent.get(f"{CHILDREN}/{child.id}/access-requests").json()) == 1

    # Only the parent can regenerate.
    teacher_try = client_for("teacher@test.bd").post(f"{CHILDREN}/{child.id}/regenerate-code")
    assert teacher_try.status_code == 403
    refreshed = db.get(Child, child.id)
    db.refresh(refreshed)
    assert refreshed is not None and refreshed.code == new_code
