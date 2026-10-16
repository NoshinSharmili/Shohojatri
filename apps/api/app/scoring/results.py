"""What the scoring engine returns (SCREENING_SPEC §5-§6). Stored as JSON in the result and
rendered into reports without an LLM: findings are i18n keys + params."""

from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.scoring.inputs import Side
from app.scoring.names import RiskClass, TaskName

Param = int | float | str | None
Polarity = Literal["concern", "strength"]


class _Result(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")


class TaskStatus(StrEnum):
    ok = "ok"
    low = "low"  # valid, but measured in poor conditions: counts, and lowers confidence
    inconclusive = "inconclusive"  # excluded from the score


class InconclusiveReason(StrEnum):
    skipped = "skipped"
    no_data = "no_data"
    face_not_visible = "face_not_visible"
    body_not_visible = "body_not_visible"
    gaze_not_tracked = "gaze_not_tracked"
    not_enough_valid_trials = "not_enough_valid_trials"


class Finding(_Result):
    """One report sentence: `key` is a web i18n key, `params` fill it in. `source` is the task or
    the questionnaire item it came from. `points` is its share of the 0-100 score (§6.5)."""

    key: str
    params: dict[str, Param] = {}
    polarity: Polarity
    source: str
    points: float | None = None


class TaskQuality(_Result):
    face_pct: float | None = None  # share of the task with the face seen, 0-1
    pose_pct: float | None = None
    calibration: Literal["ok", "fallback"] | None = None
    valid_trials: int | None = None
    status: TaskStatus
    reason: InconclusiveReason | None = None


class RtnTrial(_Result):
    kind: Literal["rtn"] = "rtn"
    trial: int
    prompt_ms: float
    t0_ms: float
    t0_estimated: bool
    pre_state: Literal["away", "facing"]
    face_share_before: float
    latency_ms: float | None
    eye_contact_ms: float | None
    valid: bool
    invalid_reason: Literal["pre_state_facing", "face_not_visible", "something_wrong"] | None
    concern: float | None


class JointAttentionTrial(_Result):
    kind: Literal["joint_attention"] = "joint_attention"
    trial: int
    side: Side
    cue_ms: float
    first_look: Side | None  # first look (on-screen) or head turn (live) in the window
    first_look_ms: float | None  # from the cue (on-screen) or voice onset (live)
    followed: bool
    face_share: float
    attended_centre: bool | None = None  # on-screen only
    t0_estimated: bool | None = None  # live only
    valid: bool
    invalid_reason: (
        Literal["face_not_visible", "not_attending", "no_baseline", "something_wrong"] | None
    )


class ImitationTrial(_Result):
    kind: Literal["imitation"] = "imitation"
    action: Literal["arms_up", "clap", "wave", "touch_head"]
    windows: int  # response windows seen (1, or 2 after the automatic retry)
    outcome: Literal["detected", "attempt", "none"] | None
    pose_share: float  # best window
    valid: bool
    invalid_reason: Literal["body_not_visible", "something_wrong"] | None
    concern: float | None


class MovementEpisode(_Result):
    kind: Literal["movement_episode"] = "movement_episode"
    movement: Literal["arm", "rocking"]
    start_ms: float
    end_ms: float


Trial = Annotated[
    RtnTrial | JointAttentionTrial | ImitationTrial | MovementEpisode, Field(discriminator="kind")
]


class TaskResult(_Result):
    task: TaskName
    status: TaskStatus
    concern: float | None  # 0-1; None when inconclusive
    metrics: dict[str, Param] = {}
    trials: tuple[Trial, ...] = ()
    quality: TaskQuality
    findings: tuple[Finding, ...] = ()

    @property
    def valid(self) -> bool:
        return self.status is not TaskStatus.inconclusive


def skipped(task: TaskName) -> TaskResult:
    """A task the parent skipped: excluded from the score, listed with its reason (§4.9)."""
    return inconclusive(task, InconclusiveReason.skipped, TaskQuality(status=TaskStatus.ok))


def inconclusive(
    task: TaskName,
    reason: InconclusiveReason,
    quality: TaskQuality,
    *,
    metrics: dict[str, Param] | None = None,
    trials: tuple[Trial, ...] = (),
) -> TaskResult:
    return TaskResult(
        task=task,
        status=TaskStatus.inconclusive,
        concern=None,
        metrics=metrics or {},
        trials=trials,
        quality=quality.model_copy(update={"status": TaskStatus.inconclusive, "reason": reason}),
    )


class ItemResult(_Result):
    item_id: str
    option: str | None
    concern: float | None
    weight: float
    critical: bool
    failed: bool


class QuestionnaireSummary(_Result):
    score: float | None
    eligible: int
    scorable: int
    low_coverage: bool
    failed_critical: tuple[str, ...]
    regression: bool
    hearing: str | None
    items: tuple[ItemResult, ...]


class Component(_Result):
    """One part of the score: the questionnaire or a valid task."""

    name: Literal["questionnaire"] | TaskName
    weight: float  # as configured
    share: float  # after renormalising over the available components
    concern: float
    points: float  # share * concern * 100


class Floor(_Result):
    rule: Literal["regression", "failed_critical"]
    from_class: RiskClass
    to_class: RiskClass


class ExcludedTask(_Result):
    task: TaskName
    reason: InconclusiveReason | None


class Confidence(StrEnum):
    low = "low"
    medium = "medium"
    high = "high"


class RiskResult(_Result):
    scoring_version: str
    score: int | None  # developmental concern score 0-100; None when nothing was scorable
    score_class: RiskClass | None  # from the score alone
    risk_class: RiskClass | None  # after the floors
    floors: tuple[Floor, ...]
    red_flags: tuple[Literal["regression"], ...]
    recommendations: tuple[str, ...]  # web i18n keys, most important first
    confidence: Confidence
    components: tuple[Component, ...]
    excluded_tasks: tuple[ExcludedTask, ...]
    questionnaire: QuestionnaireSummary
    tasks: tuple[TaskResult, ...]
    top_concerns: tuple[Finding, ...]
    strengths: tuple[Finding, ...]
