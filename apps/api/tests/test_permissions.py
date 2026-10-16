"""Every role, permission and grant state through `require_child_access` (COMPANION_SPEC §3.2).

The expectations below are transcribed from the spec table by hand, independently of
app/core/permissions.py, so a wrong entry in the code's table fails here.
"""

from collections.abc import Callable
from dataclasses import dataclass
from typing import Annotated

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.permissions import PERMISSIONS, ChildAccess, Need, require_child_access
from app.models import (
    AccessGrant,
    AccessRequest,
    AuditLog,
    GrantScope,
    Role,
)
from app.models.base import utcnow
from tests.conftest import MakeChild, MakeUser

# Spec §3.2 columns: parent · teacher (education) · specialist (clinical), with the parent's
# default choices at approval (teacher: no medications, no documents; specialist: documents).
T, F = True, False
SPEC: dict[str, tuple[bool, bool, bool]] = {
    "read:profile": (T, T, T),
    "read:diagnosis": (T, T, T),
    "read:care_plan": (T, T, T),
    "read:medications": (T, F, T),
    "read:documents": (T, F, T),
    "read:screenings": (T, F, T),
    "write:screenings": (T, F, F),
    "read:logs": (T, T, T),
    "read:clinical_logs": (T, F, T),
    "write:logs": (T, T, T),
    "write:clinical_notes": (F, F, T),
    "write:care_plan": (T, F, T),
    "suggest:goals": (F, T, F),
    "use:chat": (T, T, T),
    "write:profile": (T, F, F),
    "manage:access": (T, F, F),
}
# What changes when the parent flips the sharing options away from the defaults.
TEACHER_SHARED = {"read:medications": T, "read:documents": T}  # both ticked
SPECIALIST_UNSHARED = {"read:documents": F}  # documents unticked


@dataclass(frozen=True)
class Viewer:
    """Who is asking, and how they stand with the child."""

    id: str
    role: Role
    owns_child: bool = False
    grant: str = "none"  # none | pending | approved | revoked
    share_medications: bool = False
    share_documents: bool = False

    def expected(self, need: str) -> int:
        if self.owns_child:
            return 200 if SPEC[need][0] else 403
        if self.role not in (Role.teacher, Role.specialist) or self.grant != "approved":
            return 404  # no relationship → the child doesn't exist for them
        allowed = SPEC[need][1 if self.role == Role.teacher else 2]
        if self.role == Role.teacher and self.share_medications and self.share_documents:
            allowed = TEACHER_SHARED.get(need, allowed)
        if self.role == Role.specialist and not self.share_documents:
            allowed = SPECIALIST_UNSHARED.get(need, allowed)
        return 200 if allowed else 403


VIEWERS = [
    Viewer("parent-owner", Role.parent, owns_child=True),
    Viewer("parent-other", Role.parent),
    Viewer("admin", Role.admin),
    *(
        Viewer(f"{role.value}-{state}", role, grant=state)
        for role in (Role.teacher, Role.specialist)
        for state in ("none", "pending", "revoked")
    ),
    Viewer("teacher-approved", Role.teacher, grant="approved"),
    Viewer(
        "teacher-approved-shared",
        Role.teacher,
        grant="approved",
        share_medications=True,
        share_documents=True,
    ),
    Viewer(
        "specialist-approved",
        Role.specialist,
        grant="approved",
        share_medications=True,
        share_documents=True,
    ),
    Viewer(
        "specialist-approved-docs-unticked",
        Role.specialist,
        grant="approved",
        share_medications=True,
    ),
]


def test_spec_transcription_covers_every_need() -> None:
    assert set(SPEC) == {need.value for need in Need} == {need.value for need in PERMISSIONS}


@pytest.fixture
def probe_app(app: FastAPI) -> FastAPI:
    """One probe route per permission, guarded exactly like a real child endpoint."""
    for need in Need:

        def endpoint(
            access: Annotated[ChildAccess, Depends(require_child_access(need))],
        ) -> dict[str, str]:
            return {"holder": access.holder.value}

        app.add_api_route(f"/probe/{{child_id}}/{need.value}", endpoint, methods=["GET"])
    return app


@pytest.mark.parametrize("need", [need.value for need in Need])
@pytest.mark.parametrize("viewer", VIEWERS, ids=lambda v: v.id)
def test_permission_matrix(
    probe_app: FastAPI,
    db: Session,
    make_user: MakeUser,
    make_child: MakeChild,
    login: Callable[[str], TestClient],
    viewer: Viewer,
    need: str,
) -> None:
    owner = make_user(Role.parent, email="owner@test.bd")
    child = make_child(owner)
    user = owner if viewer.owns_child else make_user(viewer.role, email="viewer@test.bd")

    if viewer.grant in ("pending", "approved", "revoked"):
        db.add(AccessRequest(child_id=child.id, requester_id=user.id, child_code=child.code))
    if viewer.grant in ("approved", "revoked"):
        db.add(
            AccessGrant(
                child_id=child.id,
                user_id=user.id,
                scope=GrantScope.education if viewer.role == Role.teacher else GrantScope.clinical,
                share_medications=viewer.share_medications,
                share_documents=viewer.share_documents,
                revoked_at=utcnow() if viewer.grant == "revoked" else None,
            )
        )
    db.commit()

    client = login(user.email or "")
    response = client.get(f"/probe/{child.id}/{need}")
    expected = viewer.expected(need)
    assert response.status_code == expected, response.text

    audited = db.scalars(select(AuditLog).where(AuditLog.child_id == child.id)).all()
    if expected == 200 and not viewer.owns_child:
        # Every non-parent access is audited, with the permission's verb and object.
        verb, obj = need.split(":")
        assert [(a.actor_id, a.action, a.resource) for a in audited] == [(user.id, verb, obj)]
    else:
        # The parent's own reads, and refused attempts, aren't data access by someone else.
        assert audited == []
