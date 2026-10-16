"""Audit trail of child-data access (CLAUDE.md §2.5).

Every non-parent read/write goes through `require_child_access`, which records it. The parent's
own care-team actions (approve, revoke, new Child ID …) are recorded too, so the Care team tab
can show the full history.
"""

from sqlalchemy.orm import Session

from app.models import AuditLog


def record(db: Session, actor_id: int, child_id: int, action: str, resource: str) -> None:
    """Adds an audit row to the session; the caller's commit saves it with the change."""
    db.add(AuditLog(actor_id=actor_id, child_id=child_id, action=action, resource=resource))
