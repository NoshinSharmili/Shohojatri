from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.ai.answer_mapper import MappingStatus
from app.core.screening_results import TaskSlug, Variant
from app.models import Informant, Locale, ScreeningStatus
from app.scoring.inputs import AudioEvent, Frame, Marker
from app.scoring.items import ItemType
from app.scoring.names import RiskClass
from app.scoring.results import RiskResult

OtherText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1000)]


class CreateScreeningRequest(BaseModel):
    child_id: int
    locale: Locale
    informant: Informant


class ConsentRequest(BaseModel):
    # The version of the consent text the parent was shown (the web app owns the text).
    version: Annotated[str, StringConstraints(max_length=40)]


class AnswerRequest(BaseModel):
    option: Annotated[str, StringConstraints(max_length=24)]
    # The parent's own words, kept verbatim alongside the card they confirmed.
    other_text: OtherText | None = None


class MapOtherRequest(BaseModel):
    other_text: OtherText


class CompleteQuestionnaireRequest(BaseModel):
    note: Annotated[str, StringConstraints(strip_whitespace=True, max_length=2000)] | None = None


class OtherMappingOut(BaseModel):
    """`suggested`: confirm `option` or pick another card. `unclear` / `unavailable`: the parent
    picks the closest card (or not_sure)."""

    status: MappingStatus
    option: str | None
    confidence: float | None
    reason: str | None


class ItemOut(BaseModel):
    id: str
    domain: str
    type: ItemType
    text_bn: str
    text_en: str
    options: list[str]
    # False for q20: "Other" text is kept as the answer instead of being mapped to a card.
    maps_other: bool


class AnswerOut(BaseModel):
    item_id: str
    option: str
    other_text: str | None
    mapped_by_ai: bool
    ai_mapping: OtherMappingOut | None
    # False while an "Other" answer waits for the parent to confirm a card.
    final: bool
    updated_at: datetime


class DeviceInfo(BaseModel):
    """What the browser reports about the capture (shown in the doctor report)."""

    model_config = ConfigDict(extra="forbid")

    camera: Literal["front", "rear"] | None = None
    # Phone held by the parent, or a laptop/tablet on a table (§4.2).
    device_type: Literal["phone", "laptop"] | None = None
    width: int | None = Field(default=None, ge=0, le=10_000)
    height: int | None = Field(default=None, ge=0, le=10_000)
    fps: float | None = Field(default=None, ge=0, le=240)  # processing rate achieved
    user_agent: Annotated[str, StringConstraints(max_length=300)] | None = None


class CaptureQuality(BaseModel):
    """Capture conditions the browser measures and the scorer doesn't (§4.9)."""

    model_config = ConfigDict(extra="forbid")

    mean_luma: float | None = Field(default=None, ge=0, le=255)
    noise_db: float | None = Field(default=None, le=0)  # background RMS, dBFS


class TaskUpload(BaseModel):
    """One activity's extracted features (§4.1). Never video or audio."""

    frames: list[Frame]
    markers: list[Marker] = []
    audio_events: list[AudioEvent] = []
    # joint_attention / imitation only; on_screen when not given.
    variant: Variant | None = None
    device: DeviceInfo | None = None
    quality: CaptureQuality | None = None
    # Replayed from a recorded sample session (demo mode, §9): the screening is labelled Demo.
    demo: bool = False


class TaskOut(BaseModel):
    task: TaskSlug
    variant: Variant | None
    # Task status, or ok / fallback for the calibration (the browser retries once on fallback).
    status: Literal["ok", "low", "inconclusive", "fallback"]
    # Why a task is inconclusive (§4.9) or why the calibration fell back (§4.3).
    reason: str | None
    demo: bool
    created_at: datetime


class ScreeningSummary(BaseModel):
    id: int
    child_id: int
    status: ScreeningStatus
    is_demo: bool
    age_months: int
    consent_at: datetime | None
    questionnaire_completed_at: datetime | None
    created_at: datetime
    finalized_at: datetime | None
    # Questionnaire progress: items with a final answer / items shown at this age.
    answered: int
    total: int
    # Once finalized: the developmental concern score and its class (after the floors).
    score: int | None
    risk_class: RiskClass | None


class ScreeningOut(ScreeningSummary):
    child_name: str
    locale: Locale
    informant: Informant
    # Outside the 16-48 month design range the results are less reliable (SCREENING_SPEC §2).
    age_notice: Literal["younger", "older"] | None
    consent_version: str | None
    parent_note: str | None
    items: list[ItemOut]
    answers: list[AnswerOut]
    tasks: list[TaskOut]
    result: RiskResult | None
