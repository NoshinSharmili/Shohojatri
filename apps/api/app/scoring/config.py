"""Typed view of config.yaml. Loading is the only I/O in the scoring package; the scoring
functions take the loaded config as an argument."""

from functools import lru_cache
from pathlib import Path
from typing import Literal, Self

import yaml
from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.scoring.items import Direction
from app.scoring.names import RiskClass, TaskName

CONFIG_PATH = Path(__file__).with_name("config.yaml")


class _Strict(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")


class Eligibility(_Strict):
    min_age: int
    designed_min_age: int
    designed_max_age: int
    max_age: int


class CommunicationBand(_Strict):
    min_age: int
    concern: dict[str, float]


class QuestionnaireConfig(_Strict):
    min_scorable_share: float
    freq_concern: dict[Direction, dict[str, float]]
    regression_concern: dict[str, float]
    communication_concern: tuple[CommunicationBand, ...]

    @model_validator(mode="after")
    def _bands_cover_every_age(self) -> Self:
        ages = [band.min_age for band in self.communication_concern]
        if not ages or ages[0] != 0 or ages != sorted(set(ages)):
            raise ValueError("communication_concern bands must start at 0 and ascend")
        return self

    def communication_band(self, age_months: int) -> CommunicationBand:
        return [b for b in self.communication_concern if b.min_age <= age_months][-1]


class Signals(_Strict):
    max_hold_ms: float = Field(gt=0)
    min_visibility: float
    smoothing_frames: int = Field(ge=1)


class VoiceOnset(_Strict):
    search_ms: float
    baseline_ms: float
    rise_db: float
    fallback_ms: float


class CalibrationConfig(_Strict):
    segment_ms: float
    median_ms: float
    min_face_share: float
    fallback_yaw_deg: float


class Quality(_Strict):
    low_presence_share: float


class Facing(_Strict):
    max_yaw: float
    max_pitch: float
    min_ms: float


class LatencyBand(_Strict):
    max_ms: float
    concern: float


class RtnConfig(_Strict):
    facing: Facing
    response_window_ms: float
    eye_contact_cap_ms: float
    latency_concern: tuple[LatencyBand, ...]
    no_response_concern: float
    pre_t0_ms: float
    min_face_share: float
    min_valid_trials: int

    @model_validator(mode="after")
    def _bands_ascend(self) -> Self:
        limits = [band.max_ms for band in self.latency_concern]
        if not limits or limits != sorted(set(limits)) or limits[-1] > self.response_window_ms:
            raise ValueError("latency_concern bands must ascend within the response window")
        return self


class Linear(_Strict):
    """Concern 0 at `none_at`, 1 at `full_at`, linear in between (either direction)."""

    none_at: float
    full_at: float

    def concern(self, value: float) -> float:
        share = (value - self.none_at) / (self.full_at - self.none_at)
        return min(1.0, max(0.0, share))


class GazeHold(_Strict):
    min_abs_gaze: float = 0.0
    max_abs_gaze: float = 0.0
    min_ms: float


class OnScreenJA(_Strict):
    engage_ms: float
    window_ms: float
    look: GazeHold
    centre: GazeHold
    min_face_share: float
    min_valid_trials: int


class LiveJA(_Strict):
    window_ms: float
    baseline_ms: float
    min_turn_deg: float
    min_ms: float
    min_face_share: float
    min_valid_trials: int


class JointAttentionConfig(_Strict):
    follow_concern: Linear
    on_screen: OnScreenJA
    live: LiveJA


class Clap(_Strict):
    close: float
    open: float
    min_cycles: int


class Wave(_Strict):
    min_reversals: int = Field(ge=1)
    min_swing: float
    within_ms: float


class TouchHead(_Strict):
    max_distance: float
    min_ms: float


class ActionConcern(_Strict):
    detected: float
    attempt: float
    none: float


class ImitationConfig(_Strict):
    window_ms: float
    arms_up_ms: float
    clap: Clap
    wave: Wave
    touch_head: TouchHead
    attempt_min_move: float
    concern: ActionConcern
    min_pose_share: float
    min_valid_actions: int


class GazePreferenceConfig(_Strict):
    geometric_concern: Linear
    min_tracked_share: float


class Oscillation(_Strict):
    window_ms: float
    min_hz: float
    max_hz: float
    min_peak_share: float
    min_amplitude: float
    min_episode_ms: float = 0


class EpisodeBand(_Strict):
    min_episodes: int
    concern: float


class FreePlayConfig(_Strict):
    resample_hz: float
    step_ms: float
    min_window_visible: float
    arm: Oscillation
    rocking: Oscillation
    episode_concern: tuple[EpisodeBand, ...]
    full_concern_seconds: float
    vocal_labels: frozenset[str]
    min_pose_share: float

    @model_validator(mode="after")
    def _bands_start_at_zero(self) -> Self:
        counts = [band.min_episodes for band in self.episode_concern]
        if not counts or counts[0] != 0 or counts != sorted(set(counts)):
            raise ValueError("episode_concern bands must start at 0 and ascend")
        return self

    def concern(self, episodes: int, seconds: float) -> float:
        if seconds >= self.full_concern_seconds:
            return 1.0
        return [b for b in self.episode_concern if b.min_episodes <= episodes][-1].concern


class ClassBand(_Strict):
    name: RiskClass
    max_score: int


class FailedCriticalFloor(_Strict):
    min_items: int
    at_least: RiskClass


class Floors(_Strict):
    regression: RiskClass
    failed_critical: FailedCriticalFloor


class HearingTest(_Strict):
    rtn_concern: float
    item: str
    normal_answer: str


class ConfidenceConfig(_Strict):
    high_min_tasks: int


class FindingsConfig(_Strict):
    max_concerns: int
    max_strengths: int
    critical_tasks: frozenset[TaskName]


class ScoringConfig(_Strict):
    scoring_version: str
    eligibility: Eligibility
    questionnaire: QuestionnaireConfig
    signals: Signals
    voice_onset: VoiceOnset
    calibration: CalibrationConfig
    quality: Quality
    rtn: RtnConfig
    joint_attention: JointAttentionConfig
    imitation: ImitationConfig
    gaze_preference: GazePreferenceConfig
    free_play: FreePlayConfig
    weights: dict[Literal["questionnaire"] | TaskName, float]
    classes: tuple[ClassBand, ...]
    floors: Floors
    hearing_test: HearingTest
    confidence: ConfidenceConfig
    findings: FindingsConfig

    @model_validator(mode="after")
    def _combine_tables_complete(self) -> Self:
        if set(self.weights) != {"questionnaire", *TaskName}:
            raise ValueError("weights needs the questionnaire and every task")
        names = [band.name for band in self.classes]
        limits = [band.max_score for band in self.classes]
        if names != list(RiskClass) or limits != sorted(set(limits)) or limits[-1] != 100:
            raise ValueError("classes must list low..high with ascending limits ending at 100")
        return self

    def risk_class(self, score: int) -> RiskClass:
        return next(band.name for band in self.classes if score <= band.max_score)


def parse_config(path: Path) -> ScoringConfig:
    return ScoringConfig.model_validate(yaml.safe_load(path.read_text(encoding="utf-8")))


@lru_cache
def load_config() -> ScoringConfig:
    return parse_config(CONFIG_PATH)
