from datetime import UTC, datetime
from enum import StrEnum

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy import Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class Role(StrEnum):
    parent = "parent"
    teacher = "teacher"
    specialist = "specialist"
    admin = "admin"


class Locale(StrEnum):
    bn = "bn"
    en = "en"


class User(Base):
    """COMPANION_SPEC §15 `users`. A login is identified by email or phone (OPEN_QUESTIONS #15)."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    role: Mapped[Role] = mapped_column(SAEnum(Role, native_enum=False, length=16))
    name: Mapped[str] = mapped_column(String(120))
    # Stored lower-cased.
    email: Mapped[str | None] = mapped_column(String(254), unique=True)
    # Stored as +8801XXXXXXXXX.
    phone: Mapped[str | None] = mapped_column(String(16), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    preferred_locale: Mapped[Locale] = mapped_column(
        SAEnum(Locale, native_enum=False, length=2), default=Locale.bn
    )
    # School (teacher) or clinic/hospital (specialist).
    organisation: Mapped[str | None] = mapped_column(String(200))
    registration_no: Mapped[str | None] = mapped_column(String(60))
    specialty: Mapped[str | None] = mapped_column(String(120))
    # Admin-onboarded specialists are verified; shown as a badge to parents.
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    must_change_password: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class RefreshToken(Base):
    """One row per issued refresh token, so sessions can be revoked (logout, password change,
    deactivation) and rotated on every refresh."""

    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    # The token's `jti` claim. Not secret on its own: the token is also signed.
    jti: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
