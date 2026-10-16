"""Screening reports and share links (SCREENING_SPEC §7, API §10)."""

import hashlib
import secrets
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Path, status
from sqlalchemy import select

from app.core.deps import CurrentUser, DbSession
from app.core.errors import ApiError
from app.core.permissions import Need, authorize
from app.core.questionnaire import load_questionnaire
from app.core.screenings import ScreeningReader, ScreeningWriter, require_finalized, shown_items
from app.models import Child, ReportShare, Screening
from app.models.base import utcnow
from app.schemas.reports import (
    Audience,
    CreateShareRequest,
    ReportChild,
    ReportItem,
    ReportOut,
    ReportTask,
    ScoreBand,
    ShareCreated,
    SharedReportOut,
    ShareOut,
)
from app.scoring.config import load_config
from app.scoring.results import RiskResult

router = APIRouter(tags=["reports"])


@router.get("/screenings/{screening_id}/report", operation_id="getScreeningReport")
def get_report(reader: ScreeningReader, audience: Audience = "parent") -> ReportOut:
    require_finalized(reader.screening)
    return build_report(reader.screening, reader.access.child, audience)


@router.get("/screenings/{screening_id}/shares", operation_id="listReportShares")
def list_shares(writer: ScreeningWriter) -> list[ShareOut]:
    return [_share_out(share) for share in reversed(writer.screening.shares)]


@router.post(
    "/screenings/{screening_id}/shares",
    operation_id="createReportShare",
    status_code=status.HTTP_201_CREATED,
)
def create_share(body: CreateShareRequest, writer: ScreeningWriter, db: DbSession) -> ShareCreated:
    """A read-only link to the doctor report. The token is returned once; only its hash is kept,
    so a leaked database can't open reports."""
    require_finalized(writer.screening)
    token = secrets.token_urlsafe(32)
    now = utcnow()
    share = ReportShare(
        token_hash=_hash(token),
        created_at=now,
        expires_at=now + timedelta(days=body.expires_in_days),
    )
    writer.screening.shares.append(share)
    db.commit()
    return ShareCreated(**_share_out(share).model_dump(), token=token)


@router.delete("/shares/{share_id}", operation_id="revokeReportShare")
def revoke_share(share_id: int, user: CurrentUser, db: DbSession) -> ShareOut:
    """By id rather than token: the parent's page can't show the token again after creating it."""
    share = db.get(ReportShare, share_id)
    if share is None:
        raise ApiError(404, "not_found")
    authorize(db, user, share.screening.child_id, Need.write_screenings)
    if share.revoked_at is None:
        share.revoked_at = utcnow()
        db.commit()
    return _share_out(share)


@router.get("/share/{token}", operation_id="getSharedReport")
def get_shared_report(
    token: Annotated[str, Path(max_length=100)], db: DbSession
) -> SharedReportOut:
    """Public: anyone with the link sees the doctor report, read-only, until it expires or the
    parent revokes it. Every open is counted."""
    share = db.scalar(select(ReportShare).where(ReportShare.token_hash == _hash(token)))
    child = db.get(Child, share.screening.child_id) if share else None
    if share is None or child is None or child.deleted_at is not None:
        raise ApiError(404, "share_not_found")
    if share.revoked_at is not None:
        raise ApiError(410, "share_revoked")
    if share.expires_at <= utcnow():
        raise ApiError(410, "share_expired")
    share.views += 1
    share.last_viewed_at = utcnow()
    db.commit()
    return SharedReportOut(
        expires_at=share.expires_at, report=build_report(share.screening, child, "clinician")
    )


def build_report(screening: Screening, child: Child, audience: Audience) -> ReportOut:
    assert screening.result_json is not None and screening.finalized_at is not None
    result = RiskResult.model_validate(screening.result_json)
    cfg = load_config()
    clinician = audience == "clinician"
    return ReportOut(
        audience=audience,
        screening_id=screening.id,
        report_no=f"SJ-{screening.finalized_at:%y%m}-{screening.id:04d}",
        is_demo=screening.is_demo,
        child=ReportChild(name=child.name, dob=child.dob, sex=child.sex),
        age_months=screening.age_months,
        informant=screening.informant,
        locale=screening.locale,
        created_at=screening.created_at,
        finalized_at=screening.finalized_at,
        questionnaire_version=load_questionnaire().version,
        parent_note=screening.parent_note if clinician else None,
        items=_items(screening, result),
        tasks=_tasks(screening, with_device=clinician),
        score_bands=[ScoreBand(risk_class=b.name, max_score=b.max_score) for b in cfg.classes],
        weights={str(name): weight for name, weight in cfg.weights.items()},
        result=result,
    )


def _items(screening: Screening, result: RiskResult) -> list[ReportItem]:
    answers = {a.item_id: a for a in screening.answers}
    scores = {s.item_id: s for s in result.questionnaire.items}
    rows = []
    for number, item in enumerate(shown_items(screening), start=1):
        answer, score = answers.get(item.id), scores.get(item.id)
        rows.append(
            ReportItem(
                item_id=item.id,
                number=number,
                domain=item.domain,
                type=item.type,
                critical=item.critical,
                text_bn=item.text_bn,
                text_en=item.text_en,
                option=answer.option if answer else None,
                other_text=answer.other_text if answer else None,
                mapped_by_ai=answer.mapped_by_ai if answer else False,
                concern=score.concern if score else None,
                failed=score.failed if score else False,
            )
        )
    return rows


def _tasks(screening: Screening, *, with_device: bool) -> list[ReportTask]:
    return [
        ReportTask.model_validate(
            {
                "task": row.task,
                "variant": row.variant,
                "demo": row.demo,
                "device": (row.payload_json or {}).get("device") if with_device else None,
                "quality": (row.payload_json or {}).get("quality"),
            }
        )
        for row in screening.tasks
        if row.payload_json is not None
    ]


def _share_out(share: ReportShare) -> ShareOut:
    if share.revoked_at is not None:
        state = "revoked"
    elif share.expires_at <= utcnow():
        state = "expired"
    else:
        state = "active"
    return ShareOut(
        id=share.id,
        created_at=share.created_at,
        expires_at=share.expires_at,
        revoked_at=share.revoked_at,
        views=share.views,
        last_viewed_at=share.last_viewed_at,
        status=state,
    )


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
