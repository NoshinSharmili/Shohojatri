"""Reading per-frame features over time. Frames arrive at ~10-15 Hz with jitter and drops, so
every duration here is time-based: a frame's state holds until the next frame, or for at most
`max_hold_ms` (a longer gap counts as "not seen")."""

import itertools
from collections.abc import Callable, Sequence
from dataclasses import dataclass
from statistics import median

import numpy as np
from numpy.typing import NDArray

from app.scoring.config import Signals, VoiceOnset
from app.scoring.inputs import Frame, Keypoint, Pose

FramePredicate = Callable[[Frame], bool]


@dataclass(frozen=True)
class Interval:
    start: float
    end: float

    @property
    def duration(self) -> float:
        return self.end - self.start


class Timeline:
    def __init__(self, frames: Sequence[Frame], cfg: Signals) -> None:
        self.frames = sorted(frames, key=lambda f: f.t)
        self.cfg = cfg
        times = [f.t for f in self.frames]
        gaps = [b - a for a, b in itertools.pairwise(times)]
        # The last frame holds for a typical frame interval.
        last_hold = min(median(gaps), cfg.max_hold_ms) if gaps else 0.0
        self.ends = [min(b, a + cfg.max_hold_ms) for a, b in itertools.pairwise(times)]
        if times:
            self.ends.append(times[-1] + last_hold)

    @property
    def start(self) -> float:
        return self.frames[0].t if self.frames else 0.0

    @property
    def end(self) -> float:
        return self.ends[-1] if self.ends else 0.0

    def between(self, a: float, b: float) -> list[Frame]:
        return [f for f in self.frames if a <= f.t < b]

    def share(self, pred: FramePredicate, a: float | None = None, b: float | None = None) -> float:
        """Share of [a, b) (default: the whole timeline) during which `pred` held."""
        a = self.start if a is None else a
        b = self.end if b is None else b
        if b <= a:
            return 0.0
        held = sum(
            max(0.0, min(end, b) - max(f.t, a))
            for f, end in zip(self.frames, self.ends, strict=True)
            if pred(f)
        )
        return held / (b - a)

    def runs(self, pred: FramePredicate, min_ms: float = 0.0) -> list[Interval]:
        """Maximal intervals during which `pred` held, at least `min_ms` long."""
        out: list[Interval] = []
        current: Interval | None = None
        for f, end in zip(self.frames, self.ends, strict=True):
            if not pred(f):
                current = None
                continue
            if current is not None and current.end >= f.t:
                current = Interval(current.start, end)
                out[-1] = current
            else:
                current = Interval(f.t, end)
                out.append(current)
        return [run for run in out if run.duration >= min_ms]

    def first_run(self, pred: FramePredicate, a: float, b: float, min_ms: float) -> Interval | None:
        """The first run that starts in [a, b] and lasts `min_ms` from there. A run already
        under way at `a` counts from `a`."""
        for run in self.runs(pred):
            start = max(run.start, a)
            if start > b:
                return None
            if run.end - start >= min_ms:
                return Interval(start, run.end)
        return None


def voice_onset(tl: Timeline, after: float, cfg: VoiceOnset) -> tuple[float, bool]:
    """(t0, estimated): the first sample within `search_ms` after `after` whose rms_db is
    `rise_db` above the median of the `baseline_ms` before it (§4.4 step 2), else the fallback."""
    samples = [(f.t, f.rms_db) for f in tl.frames if f.rms_db is not None]
    for t, db in samples:
        if not after <= t <= after + cfg.search_ms:
            continue
        baseline = [d for s, d in samples if t - cfg.baseline_ms <= s < t]
        if baseline and db >= median(baseline) + cfg.rise_db:
            return t, False
    return after + cfg.fallback_ms, True


def seen(point: Keypoint | None, cfg: Signals) -> bool:
    return point is not None and point[2] >= cfg.min_visibility


def shoulder_width(pose: Pose | None, cfg: Signals) -> float | None:
    if pose is None or not (seen(pose.l_shoulder, cfg) and seen(pose.r_shoulder, cfg)):
        return None
    assert pose.l_shoulder is not None and pose.r_shoulder is not None
    return float(np.hypot(*np.subtract(pose.l_shoulder[:2], pose.r_shoulder[:2])))


def pose_present(cfg: Signals) -> FramePredicate:
    """Both shoulders and at least one wrist seen: enough for every movement rule."""

    def present(f: Frame) -> bool:
        p = f.pose
        return shoulder_width(p, cfg) is not None and (
            p is not None and (seen(p.l_wrist, cfg) or seen(p.r_wrist, cfg))
        )

    return present


def median_shoulder_width(frames: Sequence[Frame], cfg: Signals) -> float | None:
    widths = [w for f in frames if (w := shoulder_width(f.pose, cfg))]
    return float(np.median(widths)) if widths else None


@dataclass(frozen=True)
class Track:
    """One keypoint over time, where seen: times (ms) and x, y, smoothed."""

    t: NDArray[np.float64]
    x: NDArray[np.float64]
    y: NDArray[np.float64]


def keypoint_track(frames: Sequence[Frame], name: str, cfg: Signals) -> Track:
    rows = [
        (f.t, point[0], point[1])
        for f in frames
        if f.pose is not None and seen(point := getattr(f.pose, name), cfg)
    ]
    data = np.array(rows, dtype=np.float64).reshape(-1, 3)
    return Track(
        data[:, 0],
        running_median(data[:, 1], cfg.smoothing_frames),
        running_median(data[:, 2], cfg.smoothing_frames),
    )


def running_median(values: NDArray[np.float64], size: int) -> NDArray[np.float64]:
    """Centred running median; removes single-frame landmark glitches without lag."""
    if size <= 1 or len(values) < size:
        return values
    half = size // 2
    padded = np.pad(values, half, mode="edge")
    windows = np.lib.stride_tricks.sliding_window_view(padded, size)
    return np.median(windows, axis=1)
