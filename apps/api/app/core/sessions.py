"""Login sessions: issuing, refreshing and revoking the token pair, and the auth cookies."""

from datetime import UTC, datetime

from fastapi import Response
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
    ACCESS_COOKIE,
    REFRESH_COOKIE,
    REFRESH_COOKIE_PATH,
    IssuedToken,
    decode_token,
    issue_access_token,
    issue_refresh_token,
)
from app.models import RefreshToken, User


def start_session(db: Session, response: Response, user: User) -> None:
    """Issues a new access + refresh pair as cookies. Commits."""
    refresh = issue_refresh_token(user.id)
    db.add(RefreshToken(user_id=user.id, jti=refresh.jti, expires_at=refresh.expires_at))
    db.commit()
    _set_cookie(response, ACCESS_COOKIE, issue_access_token(user.id), "/")
    _set_cookie(response, REFRESH_COOKIE, refresh, REFRESH_COOKIE_PATH)


def user_for_refresh_token(db: Session, token: str | None) -> User | None:
    """The active user behind a valid, unrevoked refresh token, else None."""
    claims = decode_token(token, "refresh") if token else None
    if claims is None:
        return None
    row = db.scalar(select(RefreshToken).where(RefreshToken.jti == claims.jti))
    if row is None or row.revoked_at is not None or row.user_id != claims.user_id:
        return None
    user = db.get(User, claims.user_id)
    return user if user is not None and user.is_active else None


def refresh_access(response: Response, user: User) -> None:
    # The refresh token is not rotated: no race between tabs refreshing at the same moment,
    # and it is still revoked by logout, password change and deactivation.
    _set_cookie(response, ACCESS_COOKIE, issue_access_token(user.id), "/")


def revoke_refresh_token(db: Session, token: str | None) -> None:
    claims = decode_token(token, "refresh") if token else None
    if claims is None:
        return
    db.execute(
        update(RefreshToken)
        .where(RefreshToken.jti == claims.jti, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
    )
    db.commit()


def revoke_all_sessions(db: Session, user_id: int) -> None:
    """Revokes every refresh token of the user, so no session can be renewed. Commits.

    Access tokens aren't tracked: an already-issued one keeps working until it expires
    (≤ 15 min) unless the user is deactivated, which every request checks.
    """
    db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
    )
    db.commit()


def clear_auth_cookies(response: Response) -> None:
    settings = get_settings()
    for name, path in ((ACCESS_COOKIE, "/"), (REFRESH_COOKIE, REFRESH_COOKIE_PATH)):
        response.delete_cookie(
            name, path=path, secure=settings.cookie_secure, httponly=True, samesite="lax"
        )


def _set_cookie(response: Response, name: str, issued: IssuedToken, path: str) -> None:
    response.set_cookie(
        name,
        issued.token,
        max_age=issued.max_age,
        path=path,
        secure=get_settings().cookie_secure,
        httponly=True,
        samesite="lax",
    )
