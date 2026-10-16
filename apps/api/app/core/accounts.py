"""Checks shared by self sign-up and admin-created accounts."""

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import ApiError
from app.core.security import normalize_email, normalize_phone, password_is_acceptable
from app.models import User


@dataclass(frozen=True)
class Contact:
    email: str | None
    phone: str | None


def validated_contact(db: Session, email: str | None, phone: str | None) -> Contact:
    """Normalised email/phone; at least one, valid and not used by another account.

    Errors carry `detail.field` so the form can mark the right input.
    """
    email = email or None
    phone = phone or None
    if email is None and phone is None:
        raise ApiError(422, "identifier_required", detail={"field": "email"})

    normal_email = normalize_email(email) if email else None
    if email and normal_email is None:
        raise ApiError(422, "invalid_email", detail={"field": "email"})
    normal_phone = normalize_phone(phone) if phone else None
    if phone and normal_phone is None:
        raise ApiError(422, "invalid_phone", detail={"field": "phone"})

    if normal_email and db.scalar(select(User.id).where(User.email == normal_email)):
        raise ApiError(409, "email_taken", detail={"field": "email"})
    if normal_phone and db.scalar(select(User.id).where(User.phone == normal_phone)):
        raise ApiError(409, "phone_taken", detail={"field": "phone"})
    return Contact(normal_email, normal_phone)


def check_new_password(password: str, field: str) -> None:
    if not password_is_acceptable(password):
        raise ApiError(422, "weak_password", detail={"field": field})
