"""Passwords, login identifiers and tokens. No database access here."""

import re
import secrets
import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Literal

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

from app.core.config import get_settings

_hasher = PasswordHasher()

# --- passwords ------------------------------------------------------------------------------

PASSWORD_MIN_LENGTH = 8
# Same rules the sign-up and set-password screens show (design Onboarding 03/04b).
_HAS_DIGIT = re.compile(r"\d")


def password_is_acceptable(password: str) -> bool:
    return len(password) >= PASSWORD_MIN_LENGTH and bool(_HAS_DIGIT.search(password))


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerificationError, InvalidHashError):
        return False


# Verifying against this when no user matches keeps "unknown account" and "wrong password"
# equally slow, so response times don't reveal which emails/phones are registered.
_DUMMY_HASH = _hasher.hash(secrets.token_urlsafe(16))


def burn_password_check(password: str) -> None:
    verify_password(_DUMMY_HASH, password)


# Easy to read aloud and type from a note: no 0/O, 1/l/I.
_TEMP_ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_temporary_password() -> str:
    """12 characters, always including a digit so it passes the password rules itself."""
    while True:
        candidate = "".join(secrets.choice(_TEMP_ALPHABET) for _ in range(12))
        if password_is_acceptable(candidate):
            return candidate


# --- login identifiers ----------------------------------------------------------------------

_BN_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")
_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
# Bangladeshi mobile numbers: 01[3-9] + 8 digits, with or without the 880 country code.
_BD_MOBILE = re.compile(r"^(?:\+?880|0)?(1[3-9]\d{8})$")


def normalize_email(value: str) -> str | None:
    email = value.strip().lower()
    return email if len(email) <= 254 and _EMAIL.match(email) else None


def normalize_phone(value: str) -> str | None:
    """Accepts Bangla or Latin digits, spaces, dashes and brackets → +8801XXXXXXXXX."""
    compact = re.sub(r"[\s\-()]", "", value.translate(_BN_DIGITS))
    match = _BD_MOBILE.match(compact)
    return f"+880{match.group(1)}" if match else None


@dataclass(frozen=True)
class Identifier:
    kind: Literal["email", "phone"]
    value: str


def parse_identifier(value: str) -> Identifier | None:
    """Login accepts either an email or a phone number in one field."""
    if "@" in value:
        email = normalize_email(value)
        return Identifier("email", email) if email else None
    phone = normalize_phone(value)
    return Identifier("phone", phone) if phone else None


# --- tokens ---------------------------------------------------------------------------------

ACCESS_COOKIE = "sj_access"
REFRESH_COOKIE = "sj_refresh"
# The refresh token is only ever needed by /auth/refresh and /auth/logout.
REFRESH_COOKIE_PATH = "/api/v1/auth"
_ALGORITHM = "HS256"

TokenType = Literal["access", "refresh"]


@dataclass(frozen=True)
class IssuedToken:
    token: str
    jti: str
    expires_at: datetime
    max_age: int


def _issue(user_id: int, token_type: TokenType, lifetime: timedelta) -> IssuedToken:
    now = datetime.now(UTC)
    expires_at = now + lifetime
    jti = uuid.uuid4().hex
    claims = {"sub": str(user_id), "type": token_type, "jti": jti, "iat": now, "exp": expires_at}
    token = jwt.encode(claims, get_settings().jwt_secret, algorithm=_ALGORITHM)
    return IssuedToken(token, jti, expires_at, int(lifetime.total_seconds()))


def issue_access_token(user_id: int) -> IssuedToken:
    return _issue(user_id, "access", timedelta(minutes=get_settings().access_token_minutes))


def issue_refresh_token(user_id: int) -> IssuedToken:
    return _issue(user_id, "refresh", timedelta(days=get_settings().refresh_token_days))


@dataclass(frozen=True)
class TokenClaims:
    user_id: int
    jti: str


def decode_token(token: str, expected_type: TokenType) -> TokenClaims | None:
    """None for anything invalid: bad signature, expired, wrong type or malformed."""
    try:
        claims = jwt.decode(
            token,
            get_settings().jwt_secret,
            algorithms=[_ALGORITHM],
            options={"require": ["sub", "type", "jti", "exp"]},
        )
    except jwt.PyJWTError:
        return None
    if claims["type"] != expected_type or not str(claims["sub"]).isdigit():
        return None
    return TokenClaims(int(claims["sub"]), str(claims["jti"]))
