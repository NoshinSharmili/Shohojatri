from datetime import date, datetime
from typing import Annotated

from pydantic import BaseModel, StringConstraints

from app.core.permissions import Holder
from app.models import ChildStatus, Sex


class CreateChildRequest(BaseModel):
    # Name or nickname, stored as written.
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=80)]
    dob: date
    sex: Sex | None = None


class ChildOut(BaseModel):
    """A child as the viewer may see it: a home-screen card and the dashboard header."""

    id: int
    name: str
    dob: date
    age_months: int
    sex: Sex | None
    status: ChildStatus
    # How the viewer relates to the child: owner (parent) or the scope of their grant.
    access: Holder
    # Only for the parent. Members never see it, so a regenerated ID can't leak through them.
    code: str | None
    # Parent only: requests waiting for a decision.
    pending_requests: int
    # Members only: when the parent approved them.
    member_since: datetime | None


class ChildCode(BaseModel):
    code: str
