from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, StringConstraints

from app.models import AccessGrant, AccessRequestStatus, GrantScope, Role, User


class CreateAccessRequest(BaseModel):
    # Validated and normalised by the handler (core/child_codes.py), so a typo gets a clear error.
    child_code: Annotated[str, StringConstraints(strip_whitespace=True, max_length=32)]
    # e.g. "I'm Rafi's class teacher at …". Shown to the parent.
    message: Annotated[str, StringConstraints(strip_whitespace=True, max_length=300)] | None = None


class OutgoingAccessRequest(BaseModel):
    """The requester's own view. Says nothing about the child, not even whether it exists."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    child_code: str
    message: str | None
    status: AccessRequestStatus
    created_at: datetime
    decided_at: datetime | None


class Person(BaseModel):
    """A teacher or specialist as a parent sees them when deciding who joins the care team."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    role: Role
    organisation: str | None
    specialty: str | None
    registration_no: str | None
    # Admin-onboarded specialist.
    verified: bool


class IncomingAccessRequest(BaseModel):
    """A pending request as the child's parent sees it."""

    id: int
    requester: Person
    message: str | None
    # The ID the requester typed: shows which shared code they used.
    child_code: str
    created_at: datetime


class ApproveAccessRequest(BaseModel):
    """Scope options (COMPANION_SPEC §3.2). Left out → the default for the requester's role:
    teachers see neither medications nor documents; specialists see both."""

    share_medications: bool | None = None
    share_documents: bool | None = None


class UpdateGrant(BaseModel):
    share_medications: bool | None = None
    share_documents: bool | None = None


class Grant(BaseModel):
    id: int
    member: Person
    scope: GrantScope
    # Always true for specialists (clinical scope includes medications).
    share_medications: bool
    share_documents: bool
    can_add_logs: bool
    granted_at: datetime

    @classmethod
    def of(cls, grant: AccessGrant, member: User) -> "Grant":
        return cls(
            id=grant.id,
            member=Person.model_validate(member),
            scope=grant.scope,
            share_medications=grant.share_medications,
            share_documents=grant.share_documents,
            can_add_logs=grant.can_add_logs,
            granted_at=grant.granted_at,
        )


class ActivityActor(BaseModel):
    id: int
    name: str
    role: Role


class ActivityEntry(BaseModel):
    """One line of "who viewed or changed what". Repeats of the same thing by the same person on
    the same day are folded into one entry with a count."""

    actor: ActivityActor
    action: str
    # The resource kind ("profile", "grant", "access_request", "child_code" …).
    resource: str
    # The person a grant or request belongs to, when that's not the actor.
    subject_name: str | None
    at: datetime
    count: int


class AccessRequestSent(BaseModel):
    """Same answer whether or not the code matched a child (COMPANION_SPEC §3.1)."""

    status: Literal["sent"] = "sent"
