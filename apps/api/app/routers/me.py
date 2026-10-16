from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession, UserPendingPasswordChange
from app.schemas.users import UpdateMeRequest, UserOut

router = APIRouter(prefix="/me", tags=["me"])


@router.get("", operation_id="getMe")
def get_me(user: UserPendingPasswordChange) -> UserOut:
    # Allowed before a forced password change: the web app reads must_change_password here.
    return UserOut.model_validate(user)


@router.patch("", operation_id="updateMe")
def update_me(body: UpdateMeRequest, user: CurrentUser, db: DbSession) -> UserOut:
    # The language toggle's choice, remembered per user (CLAUDE.md §6).
    user.preferred_locale = body.preferred_locale
    db.commit()
    return UserOut.model_validate(user)
