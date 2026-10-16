"""Screening: start, consent, questionnaire, activity uploads and finalize (SCREENING_SPEC §2-§6,
API §10)."""

from typing import Annotated, Any

from fastapi import APIRouter, Depends, status
from sqlalchemy import select

from app.ai.answer_mapper import map_other_answer
from app.core.dates import age_in_months, today_bd
from app.core.deps import CurrentUser, DbSession
from app.core.errors import ApiError
from app.core.permissions import ChildAccess, Need, authorize, require_child_access
from app.core.questionnaire import load_questionnaire
from app.core.screening_results import (
    CALIBRATION,
    VARIANT_TASKS,
    Recording,
    TaskSlug,
    Variant,
    calibrate,
    detect,
    score_screening,
    stored_calibration,
)
from app.core.screenings import (
    CONSENT_VERSIONS,
    ScreeningReader,
    ScreeningWriter,
    age_notice,
    first_unanswered,
    is_final,
    progress,
    require_editable,
    require_in_progress,
    shown_items,
)
from app.models import Child, Screening, ScreeningAnswer, ScreeningStatus, ScreeningTask
from app.models.base import utcnow
from app.schemas.screenings import (
    AnswerOut,
    AnswerRequest,
    CompleteQuestionnaireRequest,
    ConsentRequest,
    CreateScreeningRequest,
    ItemOut,
    MapOtherRequest,
    OtherMappingOut,
    ScreeningOut,
    ScreeningSummary,
    TaskOut,
    TaskUpload,
)
from app.schemas.users import OkResponse
from app.scoring.calibration import FALLBACK
from app.scoring.config import load_config
from app.scoring.items import NOT_SURE, OTHER, Item
from app.scoring.names import TaskName
from app.scoring.results import RiskResult, skipped

router = APIRouter(tags=["screenings"])


ChildScreeningsReader = Annotated[ChildAccess, Depends(require_child_access(Need.read_screenings))]


@router.post("/screenings", operation_id="createScreening", status_code=status.HTTP_201_CREATED)
def create_screening(
    body: CreateScreeningRequest, user: CurrentUser, db: DbSession
) -> ScreeningOut:
    access = authorize(db, user, body.child_id, Need.write_screenings)
    eligibility = load_config().eligibility
    age = age_in_months(access.child.dob, today_bd())
    if not eligibility.min_age <= age <= eligibility.max_age:
        raise ApiError(422, "screening_age_out_of_range", detail={"age_months": age})
    # One screening at a time per child: the parent continues it, or deletes it to start again.
    open_id = db.scalar(
        select(Screening.id).where(
            Screening.child_id == access.child.id,
            Screening.status == ScreeningStatus.in_progress,
        )
    )
    if open_id is not None:
        raise ApiError(409, "screening_in_progress", detail={"screening_id": open_id})

    screening = Screening(
        child_id=access.child.id,
        created_by=user.id,
        locale=body.locale,
        age_months=age,
        informant=body.informant,
    )
    db.add(screening)
    db.commit()
    return _screening_out(screening, access.child)


@router.get("/children/{child_id}/screenings", operation_id="listChildScreenings")
def list_child_screenings(access: ChildScreeningsReader, db: DbSession) -> list[ScreeningSummary]:
    screenings = db.scalars(
        select(Screening)
        .where(Screening.child_id == access.child.id)
        .order_by(Screening.created_at.desc(), Screening.id.desc())
    )
    return [_summary(screening) for screening in screenings]


@router.get("/screenings/{screening_id}", operation_id="getScreening")
def get_screening(reader: ScreeningReader) -> ScreeningOut:
    return _screening_out(reader.screening, reader.access.child)


@router.delete("/screenings/{screening_id}", operation_id="deleteScreening")
def delete_screening(writer: ScreeningWriter, db: DbSession) -> OkResponse:
    """The consent promise: the parent can delete a screening at any time, answers included."""
    db.delete(writer.screening)
    db.commit()
    return OkResponse()


@router.post("/screenings/{screening_id}/consent", operation_id="acceptScreeningConsent")
def accept_consent(body: ConsentRequest, writer: ScreeningWriter, db: DbSession) -> ScreeningOut:
    screening = writer.screening
    require_in_progress(screening)
    if body.version not in CONSENT_VERSIONS:
        raise ApiError(409, "consent_outdated")
    # The first acceptance of a version is the one on record.
    if screening.consent_version != body.version:
        screening.consent_version = body.version
        screening.consent_at = utcnow()
        db.commit()
    return _screening_out(screening, writer.access.child)


@router.put("/screenings/{screening_id}/answers/{item_id}", operation_id="saveScreeningAnswer")
def save_answer(
    item_id: str, body: AnswerRequest, writer: ScreeningWriter, db: DbSession
) -> AnswerOut:
    """Saves one answer: a card, or (with `other_text`) the card the parent confirmed for their
    own words. Unmapped items (q20) take `option: "other"` with the text as the answer."""
    screening = writer.screening
    item = _editable_item(screening, item_id)
    option, text = body.option, body.other_text
    # not_sure off the cards (q13) only as the "couldn't pick a card for my words" fallback.
    fallback_only = option == NOT_SURE and NOT_SURE not in item.options
    if not item.accepts(option) or (fallback_only and text is None):
        raise ApiError(422, "invalid_option", detail={"field": "option"})
    if option == OTHER:
        if item.maps_other:
            # Own words on a scored item go through map-other and a confirmed card.
            raise ApiError(422, "other_needs_mapping", detail={"field": "option"})
        if text is None:
            raise ApiError(422, "other_text_required", detail={"field": "other_text"})

    answer = _answer(screening, item.id)
    # Keep the AI's suggestion only while it still describes the same words.
    suggestion = answer.ai_mapping_json if text is not None and answer.other_text == text else None
    answer.option = option
    answer.other_text = text
    answer.ai_mapping_json = suggestion
    answer.mapped_by_ai = bool(suggestion and suggestion.get("option") == option)
    db.commit()
    return _answer_out(item, answer)


@router.post(
    "/screenings/{screening_id}/answers/{item_id}/map-other", operation_id="mapOtherAnswer"
)
def map_other(
    item_id: str, body: MapOtherRequest, writer: ScreeningWriter, db: DbSession
) -> OtherMappingOut:
    """Stores the parent's own words as an answer waiting for confirmation, and suggests the
    closest card (SCREENING_SPEC §3.3). Without AI the status is `unavailable`."""
    screening = writer.screening
    item = _editable_item(screening, item_id)
    if not item.maps_other:
        raise ApiError(422, "other_not_mapped")
    user = writer.access.user
    mapping = map_other_answer(item, body.other_text, user.preferred_locale, db=db, user_id=user.id)

    answer = _answer(screening, item.id)
    answer.option = OTHER
    answer.other_text = body.other_text
    answer.ai_mapping_json = mapping.as_json()
    answer.mapped_by_ai = False
    db.commit()
    return OtherMappingOut.model_validate(mapping.as_json())


@router.post("/screenings/{screening_id}/questionnaire", operation_id="completeQuestionnaire")
def complete_questionnaire(
    body: CompleteQuestionnaireRequest, writer: ScreeningWriter, db: DbSession
) -> ScreeningOut:
    """Ends Part 1 with the parent's optional free-text note. Every item needs an answer
    ("Not sure" counts)."""
    screening = writer.screening
    require_editable(screening)
    missing = first_unanswered(screening)
    if missing is not None:
        raise ApiError(409, "questionnaire_incomplete", detail={"item_id": missing.id})
    screening.parent_note = body.note or None
    screening.questionnaire_completed_at = utcnow()
    db.commit()
    return _screening_out(screening, writer.access.child)


@router.post("/screenings/{screening_id}/tasks/{task}", operation_id="uploadScreeningTask")
def upload_task(
    task: TaskSlug, body: TaskUpload, writer: ScreeningWriter, db: DbSession
) -> TaskOut:
    """Stores one activity's features (never media) and scores it now, so the browser can offer
    "Try again" (or retry a calibration that fell back). Uploading again replaces the task.
    Finalize scores every stored task again, with the final calibration."""
    screening = writer.screening
    require_editable(screening)
    variant = _variant(task, body.variant)
    # The detectors read time-ordered streams; the browser may batch out of order.
    recording = Recording(
        frames=tuple(sorted(body.frames, key=lambda f: f.t)),
        markers=tuple(sorted(body.markers, key=lambda m: m.t)),
        audio_events=tuple(sorted(body.audio_events, key=lambda e: e.t)),
    )
    cfg = load_config()
    result: dict[str, Any]
    if task == CALIBRATION:
        calibration = calibrate(recording, cfg)
        status_value: str = calibration.status
        result = calibration.model_dump(mode="json")
    else:
        rows = {row.task: row for row in screening.tasks}
        scored = detect(TaskName(task), variant, recording, stored_calibration(rows, cfg), cfg)
        status_value = scored.status.value
        result = scored.model_dump(mode="json")

    row = _task_row(screening, task)
    row.variant = variant
    row.status = status_value
    row.demo = body.demo
    row.payload_json = {
        "frames": [f.model_dump(exclude_none=True) for f in recording.frames],
        "markers": [m.model_dump(exclude_none=True) for m in recording.markers],
        "audio_events": [e.model_dump() for e in recording.audio_events],
        "device": body.device.model_dump(exclude_none=True) if body.device else None,
        "quality": body.quality.model_dump(exclude_none=True) if body.quality else None,
    }
    row.result_json = result
    row.created_at = utcnow()
    if body.demo:
        # Sticky: one replayed task makes the whole screening a demo, labelled in every report.
        screening.is_demo = True
    db.commit()
    return _task_out(row)


@router.post("/screenings/{screening_id}/tasks/{task}/skip", operation_id="skipScreeningTask")
def skip_task(task: TaskSlug, writer: ScreeningWriter, db: DbSession) -> TaskOut:
    """Skipped tasks are excluded from the score (and lower confidence), never counted as
    concern (§1). A skipped calibration means gaze tasks use the fallback (§4.3)."""
    screening = writer.screening
    require_editable(screening)
    row = _task_row(screening, task)
    row.variant = None
    row.demo = False
    row.payload_json = None
    if task == CALIBRATION:
        row.status = FALLBACK.status
        row.result_json = FALLBACK.model_dump(mode="json")
    else:
        result = skipped(TaskName(task))
        row.status = result.status.value
        row.result_json = result.model_dump(mode="json")
    row.created_at = utcnow()
    db.commit()
    return _task_out(row)


@router.post("/screenings/{screening_id}/finalize", operation_id="finalizeScreening")
def finalize_screening(writer: ScreeningWriter, db: DbSession) -> ScreeningOut:
    """Scores the questionnaire and every stored task, combines them (§6) and stores the
    result. Activities are optional: with none, the result rests on the answers (§1)."""
    screening = writer.screening
    require_editable(screening)
    missing = first_unanswered(screening)
    if screening.questionnaire_completed_at is None or missing is not None:
        raise ApiError(
            409, "questionnaire_incomplete", detail={"item_id": missing.id if missing else None}
        )
    result = score_screening(screening, load_config())
    screening.result_json = result.model_dump(mode="json")
    screening.scoring_version = result.scoring_version
    screening.status = ScreeningStatus.finalized
    screening.finalized_at = utcnow()
    db.commit()
    return _screening_out(screening, writer.access.child)


def _variant(task: TaskSlug, variant: Variant | None) -> Variant | None:
    if task in VARIANT_TASKS:
        return variant or "on_screen"
    if variant is not None:
        raise ApiError(422, "invalid_variant", detail={"field": "variant"})
    return None


def _task_row(screening: Screening, task: str) -> ScreeningTask:
    row = next((t for t in screening.tasks if t.task == task), None)
    if row is None:
        row = ScreeningTask(task=task)
        screening.tasks.append(row)
    return row


def _task_out(row: ScreeningTask) -> TaskOut:
    result = row.result_json
    if row.task == CALIBRATION:
        reason = result.get("reason") or ("skipped" if row.payload_json is None else None)
    else:
        reason = result["quality"].get("reason")
    return TaskOut.model_validate(
        {
            "task": row.task,
            "variant": row.variant,
            "status": row.status,
            "reason": reason,
            "demo": row.demo,
            "created_at": row.created_at,
        }
    )


def _editable_item(screening: Screening, item_id: str) -> Item:
    require_editable(screening)
    item = load_questionnaire().item(item_id)
    # Items above the child's age don't exist for this screening.
    if item is None or not item.shown_at(screening.age_months):
        raise ApiError(404, "not_found")
    return item


def _answer(screening: Screening, item_id: str) -> ScreeningAnswer:
    answer = next((a for a in screening.answers if a.item_id == item_id), None)
    if answer is None:
        answer = ScreeningAnswer(item_id=item_id)
        screening.answers.append(answer)
    return answer


def _answer_out(item: Item, answer: ScreeningAnswer) -> AnswerOut:
    mapping = answer.ai_mapping_json
    return AnswerOut(
        item_id=answer.item_id,
        option=answer.option,
        other_text=answer.other_text,
        mapped_by_ai=answer.mapped_by_ai,
        ai_mapping=OtherMappingOut.model_validate(mapping) if mapping else None,
        final=is_final(item, answer),
        updated_at=answer.updated_at,
    )


def _summary(screening: Screening) -> ScreeningSummary:
    answered, total = progress(screening)
    return ScreeningSummary(
        id=screening.id,
        child_id=screening.child_id,
        status=screening.status,
        is_demo=screening.is_demo,
        age_months=screening.age_months,
        consent_at=screening.consent_at,
        questionnaire_completed_at=screening.questionnaire_completed_at,
        created_at=screening.created_at,
        finalized_at=screening.finalized_at,
        answered=answered,
        total=total,
        score=result.get("score") if (result := screening.result_json) else None,
        risk_class=result.get("risk_class") if result else None,
    )


def _screening_out(screening: Screening, child: Child) -> ScreeningOut:
    items = shown_items(screening)
    by_id = {item.id: item for item in items}
    return ScreeningOut(
        **_summary(screening).model_dump(),
        child_name=child.name,
        locale=screening.locale,
        informant=screening.informant,
        age_notice=age_notice(screening.age_months, load_config().eligibility),
        consent_version=screening.consent_version,
        parent_note=screening.parent_note,
        items=[
            ItemOut(
                id=item.id,
                domain=item.domain,
                type=item.type,
                text_bn=item.text_bn,
                text_en=item.text_en,
                options=list(item.options),
                maps_other=item.maps_other,
            )
            for item in items
        ],
        answers=[_answer_out(by_id[a.item_id], a) for a in screening.answers if a.item_id in by_id],
        tasks=[_task_out(row) for row in screening.tasks],
        result=RiskResult.model_validate(screening.result_json) if screening.result_json else None,
    )
