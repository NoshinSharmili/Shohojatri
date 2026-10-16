from fastapi import APIRouter, status
from sqlalchemy import select

from app.core.accounts import validated_contact
from app.core.deps import AdminUser, DbSession
from app.core.errors import ApiError
from app.core.security import generate_temporary_password, hash_password
from app.core.sessions import revoke_all_sessions
from app.models import Role, User
from app.schemas.users import (
    CreatedSpecialist,
    CreateSpecialistRequest,
    SpecialistOut,
    TemporaryPassword,
    UpdateSpecialistRequest,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/specialists", operation_id="listSpecialists")
def list_specialists(_: AdminUser, db: DbSession) -> list[SpecialistOut]:
    specialists = db.scalars(
        select(User).where(User.role == Role.specialist).order_by(User.created_at.desc())
    )
    return [SpecialistOut.model_validate(user) for user in specialists]


@router.post("/specialists", operation_id="createSpecialist", status_code=status.HTTP_201_CREATED)
def create_specialist(
    body: CreateSpecialistRequest, _: AdminUser, db: DbSession
) -> CreatedSpecialist:
    contact = validated_contact(db, body.email, body.phone)
    temporary_password = generate_temporary_password()
    specialist = User(
        role=Role.specialist,
        name=body.name,
        email=contact.email,
        phone=contact.phone,
        password_hash=hash_password(temporary_password),
        preferred_locale=body.preferred_locale,
        organisation=body.organisation or None,
        registration_no=body.registration_no,
        specialty=body.specialty,
        verified=True,
        must_change_password=True,
    )
    db.add(specialist)
    db.commit()
    return CreatedSpecialist(
        specialist=SpecialistOut.model_validate(specialist),
        temporary_password=temporary_password,
    )


@router.patch("/specialists/{user_id}", operation_id="updateSpecialist")
def update_specialist(
    user_id: int, body: UpdateSpecialistRequest, _: AdminUser, db: DbSession
) -> SpecialistOut:
    specialist = _get_specialist(db, user_id)
    specialist.is_active = body.is_active
    db.commit()
    if not body.is_active:
        revoke_all_sessions(db, specialist.id)
    return SpecialistOut.model_validate(specialist)


@router.post("/users/{user_id}/temporary-password", operation_id="issueTemporaryPassword")
def issue_temporary_password(user_id: int, _: AdminUser, db: DbSession) -> TemporaryPassword:
    """Password reset by hand (OPEN_QUESTIONS #15): there is no self-serve reset in the POC."""
    user = db.get(User, user_id)
    if user is None or user.role == Role.admin:
        raise ApiError(404, "not_found")
    temporary_password = generate_temporary_password()
    user.password_hash = hash_password(temporary_password)
    user.must_change_password = True
    db.commit()
    revoke_all_sessions(db, user.id)
    return TemporaryPassword(temporary_password=temporary_password)


def _get_specialist(db: DbSession, user_id: int) -> User:
    user = db.get(User, user_id)
    if user is None or user.role != Role.specialist:
        raise ApiError(404, "not_found")
    return user
