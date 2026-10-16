"""Counters for abuse protection on the public demo (app/core/rate_limit.py, app/ai/llm.py).

Kept in the database rather than in memory so limits hold across the API's worker processes.
"""

from datetime import date, datetime

from sqlalchemy import Date, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UtcDateTime, utcnow


class RateLimitHit(Base):
    """One counted attempt. `key` is a SHA-256 of the IP or login identifier, never the raw
    value, so this table holds no personal data."""

    __tablename__ = "rate_limit_hits"
    __table_args__ = (Index("ix_rate_limit_hits_bucket_key_at", "bucket", "key", "at"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    bucket: Mapped[str] = mapped_column(String(32))
    key: Mapped[str] = mapped_column(String(64))
    at: Mapped[datetime] = mapped_column(UtcDateTime, default=utcnow)


class LlmUsage(Base):
    """LLM calls one user made on one Bangladesh calendar day."""

    __tablename__ = "llm_usage"
    __table_args__ = (UniqueConstraint("user_id", "day"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    day: Mapped[date] = mapped_column(Date)
    calls: Mapped[int] = mapped_column(default=0)
