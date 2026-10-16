"""T3 — Copy me (SCREENING_SPEC §4.6). Pose rules per action, in shoulder widths (sw).

The browser opens a second response window for an action it didn't see (the automatic retry);
here every window is scored and the action keeps its best outcome."""

from collections.abc import Callable, Sequence
from statistics import mean
from typing import Literal

import numpy as np

from app.scoring.common import flagged, polarity, valid_status
from app.scoring.config import ScoringConfig
from app.scoring.inputs import Frame, Marker
from app.scoring.names import TaskName
from app.scoring.results import (
    Finding,
    ImitationTrial,
    InconclusiveReason,
    TaskQuality,
    TaskResult,
    inconclusive,
)
from app.scoring.signals import Timeline, keypoint_track, median_shoulder_width, pose_present

Action = Literal["arms_up", "clap", "wave", "touch_head"]
Outcome = Literal["detected", "attempt", "none"]
ACTIONS: tuple[Action, ...] = ("arms_up", "clap", "wave", "touch_head")
OUTCOME_RANK: dict[Outcome, int] = {"detected": 2, "attempt": 1, "none": 0}
KEYPOINTS = ("nose", "l_ear", "r_ear", "l_shoulder", "r_shoulder", "l_wrist", "r_wrist")
WRISTS = (("l_wrist", "l_shoulder"), ("r_wrist", "r_shoulder"))

Point = tuple[float, float]


class _Window:
    """Smoothed keypoints for one response window, looked up by frame time."""

    def __init__(self, frames: list[Frame], sw: float, cfg: ScoringConfig) -> None:
        self.tl = Timeline(frames, cfg.signals)
        self.frames = self.tl.frames
        self.sw = sw
        self.points: dict[str, dict[float, Point]] = {}
        for name in KEYPOINTS:
            track = keypoint_track(frames, name, cfg.signals)
            self.points[name] = {
                float(t): (float(x), float(y))
                for t, x, y in zip(track.t, track.x, track.y, strict=True)
            }

    def at(self, name: str, f: Frame) -> Point | None:
        return self.points[name].get(f.t)

    def dist(self, a: Point, b: Point) -> float:
        return float(np.hypot(a[0] - b[0], a[1] - b[1])) / self.sw

    def held(self, pred: Callable[[Frame], bool], min_ms: float) -> bool:
        return bool(self.tl.runs(pred, min_ms))


def detect_imitation(
    frames: Sequence[Frame], markers: Sequence[Marker], cfg: ScoringConfig
) -> TaskResult:
    im = cfg.imitation
    tl = Timeline(frames, cfg.signals)
    present = pose_present(cfg.signals)
    overall_sw = median_shoulder_width(tl.frames, cfg.signals)
    wrong = flagged(markers)
    windows = sorted(
        (m for m in markers if m.type == "response_window" and m.action), key=lambda m: m.t
    )

    trials: list[ImitationTrial] = []
    for action in ACTIONS:
        opened = [m for m in windows if m.action == action]
        if not opened:
            continue
        best: Outcome | None = None  # over the windows with enough pose
        best_share = 0.0
        for marker in opened:
            end = marker.t + im.window_ms
            share = tl.share(present, marker.t, end)
            best_share = max(best_share, share)
            in_window = tl.between(marker.t, end)
            sw = median_shoulder_width(in_window, cfg.signals) or overall_sw
            if share < im.min_pose_share or sw is None:
                continue
            outcome = _outcome(action, _Window(in_window, sw, cfg), cfg)
            if best is None or OUTCOME_RANK[outcome] > OUTCOME_RANK[best]:
                best = outcome
        invalid: Literal["body_not_visible", "something_wrong"] | None = (
            "something_wrong" if action in wrong else "body_not_visible" if best is None else None
        )
        trials.append(
            ImitationTrial(
                action=action,
                windows=len(opened),
                outcome=best,
                pose_share=round(best_share, 3),
                valid=invalid is None,
                invalid_reason=invalid,
                concern=None if invalid or best is None else getattr(im.concern, best),
            )
        )

    valid = [t for t in trials if t.valid]
    pose_pct = mean(t.pose_share for t in trials) if trials else tl.share(present)
    quality = TaskQuality(
        pose_pct=round(pose_pct, 3), valid_trials=len(valid), status=valid_status(pose_pct, cfg)
    )
    if len(valid) < im.min_valid_actions:
        reason = (
            InconclusiveReason.no_data
            if not frames or not windows
            else InconclusiveReason.body_not_visible
            if pose_pct < im.min_pose_share
            else InconclusiveReason.not_enough_valid_trials
        )
        return inconclusive(TaskName.imitation, reason, quality, trials=tuple(trials))

    concern = mean(t.concern for t in valid if t.concern is not None)
    params = {
        "copied": sum(t.outcome == "detected" for t in valid),
        "attempted": sum(t.outcome == "attempt" for t in valid),
        "valid": len(valid),
    }
    return TaskResult(
        task=TaskName.imitation,
        status=quality.status,
        concern=concern,
        metrics=dict(params),
        trials=tuple(trials),
        quality=quality,
        findings=(
            Finding(
                key="findings.imitation.copied",
                params=params,
                polarity=polarity(concern),
                source=TaskName.imitation,
            ),
        ),
    )


def _outcome(action: Action, w: _Window, cfg: ScoringConfig) -> Outcome:
    rules = {"arms_up": _arms_up, "clap": _clap, "wave": _wave, "touch_head": _touch_head}
    if rules[action](w, cfg):
        return "detected"
    return "attempt" if _moved(w, cfg) else "none"


def _arms_up(w: _Window, cfg: ScoringConfig) -> bool:
    def up(f: Frame) -> bool:
        nose, lw, rw = w.at("nose", f), w.at("l_wrist", f), w.at("r_wrist", f)
        return bool(nose and lw and rw and lw[1] < nose[1] and rw[1] < nose[1])

    return w.held(up, cfg.imitation.arms_up_ms)


def _clap(w: _Window, cfg: ScoringConfig) -> bool:
    c = cfg.imitation.clap
    closed, cycles = False, 0
    for f in w.frames:
        lw, rw = w.at("l_wrist", f), w.at("r_wrist", f)
        if not (lw and rw):
            continue
        d = w.dist(lw, rw)
        if d < c.close:
            closed = True
        elif d > c.open and closed:
            closed, cycles = False, cycles + 1
    return cycles >= c.min_cycles


def _wave(w: _Window, cfg: ScoringConfig) -> bool:
    wave = cfg.imitation.wave
    n = wave.min_reversals
    for wrist, shoulder in WRISTS:
        for segment in _raised(w, wrist, shoulder):
            times = reversals(segment, wave.min_swing * w.sw)
            if any(
                times[i + n - 1] - times[i] <= wave.within_ms for i in range(len(times) - n + 1)
            ):
                return True
    return False


def _raised(w: _Window, wrist: str, shoulder: str) -> list[list[tuple[float, float]]]:
    """Stretches of (t, wrist x) while the wrist is above its shoulder."""
    segments: list[list[tuple[float, float]]] = []
    current: list[tuple[float, float]] = []
    for f in w.frames:
        p, s = w.at(wrist, f), w.at(shoulder, f)
        if p and s and p[1] < s[1]:
            current.append((f.t, p[0]))
        elif current:
            segments.append(current)
            current = []
    if current:
        segments.append(current)
    return segments


def reversals(samples: list[tuple[float, float]], min_swing: float) -> list[float]:
    """Times at which x turns back after moving at least `min_swing` (a zig-zag filter, so
    jitter smaller than the swing never counts)."""
    out: list[float] = []
    if not samples:
        return out
    direction = 0
    hi = lo = samples[0]
    for t, x in samples:
        if x > hi[1]:
            hi = (t, x)
        if x < lo[1]:
            lo = (t, x)
        if direction != 1 and x - lo[1] >= min_swing:
            if direction == -1:
                out.append(lo[0])
            direction, hi = 1, (t, x)
        elif direction != -1 and hi[1] - x >= min_swing:
            if direction == 1:
                out.append(hi[0])
            direction, lo = -1, (t, x)
    return out


def _touch_head(w: _Window, cfg: ScoringConfig) -> bool:
    th = cfg.imitation.touch_head

    def touching(f: Frame) -> bool:
        heads = [p for name in ("nose", "l_ear", "r_ear") if (p := w.at(name, f))]
        shoulders = [p[1] for name in ("l_shoulder", "r_shoulder") if (p := w.at(name, f))]
        if not heads or not shoulders:
            return False
        line = mean(shoulders)
        return any(
            wrist[1] < line and min(w.dist(wrist, h) for h in heads) <= th.max_distance
            for name in ("l_wrist", "r_wrist")
            if (wrist := w.at(name, f))
        )

    return w.held(touching, th.min_ms)


def _moved(w: _Window, cfg: ScoringConfig) -> bool:
    for name in ("l_wrist", "r_wrist"):
        points = [p for f in w.frames if (p := w.at(name, f))]
        if len(points) < 2:
            continue
        start = tuple(np.median(np.array(points[:3]), axis=0))
        if max(w.dist(p, (start[0], start[1])) for p in points) > cfg.imitation.attempt_min_move:
            return True
    return False
