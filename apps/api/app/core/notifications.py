from typing import Any

from sqlalchemy.orm import Session

from app.models import Notification, NotificationKind


def notify(db: Session, user_id: int, kind: NotificationKind, **payload: Any) -> None:
    """Queues an in-app notification; saved by the caller's commit.

    The payload holds only what the text needs. It is a snapshot: a later rename doesn't
    rewrite old notifications.
    """
    db.add(Notification(user_id=user_id, kind=kind, payload_json=payload))
