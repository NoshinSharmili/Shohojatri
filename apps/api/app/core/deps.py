"""Shared FastAPI dependencies: database session, current user, role guards."""

from collections.abc import Callable
from typing import Annotated

from fastapi import Cookie, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.errors import ApiError
from app.core.security import ACCESS_COOKIE, decode_token
from app.models import Role, User

DbSession = Annotated[Session, Depends(get_db)]


def get_user_pending_password_change(
    db: DbSession,
    access_token: Annotated[
        str | None, Cookie(alias=ACCESS_COOKIE, include_in_schema=False)
    ] = None,
) -> User:
    """The logged-in user, even if they still have to replace a temporary password.

    Only for the few endpoints a user in that state needs: /me, change-password.
    Everything else uses `get_current_user`.
    """
    claims = decode_token(access_token, "access") if access_token else None
    user = db.get(User, claims.user_id) if claims else None
    # Reloading the user on every request makes deactivation take effect immediately.
    if user is None or not user.is_active:
        raise ApiError(401, "not_authenticated")
    return user


def get_current_user(
    user: Annotated[User, Depends(get_user_pending_password_change)],
) -> User:
    if user.must_change_password:
        raise ApiError(403, "password_change_required")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
UserPendingPasswordChange = Annotated[User, Depends(get_user_pending_password_change)]


def require_roles(*roles: Role) -> Callable[[User], User]:
    """Dependency factory: the current user, if their role is one of `roles`."""

    def dependency(user: CurrentUser) -> User:
        if user.role not in roles:
            raise ApiError(403, "forbidden")
        return user

    return dependency


AdminUser = Annotated[User, Depends(require_roles(Role.admin))]
