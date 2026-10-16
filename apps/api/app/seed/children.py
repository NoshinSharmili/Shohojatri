"""Demo children and Rafi's care team (CLAUDE.md §10). Fictional; dates are relative to today so
the demo always looks current. Rows are built directly (not through notify/audit) so they can be
backdated into a believable history."""

from datetime import date, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dates import today_bd
from app.models import (
    AccessGrant,
    AccessRequest,
    AccessRequestStatus,
    AuditLog,
    Child,
    ChildStatus,
    GrantScope,
    Notification,
    NotificationKind,
    Role,
    Sex,
    User,
)
from app.models.base import utcnow

# Fixed codes so a pitch script can say "enter SJ-7K3QX". Rafi's is the one in the designs.
RAFI_CODE = "SJ-7K3QX"
NUHA_CODE = "SJ-4M8TD"


def seed_children(db: Session) -> int:
    """Creates the demo children once. Returns how many were created."""
    if db.scalar(select(Child.id).where(Child.code == RAFI_CODE)) is not None:
        return 0

    today = today_bd()
    now = utcnow()
    parent = _user(db, "parent@demo.bd")
    doctor = _user(db, "doctor@demo.bd")
    teacher = _user(db, "teacher@demo.bd")
    teacher2 = _user(db, "teacher2@demo.bd")

    # ≈ 38 months now; screened at ≈ 34 months, then diagnosed (diagnosis details come in B9).
    rafi = Child(
        code=RAFI_CODE,
        parent_id=parent.id,
        name="Rafi",
        dob=_months_ago(today, 38, day=5),
        sex=Sex.male,
        status=ChildStatus.companion,
        created_at=now - timedelta(days=125),
    )
    # The "no concern" path: one Low screening, no companion profile.
    nuha = Child(
        code=NUHA_CODE,
        parent_id=parent.id,
        name="Nuha",
        dob=_months_ago(today, 20, day=12),
        sex=Sex.female,
        status=ChildStatus.screening,
        created_at=now - timedelta(days=30),
    )
    db.add_all([rafi, nuha])
    db.flush()

    _join(db, rafi, parent, doctor, now - timedelta(days=118), share_documents=True)
    _join(db, rafi, parent, teacher, now - timedelta(days=95), share_documents=True)

    asked_at = now - timedelta(hours=20)
    pending = AccessRequest(
        child_id=rafi.id,
        requester_id=teacher2.id,
        child_code=RAFI_CODE,
        message="আসসালামু আলাইকুম। আমি শিশু বিকাশ বিশেষ স্কুলের শিক্ষিকা। "
        "রাফির ভর্তির ব্যাপারে আপনার সাথে কথা হয়েছিল।",
        created_at=asked_at,
    )
    db.add(pending)
    db.flush()
    db.add_all(
        [
            Notification(
                user_id=parent.id,
                kind=NotificationKind.access_request_received,
                payload_json={
                    "child_id": rafi.id,
                    "child_name": rafi.name,
                    "requester_name": teacher2.name,
                    "requester_role": teacher2.role.value,
                },
                created_at=asked_at,
            ),
            _audit(teacher2, rafi, "request", f"access_request:{pending.id}", asked_at),
        ]
    )
    db.commit()
    return 2


def _join(
    db: Session, child: Child, parent: User, member: User, at: datetime, share_documents: bool
) -> None:
    """An approved request, its grant, the member's (read) notification and the audit trail."""
    clinical = member.role == Role.specialist
    request = AccessRequest(
        child_id=child.id,
        requester_id=member.id,
        child_code=child.code,
        status=AccessRequestStatus.approved,
        created_at=at - timedelta(hours=3),
        decided_at=at,
    )
    db.add(request)
    db.flush()
    db.add_all(
        [
            AccessGrant(
                child_id=child.id,
                user_id=member.id,
                scope=GrantScope.clinical if clinical else GrantScope.education,
                share_medications=clinical,
                share_documents=share_documents,
                granted_at=at,
            ),
            Notification(
                user_id=member.id,
                kind=NotificationKind.access_request_approved,
                payload_json={"child_id": child.id, "child_name": child.name},
                created_at=at,
                read_at=at + timedelta(hours=1),
            ),
            _audit(member, child, "request", f"access_request:{request.id}", request.created_at),
            _audit(parent, child, "approve", f"access_request:{request.id}", at),
        ]
    )


def _audit(actor: User, child: Child, action: str, resource: str, at: datetime) -> AuditLog:
    return AuditLog(actor_id=actor.id, child_id=child.id, action=action, resource=resource, at=at)


def _months_ago(today: date, months: int, day: int) -> date:
    year, month = divmod(today.year * 12 + today.month - 1 - months, 12)
    return date(year, month + 1, day)


def _user(db: Session, email: str) -> User:
    user = db.scalar(select(User).where(User.email == email))
    assert user is not None, f"seed users first ({email})"
    return user
