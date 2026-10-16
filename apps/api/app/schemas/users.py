from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, StringConstraints

from app.models import Locale, Role

Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)]
OptionalText = Annotated[str, StringConstraints(strip_whitespace=True, max_length=200)]
# Upper bound only: argon2 has no length limit, but unbounded input is a cheap DoS.
Password = Annotated[str, StringConstraints(max_length=128)]


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    role: Role
    name: str
    email: str | None
    phone: str | None
    preferred_locale: Locale
    organisation: str | None
    registration_no: str | None
    specialty: str | None
    verified: bool
    must_change_password: bool


class SignupRequest(BaseModel):
    """Self sign-up. Specialists and admins can't sign up (CLAUDE.md §3).

    Email and/or phone; either can be used to log in."""

    role: Literal[Role.parent, Role.teacher]
    name: Name
    email: OptionalText | None = None
    phone: OptionalText | None = None
    password: Password
    # School name. Required for teachers.
    organisation: OptionalText | None = None
    preferred_locale: Locale = Locale.bn


class LoginRequest(BaseModel):
    # Email or phone number.
    identifier: Annotated[str, StringConstraints(strip_whitespace=True, max_length=254)]
    password: Password


class ChangePasswordRequest(BaseModel):
    # Not needed while replacing a temporary password: the user just logged in with it.
    current_password: Password | None = None
    new_password: Password


class UpdateMeRequest(BaseModel):
    preferred_locale: Locale


class OkResponse(BaseModel):
    ok: Literal[True] = True


class SpecialistOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str | None
    phone: str | None
    specialty: str | None
    registration_no: str | None
    organisation: str | None
    verified: bool
    is_active: bool
    must_change_password: bool
    created_at: datetime


class CreateSpecialistRequest(BaseModel):
    name: Name
    specialty: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=120)
    ]
    # BMDC or other licensing-body registration number.
    registration_no: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=1, max_length=60)
    ]
    organisation: OptionalText | None = None
    email: OptionalText | None = None
    phone: OptionalText | None = None
    preferred_locale: Locale = Locale.bn


class CreatedSpecialist(BaseModel):
    specialist: SpecialistOut
    # Shown to the admin exactly once; only its hash is stored.
    temporary_password: str


class UpdateSpecialistRequest(BaseModel):
    is_active: bool


class TemporaryPassword(BaseModel):
    temporary_password: str
