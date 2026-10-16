from typing import Annotated

from fastapi import APIRouter, Cookie, Response, status
from sqlalchemy import select

from app.core.accounts import check_new_password, validated_contact
from app.core.deps import DbSession, UserPendingPasswordChange
from app.core.errors import ApiError
from app.core.security import (
    REFRESH_COOKIE,
    burn_password_check,
    hash_password,
    parse_identifier,
    verify_password,
)
from app.core.sessions import (
    clear_auth_cookies,
    refresh_access,
    revoke_all_sessions,
    revoke_refresh_token,
    start_session,
    user_for_refresh_token,
)
from app.models import Role, User
from app.schemas.users import (
    ChangePasswordRequest,
    LoginRequest,
    OkResponse,
    SignupRequest,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])

RefreshCookie = Annotated[str | None, Cookie(alias=REFRESH_COOKIE, include_in_schema=False)]


@router.post("/signup", operation_id="signup", status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest, db: DbSession, response: Response) -> UserOut:
    if body.role == Role.teacher and not body.organisation:
        raise ApiError(422, "organisation_required", detail={"field": "organisation"})
    contact = validated_contact(db, body.email, body.phone)
    check_new_password(body.password, "password")

    user = User(
        role=body.role,
        name=body.name,
        email=contact.email,
        phone=contact.phone,
        password_hash=hash_password(body.password),
        preferred_locale=body.preferred_locale,
        organisation=body.organisation or None,
    )
    db.add(user)
    db.flush()
    start_session(db, response, user)
    return UserOut.model_validate(user)


@router.post("/login", operation_id="login")
def login(body: LoginRequest, db: DbSession, response: Response) -> UserOut:
    identifier = parse_identifier(body.identifier)
    column = User.email if identifier and identifier.kind == "email" else User.phone
    user = db.scalar(select(User).where(column == identifier.value)) if identifier else None

    if user is None:
        burn_password_check(body.password)
        raise ApiError(401, "invalid_credentials")
    if not verify_password(user.password_hash, body.password):
        raise ApiError(401, "invalid_credentials")
    # Only said after the right password, so it doesn't reveal which accounts exist.
    if not user.is_active:
        raise ApiError(403, "account_inactive")

    # A user who must change their password still gets a session: the web app sends them
    # to the set-new-password screen, and every other endpoint refuses them until then.
    start_session(db, response, user)
    return UserOut.model_validate(user)


@router.post("/refresh", operation_id="refreshSession")
def refresh(db: DbSession, response: Response, refresh_token: RefreshCookie = None) -> UserOut:
    user = user_for_refresh_token(db, refresh_token)
    if user is None:
        clear_auth_cookies(response)
        raise ApiError(401, "not_authenticated")
    refresh_access(response, user)
    return UserOut.model_validate(user)


@router.post("/logout", operation_id="logout")
def logout(db: DbSession, response: Response, refresh_token: RefreshCookie = None) -> OkResponse:
    # Works without a valid session, so a half-expired client can always clean up.
    revoke_refresh_token(db, refresh_token)
    clear_auth_cookies(response)
    return OkResponse()


@router.post("/change-password", operation_id="changePassword")
def change_password(
    body: ChangePasswordRequest,
    user: UserPendingPasswordChange,
    db: DbSession,
    response: Response,
) -> UserOut:
    if not user.must_change_password and not (
        body.current_password and verify_password(user.password_hash, body.current_password)
    ):
        raise ApiError(400, "wrong_password", detail={"field": "current_password"})
    check_new_password(body.new_password, "new_password")
    if verify_password(user.password_hash, body.new_password):
        raise ApiError(422, "password_unchanged", detail={"field": "new_password"})

    user.password_hash = hash_password(body.new_password)
    user.must_change_password = False
    # Other devices (and whoever saw a temporary password) are logged out; this one continues.
    revoke_all_sessions(db, user.id)
    start_session(db, response, user)
    return UserOut.model_validate(user)
