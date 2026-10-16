"""Access-request rules shared by the routers (COMPANION_SPEC §3.1)."""

from datetime import timedelta

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.models import AccessRequest, AccessRequestStatus
from app.models.base import utcnow

REQUEST_TTL = timedelta(days=14)
# Per requester, over a rolling 24 hours. Counts requests for codes that match no child too,
# otherwise the limit wouldn't slow down guessing.
DAILY_LIMIT = 10


def expire_stale_requests(db: Session) -> None:
    """Marks pending requests older than 14 days as expired. Commits.

    Evaluated lazily by every endpoint that shows requests, so no scheduler is needed.
    """
    db.execute(
        update(AccessRequest)
        .where(
            AccessRequest.status == AccessRequestStatus.pending,
            AccessRequest.created_at < utcnow() - REQUEST_TTL,
        )
        .values(status=AccessRequestStatus.expired)
    )
    db.commit()


def requests_sent_today(db: Session, requester_id: int) -> int:
    return (
        db.scalar(
            select(func.count())
            .select_from(AccessRequest)
            .where(
                AccessRequest.requester_id == requester_id,
                AccessRequest.created_at >= utcnow() - timedelta(days=1),
            )
        )
        or 0
    )
