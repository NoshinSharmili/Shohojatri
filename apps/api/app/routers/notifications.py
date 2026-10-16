from fastapi import APIRouter
from sqlalchemy import func, select, update

from app.core.deps import CurrentUser, DbSession
from app.core.errors import ApiError
from app.models import Notification
from app.models.base import utcnow
from app.schemas.notifications import NotificationList, NotificationOut
from app.schemas.users import OkResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])

_LIST_LIMIT = 50


@router.get("", operation_id="listNotifications")
def list_notifications(user: CurrentUser, db: DbSession) -> NotificationList:
    items = db.scalars(
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc(), Notification.id.desc())
        .limit(_LIST_LIMIT)
    )
    unread = db.scalar(
        select(func.count())
        .select_from(Notification)
        .where(Notification.user_id == user.id, Notification.read_at.is_(None))
    )
    return NotificationList(
        items=[NotificationOut.model_validate(n) for n in items], unread=unread or 0
    )


@router.post("/{notification_id}/read", operation_id="markNotificationRead")
def mark_read(notification_id: int, user: CurrentUser, db: DbSession) -> OkResponse:
    notification = db.get(Notification, notification_id)
    if notification is None or notification.user_id != user.id:
        raise ApiError(404, "not_found")
    if notification.read_at is None:
        notification.read_at = utcnow()
        db.commit()
    return OkResponse()


@router.post("/read-all", operation_id="markAllNotificationsRead")
def mark_all_read(user: CurrentUser, db: DbSession) -> OkResponse:
    db.execute(
        update(Notification)
        .where(Notification.user_id == user.id, Notification.read_at.is_(None))
        .values(read_at=utcnow())
    )
    db.commit()
    return OkResponse()
