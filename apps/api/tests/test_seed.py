from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import User
from app.seed.users import DEMO_PASSWORD, seed_users

DEMO_LOGINS = {
    "admin@demo.bd": "admin",
    "parent@demo.bd": "parent",
    "teacher@demo.bd": "teacher",
    "teacher2@demo.bd": "teacher",
    "doctor@demo.bd": "specialist",
}


def test_seed_is_idempotent(db: Session) -> None:
    assert seed_users(db) == 5
    assert seed_users(db) == 0
    assert db.scalar(select(func.count()).select_from(User)) == 5


def test_every_demo_account_logs_in_with_demo_password(db: Session, client: TestClient) -> None:
    seed_users(db)
    for email, role in DEMO_LOGINS.items():
        response = client.post(
            "/api/v1/auth/login", json={"identifier": email, "password": DEMO_PASSWORD}
        )
        assert response.status_code == 200, email
        user = response.json()
        assert user["role"] == role
        # The demo goes straight in; the forced change is shown with a newly created specialist.
        assert user["must_change_password"] is False


def test_demo_specialist_is_verified_and_teachers_have_schools(db: Session) -> None:
    seed_users(db)
    doctor = db.scalar(select(User).where(User.email == "doctor@demo.bd"))
    assert doctor is not None and doctor.verified and doctor.registration_no
    for email in ("teacher@demo.bd", "teacher2@demo.bd"):
        teacher = db.scalar(select(User).where(User.email == email))
        assert teacher is not None and teacher.organisation
