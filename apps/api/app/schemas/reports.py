from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel

from app.core.screening_results import TaskSlug, Variant
from app.models import Informant, Locale, Sex
from app.schemas.screenings import CaptureQuality, DeviceInfo
from app.scoring.items import ItemType
from app.scoring.names import RiskClass
from app.scoring.results import RiskResult

Audience = Literal["parent", "clinician"]


class ReportChild(BaseModel):
    name: str
    dob: date
    sex: Sex | None


class ReportItem(BaseModel):
    """One questionnaire row of the doctor report: the item, the answer and how it scored."""

    item_id: str
    number: int  # position in the questionnaire (q07 → 7)
    domain: str
    type: ItemType
    critical: bool
    text_bn: str
    text_en: str
    option: str | None
    # The parent's own words, verbatim, with the card they confirmed (§3.3).
    other_text: str | None
    mapped_by_ai: bool
    concern: float | None  # None when not scored (not_sure, q20)
    failed: bool


class ReportTask(BaseModel):
    """How an activity was captured. Scores and trials are in `result.tasks`."""

    task: TaskSlug
    variant: Variant | None
    demo: bool
    device: DeviceInfo | None  # doctor report only
    quality: CaptureQuality | None


class ScoreBand(BaseModel):
    risk_class: RiskClass
    max_score: int


class ReportOut(BaseModel):
    """Everything both reports are rendered from (§7): deterministic, no LLM.

    The parent audience leaves out what only the doctor report shows (the parent's note, the
    device); the result, answers and capture quality are the same for both."""

    audience: Audience
    screening_id: int
    report_no: str
    is_demo: bool
    child: ReportChild
    age_months: int  # at the screening
    informant: Informant
    locale: Locale  # the language the parent screened in
    created_at: datetime
    finalized_at: datetime
    questionnaire_version: str
    parent_note: str | None
    items: list[ReportItem]
    tasks: list[ReportTask]
    # Class bands and component weights from the scoring config, for the gauge and method note.
    score_bands: list[ScoreBand]
    weights: dict[str, float]
    result: RiskResult


class CreateShareRequest(BaseModel):
    # The share sheet offers 24 hours, 7 days and 30 days; 30 days is the default (§7).
    expires_in_days: Literal[1, 7, 30] = 30


class ShareOut(BaseModel):
    id: int
    created_at: datetime
    expires_at: datetime
    revoked_at: datetime | None
    views: int
    last_viewed_at: datetime | None
    status: Literal["active", "expired", "revoked"]


class ShareCreated(ShareOut):
    # Only returned here: the server keeps a hash, so the link can't be shown again later.
    token: str


class SharedReportOut(BaseModel):
    """The public view of a share link: the doctor report, read-only."""

    expires_at: datetime
    report: ReportOut
