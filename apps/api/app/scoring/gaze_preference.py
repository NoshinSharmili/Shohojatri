"""T4 — Look & watch (SCREENING_SPEC §4.7): share of tracked gaze on the geometric side."""

from collections.abc import Sequence

from app.scoring.calibration import FALLBACK, Calibration, gaze_x
from app.scoring.common import pct, polarity, valid_status
from app.scoring.config import ScoringConfig
from app.scoring.inputs import Frame, Marker
from app.scoring.names import TaskName
from app.scoring.results import Finding, InconclusiveReason, TaskQuality, TaskResult, inconclusive
from app.scoring.signals import Timeline


def detect_gaze_preference(
    frames: Sequence[Frame],
    markers: Sequence[Marker],
    calibration: Calibration | None,
    cfg: ScoringConfig,
) -> TaskResult:
    calibration = calibration or FALLBACK
    tl = Timeline(frames, cfg.signals)
    stimuli = sorted(
        (m for m in markers if m.type == "stimulus" and m.social_side), key=lambda m: m.t
    )
    end = next((m.t for m in markers if m.type == "end"), tl.end)

    def gaze(f: Frame) -> float | None:
        return gaze_x(f, calibration, cfg)

    total = tracked = geometric = social = 0.0
    for i, stimulus in enumerate(stimuli):
        a = stimulus.t
        b = stimuli[i + 1].t if i + 1 < len(stimuli) else end
        if b <= a:
            continue
        geo_left = stimulus.social_side == "right"
        on_left = tl.share(lambda f: (g := gaze(f)) is not None and g < 0, a, b) * (b - a)
        on_right = tl.share(lambda f: (g := gaze(f)) is not None and g > 0, a, b) * (b - a)
        total += b - a
        tracked += tl.share(lambda f: gaze(f) is not None, a, b) * (b - a)
        geometric += on_left if geo_left else on_right
        social += on_right if geo_left else on_left

    tracked_share = tracked / total if total else 0.0
    fallback = calibration.status == "fallback"
    quality = TaskQuality(
        face_pct=round(tracked_share, 3),
        calibration="fallback" if fallback else "ok",
        status=valid_status(tracked_share, cfg, calibration_fallback=fallback),
    )
    if tracked_share < cfg.gaze_preference.min_tracked_share or geometric + social == 0:
        reason = InconclusiveReason.no_data if not total else InconclusiveReason.gaze_not_tracked
        return inconclusive(TaskName.gaze_preference, reason, quality)

    share = geometric / (geometric + social)
    concern = cfg.gaze_preference.geometric_concern.concern(share)
    params = {"geometric_pct": pct(share)}
    return TaskResult(
        task=TaskName.gaze_preference,
        status=quality.status,
        concern=concern,
        metrics=params | {"tracked_pct": pct(tracked_share)},
        quality=quality,
        findings=(
            Finding(
                key="findings.gaze_preference.social"
                if concern == 0
                else "findings.gaze_preference.geometric",
                params=params,
                polarity=polarity(concern),
                source=TaskName.gaze_preference,
            ),
        ),
    )
