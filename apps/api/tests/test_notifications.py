from collections.abc import Callable

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.notifications import notify
from app.models import NotificationKind, Role
from tests.conftest import MakeUser

NOTIFICATIONS = "/api/v1/notifications"


def test_list_mark_read_and_read_all(
    db: Session, make_user: MakeUser, client_for: Callable[[str], TestClient]
) -> None:
    parent = make_user(Role.parent)
    teacher = make_user(Role.teacher)
    for name in ("A", "B"):
        notify(
            db,
            parent.id,
            NotificationKind.access_request_received,
            child_id=1,
            child_name="Rafi",
            requester_name=name,
            requester_role="teacher",
        )
    notify(db, teacher.id, NotificationKind.access_request_declined, child_code="SJ-7K3QX")
    db.commit()

    client = client_for("parent@test.bd")
    listing = client.get(NOTIFICATIONS).json()
    assert listing["unread"] == 2
    newest, oldest = listing["items"]
    assert newest["payload"]["requester_name"] == "B"
    assert newest["read_at"] is None

    assert client.post(f"{NOTIFICATIONS}/{newest['id']}/read").status_code == 200
    assert client.get(NOTIFICATIONS).json()["unread"] == 1

    # Someone else's notification doesn't exist for you.
    teacher_client = client_for("teacher@test.bd")
    assert teacher_client.post(f"{NOTIFICATIONS}/{oldest['id']}/read").status_code == 404

    assert client.post(f"{NOTIFICATIONS}/read-all").status_code == 200
    assert client.get(NOTIFICATIONS).json()["unread"] == 0
    assert teacher_client.get(NOTIFICATIONS).json()["unread"] == 1
