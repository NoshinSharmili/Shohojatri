"""Joining a child's care team: requests by Child ID, the parent's decision, grants
(COMPANION_SPEC §3.1, §3.2)."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy import select, update

from app.core import audit
from app.core.access_requests import DAILY_LIMIT, expire_stale_requests, requests_sent_today
from app.core.child_codes import normalize_code
from app.core.deps import CurrentUser, DbSession, require_roles
from app.core.errors import ApiError
from app.core.notifications import notify
from app.core.permissions import Need, active_grant, authorize
from app.models import (
    AccessGrant,
    AccessRequest,
    AccessRequestStatus,
    Child,
    GrantScope,
    NotificationKind,
    Role,
    User,
)
from app.models.base import utcnow
from app.schemas.access import (
    AccessRequestSent,
    ApproveAccessRequest,
    CreateAccessRequest,
    Grant,
    OutgoingAccessRequest,
    UpdateGrant,
)
from app.schemas.users import OkResponse

router = APIRouter(tags=["access"])

Requester = Annotated[User, Depends(require_roles(Role.teacher, Role.specialist))]

_OUTGOING_LIMIT = 50


@router.post(
    "/access-requests", operation_id="createAccessRequest", status_code=status.HTTP_202_ACCEPTED
)
def create_access_request(
    body: CreateAccessRequest, user: Requester, db: DbSession
) -> AccessRequestSent:
    """Always the same answer, whether or not the code belongs to a child (no enumeration)."""
    code = normalize_code(body.child_code)
    if code is None:
        # The format is public, so saying it's malformed reveals nothing about which IDs exist.
        raise ApiError(422, "invalid_child_code", detail={"field": "child_code"})

    expire_stale_requests(db)
    # Repeating an open request sends nothing new, whatever the code matched.
    already_open = db.scalar(
        select(AccessRequest.id).where(
            AccessRequest.requester_id == user.id,
            AccessRequest.child_code == code,
            AccessRequest.status == AccessRequestStatus.pending,
        )
    )
    if already_open is not None:
        return AccessRequestSent()
    if requests_sent_today(db, user.id) >= DAILY_LIMIT:
        raise ApiError(429, "access_request_limit", detail={"limit": DAILY_LIMIT})

    child = db.scalar(select(Child).where(Child.code == code, Child.deleted_at.is_(None)))
    if child is not None and active_grant(db, child.id, user.id) is not None:
        # Already on the team: they know this child exists, so nothing is revealed.
        return AccessRequestSent()

    request = AccessRequest(
        child_id=child.id if child else None,
        requester_id=user.id,
        child_code=code,
        message=body.message or None,
    )
    db.add(request)
    db.flush()
    if child is not None:
        notify(
            db,
            child.parent_id,
            NotificationKind.access_request_received,
            child_id=child.id,
            child_name=child.name,
            requester_name=user.name,
            requester_role=user.role.value,
        )
        audit.record(db, user.id, child.id, "request", f"access_request:{request.id}")
    db.commit()
    return AccessRequestSent()


@router.get("/access-requests", operation_id="listMyAccessRequests")
def list_my_access_requests(user: Requester, db: DbSession) -> list[OutgoingAccessRequest]:
    expire_stale_requests(db)
    requests = db.scalars(
        select(AccessRequest)
        .where(AccessRequest.requester_id == user.id)
        .order_by(AccessRequest.created_at.desc(), AccessRequest.id.desc())
        .limit(_OUTGOING_LIMIT)
    )
    return [OutgoingAccessRequest.model_validate(r) for r in requests]


@router.post("/access-requests/{request_id}/approve", operation_id="approveAccessRequest")
def approve_access_request(
    request_id: int, body: ApproveAccessRequest, user: CurrentUser, db: DbSession
) -> Grant:
    request, child = _pending_request_for_parent(db, user, request_id)
    requester = db.get(User, request.requester_id)
    assert requester is not None  # FK with ON DELETE CASCADE

    is_teacher = requester.role == Role.teacher
    grant = active_grant(db, child.id, requester.id)
    if grant is None:
        grant = AccessGrant(
            child_id=child.id,
            user_id=requester.id,
            scope=GrantScope.education if is_teacher else GrantScope.clinical,
        )
        db.add(grant)
    # Clinical scope always includes medications (COMPANION_SPEC §3.2).
    grant.share_medications = bool(body.share_medications) if is_teacher else True
    grant.share_documents = (
        body.share_documents if body.share_documents is not None else not is_teacher
    )
    grant.can_add_logs = True

    # The same person may have asked twice (e.g. with an old and a new Child ID).
    db.execute(
        update(AccessRequest)
        .where(
            AccessRequest.child_id == child.id,
            AccessRequest.requester_id == requester.id,
            AccessRequest.status == AccessRequestStatus.pending,
        )
        .values(status=AccessRequestStatus.approved, decided_at=utcnow())
    )
    notify(
        db,
        requester.id,
        NotificationKind.access_request_approved,
        child_id=child.id,
        child_name=child.name,
    )
    audit.record(db, user.id, child.id, "approve", f"access_request:{request.id}")
    db.commit()
    return Grant.of(grant, requester)


@router.post("/access-requests/{request_id}/decline", operation_id="declineAccessRequest")
def decline_access_request(request_id: int, user: CurrentUser, db: DbSession) -> OkResponse:
    request, child = _pending_request_for_parent(db, user, request_id)
    request.status = AccessRequestStatus.declined
    request.decided_at = utcnow()
    # Only the code they typed: a declined requester never learns the child's name.
    notify(
        db,
        request.requester_id,
        NotificationKind.access_request_declined,
        child_code=request.child_code,
    )
    audit.record(db, user.id, child.id, "decline", f"access_request:{request.id}")
    db.commit()
    return OkResponse()


@router.post("/access-requests/{request_id}/cancel", operation_id="cancelAccessRequest")
def cancel_access_request(request_id: int, user: Requester, db: DbSession) -> OutgoingAccessRequest:
    expire_stale_requests(db)
    request = db.get(AccessRequest, request_id)
    if request is None or request.requester_id != user.id:
        raise ApiError(404, "not_found")
    if request.status != AccessRequestStatus.pending:
        raise ApiError(409, "request_not_pending")
    request.status = AccessRequestStatus.cancelled
    request.decided_at = utcnow()
    if request.child_id is not None:
        audit.record(db, user.id, request.child_id, "cancel", f"access_request:{request.id}")
    db.commit()
    return OutgoingAccessRequest.model_validate(request)


@router.patch("/grants/{grant_id}", operation_id="updateGrant")
def update_grant(grant_id: int, body: UpdateGrant, user: CurrentUser, db: DbSession) -> Grant:
    grant = _active_grant_for_parent(db, user, grant_id)
    if body.share_medications is not None and grant.scope == GrantScope.education:
        grant.share_medications = body.share_medications
    if body.share_documents is not None:
        grant.share_documents = body.share_documents
    audit.record(db, user.id, grant.child_id, "update", f"grant:{grant.id}")
    db.commit()
    member = db.get(User, grant.user_id)
    assert member is not None
    return Grant.of(grant, member)


@router.delete("/grants/{grant_id}", operation_id="revokeGrant")
def revoke_grant(grant_id: int, user: CurrentUser, db: DbSession) -> OkResponse:
    """Takes effect on the member's next request: every access re-checks the grant."""
    grant = _active_grant_for_parent(db, user, grant_id)
    grant.revoked_at = utcnow()
    audit.record(db, user.id, grant.child_id, "revoke", f"grant:{grant.id}")
    db.commit()
    return OkResponse()


def _pending_request_for_parent(
    db: DbSession, user: User, request_id: int
) -> tuple[AccessRequest, Child]:
    expire_stale_requests(db)
    request = db.get(AccessRequest, request_id)
    # Requests for codes that matched no child have no parent who could decide them.
    if request is None or request.child_id is None:
        raise ApiError(404, "not_found")
    access = authorize(db, user, request.child_id, Need.manage_access)
    if request.status != AccessRequestStatus.pending:
        raise ApiError(409, "request_not_pending")
    return request, access.child


def _active_grant_for_parent(db: DbSession, user: User, grant_id: int) -> AccessGrant:
    grant = db.get(AccessGrant, grant_id)
    if grant is None or grant.revoked_at is not None:
        raise ApiError(404, "not_found")
    authorize(db, user, grant.child_id, Need.manage_access)
    return grant
