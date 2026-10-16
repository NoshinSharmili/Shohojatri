"""Shared signal helpers and the activity/combine sections of config.yaml."""

from pathlib import Path

import numpy as np
import pytest
from pydantic import ValidationError

from app.scoring.config import CONFIG_PATH, load_config, parse_config
from app.scoring.free_play import oscillates
from app.scoring.imitation import reversals
from app.scoring.inputs import Frame
from app.scoring.signals import Interval, Timeline, running_median, voice_onset

CFG = load_config()


def frames(*spec: tuple[float, bool]) -> list[Frame]:
    return [Frame(t=t, face=face) for t, face in spec]


def face(f: Frame) -> bool:
    return f.face


# ── Timeline ─────────────────────────────────────────────────────────────────────────────────


def test_states_hold_until_the_next_frame() -> None:
    tl = Timeline(frames((0, True), (100, True), (200, False), (300, True)), CFG.signals)
    assert tl.runs(face) == [Interval(0, 200), Interval(300, 400)]  # last holds a typical gap
    assert tl.share(face, 0, 400) == pytest.approx(0.75)


def test_a_long_gap_counts_as_not_seen() -> None:
    # The frame at 100 ms holds only max_hold_ms (250), not until 1000 ms; so does the last
    # one (the median gap, 500 ms, is capped too).
    tl = Timeline(frames((0, True), (100, True), (1000, True)), CFG.signals)
    assert tl.runs(face) == [Interval(0, 350), Interval(1000, 1250)]
    assert tl.share(face, 0, 1000) == pytest.approx(0.35)


def test_frames_are_sorted_and_empty_timelines_are_safe() -> None:
    tl = Timeline(frames((200, True), (0, False), (100, True)), CFG.signals)
    assert [f.t for f in tl.frames] == [0, 100, 200]
    empty = Timeline([], CFG.signals)
    assert (empty.start, empty.end, empty.runs(face), empty.share(face)) == (0, 0, [], 0)
    assert Timeline(frames((5, True)), CFG.signals).end == 5


def test_runs_shorter_than_the_minimum_are_dropped() -> None:
    tl = Timeline(
        frames((0, True), (100, False), (200, True), (300, True), (400, False)), CFG.signals
    )
    assert tl.runs(face, min_ms=150) == [Interval(200, 400)]


def test_first_run_clips_a_run_already_under_way() -> None:
    spec = [(t, 300 <= t < 900 or t >= 1500) for t in range(0, 2000, 100)]
    tl = Timeline(frames(*spec), CFG.signals)
    assert tl.first_run(face, 500, 2000, 300) == Interval(500, 900)
    assert tl.first_run(face, 700, 2000, 300) == Interval(1500, 2000)  # 700-900 is too short
    assert tl.first_run(face, 950, 1400, 100) is None  # next run starts after the window


def test_voice_onset_needs_a_rise_over_the_running_baseline() -> None:
    quiet = [Frame(t=t, rms_db=-50) for t in range(0, 3000, 50)]
    loud = [Frame(t=t, rms_db=-30) for t in range(3000, 3500, 50)]
    tl = Timeline(quiet + loud, CFG.signals)
    assert voice_onset(tl, 2000, CFG.voice_onset) == (3000, False)
    assert voice_onset(tl, 3600, CFG.voice_onset) == (3600 + 800, True)  # nothing after 3.6 s
    small_rise = Timeline([*quiet, Frame(t=3000, rms_db=-41)], CFG.signals)
    assert voice_onset(small_rise, 2000, CFG.voice_onset)[1]


def test_running_median_removes_single_frame_glitches() -> None:
    values = np.array([1.0, 1.0, 9.0, 1.0, 1.0])
    assert running_median(values, 3).tolist() == [1, 1, 1, 1, 1]
    assert running_median(values, 1) is values
    assert running_median(values[:2], 3).tolist() == [1, 1]  # too short to filter


# ── Movement helpers ─────────────────────────────────────────────────────────────────────────


def sine(hz: float, amplitude: float, seconds: float = 3, rate: float = 15) -> np.ndarray:
    t = np.arange(0, seconds, 1 / rate)
    return amplitude * np.sin(2 * np.pi * hz * t) + 0.2 * t  # with a drift to detrend


@pytest.mark.parametrize(
    ("hz", "amplitude", "found"),
    [
        (3.0, 0.3, True),
        (2.5, 0.3, True),  # between two frequency bins
        (5.5, 0.3, True),
        (1.0, 0.3, False),  # too slow for arm movement
        (3.0, 0.1, False),  # too small
    ],
)
def test_oscillation_band_and_amplitude(hz: float, amplitude: float, found: bool) -> None:
    assert oscillates(sine(hz, amplitude), 15, CFG.free_play.arm) is found


def test_noise_and_flat_signals_do_not_oscillate() -> None:
    rng = np.random.default_rng(0)
    assert not oscillates(rng.normal(0, 0.3, 45), 15, CFG.free_play.arm)  # no dominant peak
    assert not oscillates(np.zeros(45), 15, CFG.free_play.arm)
    assert not oscillates(np.zeros(3), 15, CFG.free_play.arm)


def test_reversals_ignore_jitter_smaller_than_the_swing() -> None:
    samples = [(float(t), x) for t, x in enumerate([0, 0.05, 0, 0.5, 0.45, 0.5, 0, 0.6, 0.1])]
    assert reversals(samples, 0.25) == [3, 6, 7]
    assert reversals([], 0.25) == []


# ── Config ───────────────────────────────────────────────────────────────────────────────────


def broken(tmp_path: Path, old: str, new: str) -> Path:
    text = CONFIG_PATH.read_text(encoding="utf-8")
    assert old in text
    path = tmp_path / "config.yaml"
    path.write_text(text.replace(old, new), encoding="utf-8")
    return path


@pytest.mark.parametrize(
    ("old", "new"),
    [
        ("  free_play: 0.05\n", ""),  # a weight missing
        ("- { name: moderate, max_score: 45 }", "- { name: moderate, max_score: 15 }"),
        ("- { name: high, max_score: 100 }", "- { name: high, max_score: 99 }"),
        ("- { max_ms: 3000, concern: 0.25 }", "- { max_ms: 1000, concern: 0.25 }"),
        ("- { max_ms: 5000, concern: 0.5 }", "- { max_ms: 6000, concern: 0.5 }"),
        ("- { min_episodes: 0, concern: 0 }", "- { min_episodes: 1, concern: 0 }"),
        ("critical_tasks: [rtn,", "critical_tasks: [hearing,"),
    ],
)
def test_config_rejects_inconsistent_tables(tmp_path: Path, old: str, new: str) -> None:
    with pytest.raises(ValidationError):
        parse_config(broken(tmp_path, old, new))


def test_every_spec_weight_is_configured() -> None:
    assert sum(CFG.weights.values()) == pytest.approx(1.0)
    assert [(c.name, c.max_score) for c in CFG.classes] == [
        ("low", 20), ("moderate", 45), ("elevated", 70), ("high", 100),
    ]  # fmt: skip
