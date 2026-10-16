"""Demo accounts (CLAUDE.md §10). Fictional people; password `demo1234` for all, POC only."""

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models import Role, User

DEMO_PASSWORD = "demo1234"

DEMO_USERS: list[dict[str, Any]] = [
    {"email": "admin@demo.bd", "role": Role.admin, "name": "Shohojatri Admin"},
    {"email": "parent@demo.bd", "role": Role.parent, "name": "Farhana Akter"},
    {
        "email": "teacher@demo.bd",
        "role": Role.teacher,
        "name": "Nasrin Sultana",
        "organisation": "Alor Poth Special School (Sample)",
    },
    {
        "email": "teacher2@demo.bd",
        "role": Role.teacher,
        "name": "Rumana Islam",
        "organisation": "Shishu Bikash Special School (Sample)",
    },
    {
        "email": "doctor@demo.bd",
        "role": Role.specialist,
        "name": "Dr. Tanvir Ahmed",
        "specialty": "Child neurodevelopment",
        "registration_no": "SAMPLE-0001",
        "organisation": "Sample Child Development Centre",
        # Admin-onboarded, and already past the first-login password change so the demo
        # can log straight in.
        "verified": True,
    },
]


def seed_users(db: Session) -> int:
    """Creates any demo account that doesn't exist yet. Returns how many were created."""
    password_hash = hash_password(DEMO_PASSWORD)
    created = 0
    for fields in DEMO_USERS:
        if db.scalar(select(User.id).where(User.email == fields["email"])):
            continue
        db.add(User(password_hash=password_hash, **fields))
        created += 1
    db.commit()
    return created
