"""T2 — Look where I point (SCREENING_SPEC §4.5). On-screen: calibrated gaze on the front
camera. Live: head turn on the rear camera, toward the image side the parent tapped."""

from collections.abc import Sequence
from statistics import mean, median
from typing import Literal

from app.scoring.calibration import FALLBACK, Calibration, gaze_x
from app.scoring.common import flagged, polarity, valid_status
from app.scoring.config import ScoringConfig
from app.scoring.inputs import Frame, Marker, Side
from app.scoring.names import TaskName
from app.scoring.results import (
    Finding,
    InconclusiveReason,
    JointAttentionTrial,
    TaskQuality,
    TaskResult,
    inconclusive,
)
from app.scoring.signals import Timeline, voice_onset

Variant = Literal["on_screen", "live"]


def detect_joint_attention(
    frames: Sequence[Frame],
    markers: Sequence[Marker],
    calibration: Calibration | None,
    cfg: ScoringConfig,
    *,
    variant: Variant = "on_screen",
) -> TaskResult:
    tl = Timeline(frames, cfg.signals)
    cues = sorted((m for m in markers if m.type == "cue" and m.side), key=lambda m: m.t)
    if variant == "on_screen":
        calibration = calibration or FALLBACK
        trials = _on_screen_trials(tl, cues, markers, calibration, cfg)
        min_valid = cfg.joint_attention.on_screen.min_valid_trials
        min_face = cfg.joint_attention.on_screen.min_face_share
        fallback = calibration.status == "fallback"
    else:
        trials = _live_trials(tl, cues, markers, cfg)
        min_valid = cfg.joint_attention.live.min_valid_trials
        min_face = cfg.joint_attention.live.min_face_share
        fallback = False
    wrong = flagged(markers)
    trials = [
        t.model_copy(update={"valid": False, "invalid_reason": "something_wrong"})
        if t.valid and t.trial in wrong
        else t
        for t in trials
    ]

    valid = [t for t in trials if t.valid]
    face_pct = mean(t.face_share for t in trials) if trials else tl.share(lambda f: f.face)
    quality = TaskQuality(
        face_pct=round(face_pct, 3),
        calibration=("fallback" if fallback else "ok") if variant == "on_screen" else None,
        valid_trials=len(valid),
        status=valid_status(face_pct, cfg, calibration_fallback=fallback),
    )
    metrics: dict[str, int | float | str | None] = {"variant": variant}
    if len(valid) < min_valid:
        reason = (
            InconclusiveReason.no_data
            if not frames or not cues
            else InconclusiveReason.face_not_visible
            if face_pct < min_face
            else InconclusiveReason.not_enough_valid_trials
        )
        return inconclusive(
            TaskName.joint_attention, reason, quality, metrics=metrics, trials=tuple(trials)
        )

    followed = sum(t.followed for t in valid)
    rate = followed / len(valid)
    concern = cfg.joint_attention.follow_concern.concern(rate)
    params = {"followed": followed, "valid": len(valid)}
    return TaskResult(
        task=TaskName.joint_attention,
        status=quality.status,
        concern=concern,
        metrics=metrics | params | {"follow_rate": round(rate, 3)},
        trials=tuple(trials),
        quality=quality,
        findings=(
            Finding(
                key="findings.joint_attention.followed",
                params=params,
                polarity=polarity(concern),
                source=TaskName.joint_attention,
            ),
        ),
    )


def _on_screen_trials(
    tl: Timeline,
    cues: list[Marker],
    markers: Sequence[Marker],
    calibration: Calibration,
    cfg: ScoringConfig,
) -> list[JointAttentionTrial]:
    o = cfg.joint_attention.on_screen
    engages = {m.trial: m for m in markers if m.type == "engage"}

    def gaze(f: Frame) -> float | None:
        return gaze_x(f, calibration, cfg)

    def looking(f: Frame) -> bool:
        g = gaze(f)
        return g is not None and abs(g) > o.look.min_abs_gaze

    def centred(f: Frame) -> bool:
        g = gaze(f)
        return g is not None and abs(g) < o.centre.max_abs_gaze

    trials = []
    for number, cue in enumerate(cues, start=1):
        assert cue.side is not None
        trial = cue.trial if cue.trial is not None else number
        window_end = cue.t + o.window_ms
        face_share = tl.share(lambda f: f.face, cue.t, window_end)
        engage = engages.get(trial)
        engage_start = engage.t if engage else cue.t - o.engage_ms
        attended = tl.first_run(centred, engage_start, cue.t, o.centre.min_ms) is not None
        look = tl.first_run(looking, cue.t, window_end, o.look.min_ms)
        side: Side | None = None
        if look is not None:
            during = [g for f in tl.between(look.start, look.end) if (g := gaze(f)) is not None]
            side = "left" if median(during) < 0 else "right"
        invalid: Literal["face_not_visible", "not_attending"] | None = (
            "face_not_visible"
            if face_share < o.min_face_share
            else "not_attending"
            if not attended
            else None
        )
        trials.append(
            JointAttentionTrial(
                trial=trial,
                side=cue.side,
                cue_ms=cue.t,
                first_look=side,
                first_look_ms=None if look is None else look.start - cue.t,
                followed=side == cue.side,
                face_share=round(face_share, 3),
                attended_centre=attended,
                valid=invalid is None,
                invalid_reason=invalid,
            )
        )
    return trials


def _live_trials(
    tl: Timeline, cues: list[Marker], markers: Sequence[Marker], cfg: ScoringConfig
) -> list[JointAttentionTrial]:
    live = cfg.joint_attention.live
    trials = []
    for number, cue in enumerate(cues, start=1):
        assert cue.side is not None
        trial = cue.trial if cue.trial is not None else number
        t0, estimated = voice_onset(tl, cue.t, cfg.voice_onset)
        window_end = t0 + live.window_ms
        face_share = tl.share(lambda f: f.face, t0, window_end)
        before = [
            f
            for f in tl.between(t0 - live.baseline_ms, t0)
            if f.face and f.yaw is not None and f.nose_dx is not None
        ]
        side: Side | None = None
        look_ms: float | None = None
        if before:
            base_yaw = median(f.yaw for f in before if f.yaw is not None)
            base_nose = median(f.nose_dx for f in before if f.nose_dx is not None)

            def turned(f: Frame, base_yaw: float = base_yaw) -> bool:
                return (
                    f.face
                    and f.yaw is not None
                    and f.nose_dx is not None
                    and abs(f.yaw - base_yaw) >= live.min_turn_deg
                )

            turn = tl.first_run(turned, t0, window_end, live.min_ms)
            if turn is not None:
                shifts = [
                    f.nose_dx - base_nose
                    for f in tl.between(turn.start, turn.end)
                    if f.nose_dx is not None
                ]
                # Turning toward image left moves the nose toward image left (nose_dx down).
                side = "left" if median(shifts) < 0 else "right"
                look_ms = turn.start - t0
        invalid: Literal["face_not_visible", "no_baseline"] | None = (
            "no_baseline"
            if not before
            else "face_not_visible"
            if face_share < live.min_face_share
            else None
        )
        trials.append(
            JointAttentionTrial(
                trial=trial,
                side=cue.side,
                cue_ms=cue.t,
                first_look=side,
                first_look_ms=look_ms,
                followed=side == cue.side,
                face_share=round(face_share, 3),
                t0_estimated=estimated,
                valid=invalid is None,
                invalid_reason=invalid,
            )
        )
    return trials
