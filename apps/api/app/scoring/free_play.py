"""T5 — Free play (SCREENING_SPEC §4.8): repeated upper-body movement from pose, and
vocalisation time (report only). Movements are read as signals resampled onto an even grid."""

import math
from collections.abc import Iterator, Sequence
from itertools import groupby
from typing import Literal

import numpy as np
from numpy.typing import NDArray

from app.scoring.common import pct, valid_status
from app.scoring.config import Oscillation, ScoringConfig
from app.scoring.inputs import AudioEvent, Frame
from app.scoring.names import TaskName
from app.scoring.results import (
    Finding,
    InconclusiveReason,
    MovementEpisode,
    TaskQuality,
    TaskResult,
    inconclusive,
)
from app.scoring.signals import (
    Interval,
    Timeline,
    keypoint_track,
    median_shoulder_width,
    pose_present,
    shoulder_width,
)

Series = tuple[NDArray[np.float64], NDArray[np.float64]]  # times (ms), values (sw)


def detect_free_play(
    frames: Sequence[Frame], audio_events: Sequence[AudioEvent], cfg: ScoringConfig
) -> TaskResult:
    fp = cfg.free_play
    tl = Timeline(frames, cfg.signals)
    pose_pct = tl.share(pose_present(cfg.signals))
    sw = median_shoulder_width(tl.frames, cfg.signals)
    quality = TaskQuality(pose_pct=round(pose_pct, 3), status=valid_status(pose_pct, cfg))
    if sw is None or pose_pct < fp.min_pose_share:
        reason = InconclusiveReason.no_data if not frames else InconclusiveReason.body_not_visible
        return inconclusive(TaskName.free_play, reason, quality)

    arm = _episodes(list(_arm_series(tl, sw, cfg)), tl, fp.arm, cfg)
    rocking = [
        e
        for e in _episodes(list(_body_series(tl, sw, cfg)), tl, fp.rocking, cfg)
        if e.duration >= fp.rocking.min_episode_ms
    ]
    found: list[tuple[Literal["arm", "rocking"], Interval]] = sorted(
        [("arm", e) for e in arm] + [("rocking", e) for e in rocking], key=lambda p: p[1].start
    )
    episodes = len(found)
    seconds = sum(e.duration for _, e in found) / 1000
    concern = fp.concern(episodes, seconds)
    params = {"episodes": episodes, "seconds": round(seconds)}
    trials = tuple(
        MovementEpisode(movement=movement, start_ms=round(e.start), end_ms=round(e.end))
        for movement, e in found
    )
    findings = (
        (
            Finding(
                key="findings.free_play.repetitive_movement",
                params=params,
                polarity="concern",
                source=TaskName.free_play,
            ),
        )
        if episodes
        else ()  # no repeated movement is not reported as a strength
    )
    return TaskResult(
        task=TaskName.free_play,
        status=quality.status,
        concern=concern,
        metrics=params
        | {
            "arm_episodes": len(arm),
            "rocking_episodes": len(rocking),
            "vocal_seconds": vocal_seconds(audio_events, cfg),
            "pose_pct": pct(pose_pct),
        },
        trials=trials,
        quality=quality,
        findings=findings,
    )


def _arm_series(tl: Timeline, sw: float, cfg: ScoringConfig) -> Iterator[Series]:
    """Each wrist's x and y. Not smoothed: a running median would flatten fast flapping."""
    raw = cfg.signals.model_copy(update={"smoothing_frames": 1})
    for name in ("l_wrist", "r_wrist"):
        track = keypoint_track(tl.frames, name, raw)
        yield track.t, track.x / sw
        yield track.t, track.y / sw


def _body_series(tl: Timeline, sw: float, cfg: ScoringConfig) -> Iterator[Series]:
    """Shoulder-midpoint x, and shoulder width as a depth proxy (rocking toward the camera)."""
    rows = []
    for f in tl.frames:
        width = shoulder_width(f.pose, cfg.signals)
        if width is None or f.pose is None:
            continue
        assert f.pose.l_shoulder is not None and f.pose.r_shoulder is not None
        rows.append((f.t, (f.pose.l_shoulder[0] + f.pose.r_shoulder[0]) / 2 / sw, width / sw))
    data = np.array(rows, dtype=np.float64).reshape(-1, 3)
    yield data[:, 0], data[:, 1]
    yield data[:, 0], data[:, 2]


def _episodes(
    series: list[Series], tl: Timeline, osc: Oscillation, cfg: ScoringConfig
) -> list[Interval]:
    """Detection: sliding windows in which a series oscillates (§4.8). Measurement: overlapping
    windows form one episode, lasting as long as the band-passed movement stays above the
    amplitude threshold. (A short burst can dominate an otherwise still window, so the windows'
    own edges would overstate how long it lasted.)"""
    fp = cfg.free_play
    frame_times = np.array([f.t for f in tl.frames])
    hits: list[tuple[float, float, int]] = []  # window start, end, series index
    for index, (times, values) in enumerate(series):
        start = tl.start
        while start + osc.window_ms <= tl.end:
            end = start + osc.window_ms
            seen = np.count_nonzero((times >= start) & (times < end))
            expected = np.count_nonzero((frame_times >= start) & (frame_times < end))
            if expected and seen / expected >= fp.min_window_visible:
                grid = np.arange(start, end, 1000 / fp.resample_hz)
                if oscillates(np.interp(grid, times, values), fp.resample_hz, osc):
                    hits.append((start, end, index))
            start += fp.step_ms

    episodes = []
    for group in _overlapping(hits):
        a, b = group[0][0], max(h[1] for h in group)
        spans = [
            span
            for index in sorted({h[2] for h in group})
            if (span := _active(series[index], a, b, osc, fp.resample_hz))
        ]
        episodes.append(
            Interval(min(s.start for s in spans), max(s.end for s in spans))
            if spans
            else Interval(a, b)
        )
    return episodes


def _overlapping(hits: list[tuple[float, float, int]]) -> list[list[tuple[float, float, int]]]:
    groups: list[list[tuple[float, float, int]]] = []
    end = -math.inf
    for hit in sorted(hits):
        if groups and hit[0] <= end:
            groups[-1].append(hit)
            end = max(end, hit[1])
        else:
            groups.append([hit])
            end = hit[1]
    return groups


def _active(series: Series, a: float, b: float, osc: Oscillation, hz: float) -> Interval | None:
    """Where the movement, band-passed to the oscillation band, has the threshold amplitude."""
    times, values = series
    grid = np.arange(a, b, 1000 / hz)
    x = _detrend(np.interp(grid, times, values))
    spectrum = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / hz)
    spectrum[(freqs < osc.min_hz) | (freqs > osc.max_hz)] = 0
    band = np.fft.irfft(spectrum, len(x))
    period = max(2, round(hz / freqs[int(np.argmax(np.abs(spectrum)))]))
    rms = np.sqrt(np.convolve(band**2, np.ones(period) / period, mode="same"))
    active = np.flatnonzero(np.sqrt(2) * rms > osc.min_amplitude)  # amplitude of a sinusoid
    if not len(active):
        return None
    return Interval(float(grid[active[0]]), float(grid[active[-1]]) + 1000 / hz)


def _detrend(values: NDArray[np.float64]) -> NDArray[np.float64]:
    steps = np.arange(len(values))
    return values - np.polyval(np.polyfit(steps, values, 1), steps)


def oscillates(values: NDArray[np.float64], hz: float, osc: Oscillation) -> bool:
    """Dominant frequency in the band, carrying most of the power, with enough amplitude.
    The peak's power includes its neighbouring bins, so a rhythm between two bins still counts."""
    n = len(values)
    if n < 4:
        return False
    power = np.abs(np.fft.rfft(_detrend(values))) ** 2
    power[0] = 0.0
    total = power.sum()
    if total <= 0:
        return False
    k = int(np.argmax(power))
    peak = power[max(k - 1, 1) : k + 2].sum()
    frequency = np.fft.rfftfreq(n, 1 / hz)[k]
    amplitude = 2 * np.sqrt(peak) / n  # of a sinusoid with this much power
    return bool(
        osc.min_hz <= frequency <= osc.max_hz
        and peak / total > osc.min_peak_share
        and amplitude > osc.min_amplitude
    )


def vocal_seconds(events: Sequence[AudioEvent], cfg: ScoringConfig) -> int:
    """1-s windows whose top YAMNet class is a vocal one."""
    count = 0
    for _, window in groupby(sorted(events, key=lambda e: e.t), key=lambda e: e.t):
        top = max(window, key=lambda e: e.score)
        count += top.label in cfg.free_play.vocal_labels
    return count
