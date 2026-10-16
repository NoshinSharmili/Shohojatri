from datetime import date, datetime
from enum import StrEnum
from typing import Any

from sqlalchemy import JSON, Date, ForeignKey, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UtcDateTime, utcnow


class ChildStatus(StrEnum):
    screening = "screening"
    companion = "companion"


class Sex(StrEnum):
    female = "female"
    male = "male"


class Child(Base):
    """COMPANION_SPEC §15 `children`: one continuous record from first screening onwards."""

    __tablename__ = "children"

    id: Mapped[int] = mapped_column(primary_key=True)
    # Child ID handed to teachers and specialists, e.g. SJ-7K3QX (COMPANION_SPEC §2).
    code: Mapped[str] = mapped_column(String(8), unique=True)
    parent_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    # Name or nickname, as the parent wrote it.
    name: Mapped[str] = mapped_column(String(80))
    dob: Mapped[date] = mapped_column(Date)
    sex: Mapped[Sex | None] = mapped_column(SAEnum(Sex, native_enum=False, length=8))
    status: Mapped[ChildStatus] = mapped_column(
        SAEnum(ChildStatus, native_enum=False, length=16), default=ChildStatus.screening
    )
    photo_path: Mapped[str | None] = mapped_column(String(255))
    diagnosis_json: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(UtcDateTime, default=utcnow)
    deleted_at: Mapped[datetime | None] = mapped_column(UtcDateTime)
