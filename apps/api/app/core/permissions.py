"""Who may do what with a child's record: the single permission table (COMPANION_SPEC §3.2).

Every child endpoint declares the permission it needs:

    access: Annotated[ChildAccess, Depends(require_child_access(Need.read_profile))]

Someone with no relationship to the child gets 404, so ids don't reveal which children exist.
A care-team member who lacks one particular permission gets 403. Every non-parent access that
is allowed is written to the audit log.
"""

from collections.abc import Callable
from dataclasses import dataclass
from enum import StrEnum
from typing import Literal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core import audit
from app.core.deps import CurrentUser, DbSession
from app.core.errors import ApiError
from app.models import AccessGrant, Child, GrantScope, Role, User


class Need(StrEnum):
    """`verb:object`. The audit log stores the verb as the action and the object as the resource."""

    read_profile = "read:profile"  # basics, characteristics, triggers, calming, strengths …
    read_diagnosis = "read:diagnosis"  # what was diagnosed + when
    read_care_plan = "read:care_plan"  # goals, therapies, follow-ups
    read_medications = "read:medications"
    read_documents = "read:documents"
    read_screenings = "read:screenings"  # screening results and reports
    write_screenings = "write:screenings"  # run a screening: consent, answers, delete
    read_logs = "read:logs"  # logs with visibility `care_team`
    read_clinical_logs = "read:clinical_logs"  # logs with visibility `clinical`
    write_logs = "write:logs"  # add logs / goal progress
    write_clinical_notes = "write:clinical_notes"
    write_care_plan = "write:care_plan"
    suggest_goals = "suggest:goals"
    use_chat = "use:chat"  # within the viewer's scope
    write_profile = "write:profile"
    manage_access = "manage:access"  # approve/revoke, regenerate ID, delete child, see audit

    @property
    def verb(self) -> str:
        return self.value.split(":")[0]

    @property
    def object(self) -> str:
        return self.value.split(":")[1]


class Holder(StrEnum):
    """How the viewer relates to the child."""

    parent = "parent"
    education = GrantScope.education.value  # approved teacher
    clinical = GrantScope.clinical.value  # approved specialist


# A rule is True/False, or the name of the grant option the parent ticked when approving.
GrantFlag = Literal["share_medications", "share_documents", "can_add_logs"]
Rule = bool | GrantFlag

P, E, C = Holder.parent, Holder.education, Holder.clinical

# COMPANION_SPEC §3.2, row by row. Private logs (author + parent only) are filtered per entry
# where logs are read, not here.
PERMISSIONS: dict[Need, dict[Holder, Rule]] = {
    Need.read_profile: {P: True, E: True, C: True},
    Need.read_diagnosis: {P: True, E: True, C: True},
    Need.read_care_plan: {P: True, E: True, C: True},
    Need.read_medications: {P: True, E: "share_medications", C: True},
    Need.read_documents: {P: True, E: "share_documents", C: "share_documents"},
    Need.read_screenings: {P: True, E: False, C: True},
    Need.write_screenings: {P: True, E: False, C: False},
    Need.read_logs: {P: True, E: True, C: True},
    Need.read_clinical_logs: {P: True, E: False, C: True},
    Need.write_logs: {P: True, E: "can_add_logs", C: "can_add_logs"},
    Need.write_clinical_notes: {P: False, E: False, C: True},
    Need.write_care_plan: {P: True, E: False, C: True},
    Need.suggest_goals: {P: False, E: True, C: False},
    Need.use_chat: {P: True, E: True, C: True},
    Need.write_profile: {P: True, E: False, C: False},
    Need.manage_access: {P: True, E: False, C: False},
}


@dataclass(frozen=True)
class ChildAccess:
    child: Child
    user: User
    holder: Holder
    grant: AccessGrant | None  # None for the parent

    def can(self, need: Need) -> bool:
        rule = PERMISSIONS[need][self.holder]
        if isinstance(rule, bool):
            return rule
        assert self.grant is not None, "only grant holders have flag rules"
        return bool(getattr(self.grant, rule))


def active_grant(db: Session, child_id: int, user_id: int) -> AccessGrant | None:
    return db.scalar(
        select(AccessGrant).where(
            AccessGrant.child_id == child_id,
            AccessGrant.user_id == user_id,
            AccessGrant.revoked_at.is_(None),
        )
    )


def resolve_access(db: Session, user: User, child_id: int) -> ChildAccess | None:
    """The viewer's relationship to the child, or None if they have none (incl. admins)."""
    child = db.get(Child, child_id)
    if child is None or child.deleted_at is not None:
        return None
    if user.role == Role.parent and child.parent_id == user.id:
        return ChildAccess(child, user, Holder.parent, None)
    if user.role in (Role.teacher, Role.specialist):
        grant = active_grant(db, child_id, user.id)
        if grant is not None:
            return ChildAccess(child, user, Holder(grant.scope.value), grant)
    return None


def authorize(db: Session, user: User, child_id: int, need: Need) -> ChildAccess:
    """Checks `need` and audits non-parent access. Commits the audit row.

    For handlers whose path names another resource (a request, a grant) rather than the child.
    """
    access = resolve_access(db, user, child_id)
    if access is None:
        raise ApiError(404, "not_found")
    if not access.can(need):
        raise ApiError(403, "forbidden")
    if access.holder is not Holder.parent:
        # Committed now, so read-only endpoints are audited too.
        audit.record(db, user.id, child_id, need.verb, need.object)
        db.commit()
    return access


def require_child_access(need: Need) -> Callable[..., ChildAccess]:
    """Dependency for routes with a `{child_id}` path parameter."""

    def dependency(child_id: int, user: CurrentUser, db: DbSession) -> ChildAccess:
        return authorize(db, user, child_id, need)

    return dependency
