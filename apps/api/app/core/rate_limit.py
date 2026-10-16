"""Sliding-window rate limits for the public demo's auth endpoints.

Counts live in `rate_limit_hits`, so the limit holds across the API's worker processes. Keys
are hashed: the table never stores an IP address or a login identifier.
"""

import hashlib
from dataclasses import dataclass
from datetime import timedelta

from fastapi import Request
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.core.errors import ApiError
from app.models import RateLimitHit
from app.models.base import utcnow


@dataclass(frozen=True)
class Limit:
    bucket: str
    max_hits: int  # 0 = no limit
    window: timedelta


def client_ip(request: Request) -> str:
    # uvicorn runs with --proxy-headers, so behind Render's proxy (and Vercel's rewrite) this
    # is the browser's address from X-Forwarded-For, not the proxy's.
    return request.client.host if request.client else "unknown"


def _hashed(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def check(db: Session, limit: Limit, value: str) -> None:
    """Raises 429 `rate_limited` when `value` already used up `limit` in the window."""
    if limit.max_hits <= 0:
        return
    since = utcnow() - limit.window
    key = _hashed(value)
    oldest_in_window = db.execute(
        select(func.count(), func.min(RateLimitHit.at)).where(
            RateLimitHit.bucket == limit.bucket,
            RateLimitHit.key == key,
            RateLimitHit.at > since,
        )
    ).one()
    count, oldest = oldest_in_window
    if count >= limit.max_hits:
        retry_after = max(1, int((oldest + limit.window - utcnow()).total_seconds()) + 1)
        raise ApiError(429, "rate_limited", detail={"retry_after": retry_after})


def record(db: Session, limit: Limit, value: str) -> None:
    """Counts one attempt and drops this key's expired ones. Commits."""
    if limit.max_hits <= 0:
        return
    key = _hashed(value)
    db.execute(
        delete(RateLimitHit).where(
            RateLimitHit.bucket == limit.bucket,
            RateLimitHit.key == key,
            RateLimitHit.at <= utcnow() - limit.window,
        )
    )
    db.add(RateLimitHit(bucket=limit.bucket, key=key))
    db.commit()


def hit(db: Session, limit: Limit, value: str) -> None:
    """check + record: for limits that count every attempt."""
    check(db, limit, value)
    record(db, limit, value)
