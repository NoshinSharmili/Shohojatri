"""Scores a screening from what is stored (SCREENING_SPEC §5-§6).

Uploads keep the extracted features, so finalize scores every task again here, with the latest
calibration and the current config: one code path for the result, whatever order the parent
did the activities in.
"""

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any, Literal

from app.core.questionnaire import load_questionnaire
from app.models import Screening, ScreeningTask
from app.scoring.calibration import Calibration, fit_calibration
from app.scoring.combine import combine
from app.scoring.config import ScoringConfig
from app.scoring.free_play import detect_free_play
from app.scoring.gaze_preference import detect_gaze_preference
from app.scoring.imitation import detect_imitation
from app.scoring.inputs import AudioEvent, Frame, Marker
from app.scoring.joint_attention import detect_joint_attention
from app.scoring.names import TaskName
from app.scoring.questionnaire import score_questionnaire
from app.scoring.results import RiskResult, TaskResult, skipped
from app.scoring.rtn import detect_rtn

CALIBRATION = "calibration"
TaskSlug = Literal[
    "calibration", "rtn", "joint_attention", "imitation", "gaze_preference", "free_play"
]
Variant = Literal["on_screen", "live"]
# Tasks the parent can do in two ways (§4.5, §4.6); on-screen is the default.
VARIANT_TASKS = frozenset({TaskName.joint_attention, TaskName.imitation})


@dataclass(frozen=True)
class Recording:
    """The features of one upload, as the detectors read them."""

    frames: tuple[Frame, ...]
    markers: tuple[Marker, ...]
    audio_events: tuple[AudioEvent, ...]

    @classmethod
    def from_json(cls, payload: Mapping[str, Any]) -> "Recording":
        return cls(
            frames=tuple(Frame.model_validate(f) for f in payload.get("frames", ())),
            markers=tuple(Marker.model_validate(m) for m in payload.get("markers", ())),
            audio_events=tuple(
                AudioEvent.model_validate(e) for e in payload.get("audio_events", ())
            ),
        )


def calibrate(recording: Recording, cfg: ScoringConfig) -> Calibration:
    return fit_calibration(recording.frames, recording.markers, cfg)


def detect(
    task: TaskName,
    variant: Variant | None,
    recording: Recording,
    calibration: Calibration | None,
    cfg: ScoringConfig,
) -> TaskResult:
    """Runs the task's detector. Gaze tasks without a calibration use the fallback (§4.3)."""
    frames, markers = recording.frames, recording.markers
    match task:
        case TaskName.rtn:
            return detect_rtn(frames, markers, cfg)
        case TaskName.joint_attention:
            if variant == "live":
                # Live pointing measures head turns from a baseline: no screen, no calibration.
                return detect_joint_attention(frames, markers, None, cfg, variant="live")
            return detect_joint_attention(frames, markers, calibration, cfg)
        case TaskName.imitation:
            return detect_imitation(frames, markers, cfg)
        case TaskName.gaze_preference:
            return detect_gaze_preference(frames, markers, calibration, cfg)
        case TaskName.free_play:
            return detect_free_play(frames, recording.audio_events, cfg)


def stored_calibration(rows: Mapping[str, ScreeningTask], cfg: ScoringConfig) -> Calibration | None:
    row = rows.get(CALIBRATION)
    if row is None or row.payload_json is None:
        return None
    return calibrate(Recording.from_json(row.payload_json), cfg)


def score_screening(screening: Screening, cfg: ScoringConfig) -> RiskResult:
    """The questionnaire plus every task. A task never uploaded counts as skipped, so a
    questionnaire-only screening still gets a result (§1)."""
    answers = {a.item_id: a.option for a in screening.answers}
    questionnaire = score_questionnaire(
        answers, screening.age_months, load_questionnaire().items, cfg
    )
    rows = {row.task: row for row in screening.tasks}
    calibration = stored_calibration(rows, cfg)
    tasks: Sequence[TaskResult] = [
        _task_result(name, rows.get(name), calibration, cfg) for name in TaskName
    ]
    return combine(questionnaire, tasks, cfg)


def _task_result(
    name: TaskName, row: ScreeningTask | None, calibration: Calibration | None, cfg: ScoringConfig
) -> TaskResult:
    if row is None or row.payload_json is None:
        return skipped(name)
    variant: Variant | None = "live" if row.variant == "live" else None
    return detect(name, variant, Recording.from_json(row.payload_json), calibration, cfg)
