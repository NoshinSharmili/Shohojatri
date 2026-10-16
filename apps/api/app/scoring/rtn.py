"""T1 — Response to name (SCREENING_SPEC §4.4). Rear camera held by the caller, so "facing the
caller" means facing the camera."""

from collections.abc import Sequence
from statistics import mean

from app.scoring.common import flagged, polarity, valid_status
from app.scoring.config import ScoringConfig
from app.scoring.inputs import Frame, Marker
from app.scoring.names import TaskName
from app.scoring.results import (
    Finding,
    InconclusiveReason,
    RtnTrial,
    TaskQuality,
    TaskResult,
    inconclusive,
)
from app.scoring.signals import Timeline, voice_onset


def detect_rtn(
    frames: Sequence[Frame], markers: Sequence[Marker], cfg: ScoringConfig
) -> TaskResult:
    r = cfg.rtn
    tl = Timeline(frames, cfg.signals)
    wrong = flagged(markers)

    def facing(f: Frame) -> bool:
        return (
            f.face
            and f.yaw is not None
            and f.pitch is not None
            and abs(f.yaw) <= r.facing.max_yaw
            and abs(f.pitch) <= r.facing.max_pitch
        )

    trials: list[RtnTrial] = []
    prompts = sorted((m for m in markers if m.type == "prompt"), key=lambda m: m.t)
    for number, prompt in enumerate(prompts, start=1):
        trial = prompt.trial if prompt.trial is not None else number
        t0, estimated = voice_onset(tl, prompt.t, cfg.voice_onset)
        face_before = tl.share(lambda f: f.face, t0 - r.pre_t0_ms, t0)
        run = tl.first_run(facing, t0, t0 + r.response_window_ms, r.facing.min_ms)
        latency = None if run is None else run.start - t0
        pre_state = prompt.pre_state or "away"
        if pre_state == "facing":
            invalid = "pre_state_facing"
        elif face_before < r.min_face_share:
            invalid = "face_not_visible"
        elif trial in wrong:
            invalid = "something_wrong"
        else:
            invalid = None
        trials.append(
            RtnTrial(
                trial=trial,
                prompt_ms=prompt.t,
                t0_ms=t0,
                t0_estimated=estimated,
                pre_state=pre_state,
                face_share_before=round(face_before, 3),
                latency_ms=latency,
                eye_contact_ms=None if run is None else min(run.duration, r.eye_contact_cap_ms),
                valid=invalid is None,
                invalid_reason=invalid,
                concern=None if invalid else trial_concern(latency, cfg),
            )
        )

    valid = [t for t in trials if t.valid]
    # The gate waits for the child to look away, so presence over the whole task says little;
    # the 2 s before each call is what validity depends on.
    face_pct = mean(t.face_share_before for t in trials) if trials else tl.share(lambda f: f.face)
    quality = TaskQuality(
        face_pct=round(face_pct, 3), valid_trials=len(valid), status=valid_status(face_pct, cfg)
    )
    if len(valid) < r.min_valid_trials:
        reason = (
            InconclusiveReason.no_data
            if not frames or not prompts
            else InconclusiveReason.face_not_visible
            if face_pct < r.min_face_share
            else InconclusiveReason.not_enough_valid_trials
        )
        return inconclusive(TaskName.rtn, reason, quality, trials=tuple(trials))

    concern = mean(t.concern for t in valid if t.concern is not None)
    latencies = [t.latency_ms for t in valid if t.latency_ms is not None]
    responded = len(latencies)
    params = {
        "responded": responded,
        "valid": len(valid),
        "latency_s": round(mean(latencies) / 1000, 1) if latencies else None,
    }
    finding = Finding(
        key="findings.rtn.responded" if responded else "findings.rtn.no_response",
        params=params,
        polarity=polarity(concern),
        source=TaskName.rtn,
    )
    return TaskResult(
        task=TaskName.rtn,
        status=quality.status,
        concern=concern,
        metrics={
            **params,
            "mean_latency_ms": round(mean(latencies)) if latencies else None,
            "t0_estimated": sum(t.t0_estimated for t in valid),
        },
        trials=tuple(trials),
        quality=quality,
        findings=(finding,),
    )


def trial_concern(latency_ms: float | None, cfg: ScoringConfig) -> float:
    if latency_ms is not None:
        for band in cfg.rtn.latency_concern:
            if latency_ms <= band.max_ms:
                return band.concern
    return cfg.rtn.no_response_concern
