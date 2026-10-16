"""Synthetic screening sessions (SCREENING_SPEC §9): per-frame feature streams for every task,
as the browser would send them, in `typical`, `elevated` and `noisy` profiles. Used by pytest
and by demo screening mode; `scripts/make_fixtures.py` writes them out as JSON.

Each task has a session builder driven by a plan (what the child does in each trial) and a Room
(capture conditions: landmark jitter, bursts of missing face/pose, dropped frames, background
noise). The profiles are just plans + rooms, so tests can build their own edge cases. Output is
deterministic: every session takes a seed.

Feature conventions follow app/scoring/inputs.py: un-mirrored image coordinates, yaw > 0 when
the child turns toward their own right (nose toward image left, nose_dx < 0).
"""

import math
import zlib
from collections.abc import Callable, Sequence
from dataclasses import dataclass, field
from functools import cache
from typing import Any, Literal

import numpy as np

from app.scoring.inputs import AudioEvent, Frame, Marker, Pose, Side

Profile = Literal["typical", "elevated", "noisy"]
PROFILES: tuple[Profile, ...] = ("typical", "elevated", "noisy")
FixtureTask = Literal[
    "calibration", "rtn", "joint_attention", "joint_attention_live", "imitation",
    "gaze_preference", "free_play",
]  # fmt: skip
FIXTURE_TASKS: tuple[FixtureTask, ...] = (
    "calibration", "rtn", "joint_attention", "joint_attention_live", "imitation",
    "gaze_preference", "free_play",
)  # fmt: skip

HZ = 15
# Front camera: a screen-space gaze g is split between head and eyes, the head's share drifting
# over time. Head: yaw = 25° per unit of head gaze. Eyes: looking to their own right moves the
# irises toward image left, 0.5 per unit of eye gaze.
HEAD_DEG_PER_GAZE = 25.0
IRIS_PER_GAZE = 0.5
NOSE_DX_PER_DEG = -0.012


@dataclass(frozen=True)
class Room:
    face_dropout: float = 0.03  # long-run share of frames where the face isn't found
    pose_dropout: float = 0.03
    burst_frames: float = 4  # mean length of a dropout burst
    jitter: float = 1.0  # multiplier on landmark noise
    frame_drop: float = 0.02  # frames the browser didn't process
    background_db: float = -48.0
    voice_db: float = -20.0


GOOD_ROOM = Room()
# Low light, a fan running, child often out of frame.
NOISY_ROOM = Room(
    face_dropout=0.35,
    pose_dropout=0.5,
    burst_frames=10,
    jitter=2.0,
    frame_drop=0.08,
    background_db=-33.0,
    voice_db=-26.0,
)


@dataclass(frozen=True)
class TaskFixture:
    task: FixtureTask
    variant: str | None
    frames: tuple[Frame, ...]
    markers: tuple[Marker, ...]
    audio_events: tuple[AudioEvent, ...] = ()

    def to_json(self) -> dict[str, Any]:
        return {
            "task": self.task,
            "variant": self.variant,
            "frames": [f.model_dump(exclude_none=True) for f in self.frames],
            "markers": [m.model_dump(exclude_none=True) for m in self.markers],
            "audio_events": [e.model_dump() for e in self.audio_events],
        }


@dataclass(frozen=True)
class Head:
    yaw: float
    pitch: float = 5.0
    iris_x: float = 0.0
    visible: bool = True  # False: the child moved out of view


# Keypoint positions (x, y) for a child about 1.3 m from a front camera; sw = 0.16.
REST: dict[str, tuple[float, float]] = {
    "nose": (0.50, 0.32),
    "l_ear": (0.535, 0.31),
    "r_ear": (0.465, 0.31),
    "l_shoulder": (0.58, 0.46),
    "r_shoulder": (0.42, 0.46),
    "l_elbow": (0.61, 0.58),
    "r_elbow": (0.39, 0.58),
    "l_wrist": (0.60, 0.68),
    "r_wrist": (0.40, 0.68),
    "l_hip": (0.555, 0.74),
    "r_hip": (0.445, 0.74),
}
SW = 0.16

PoseFn = Callable[[float], dict[str, tuple[float, float]] | None]


class _Sim:
    """Samples a child's behaviour into frames under a room's conditions."""

    def __init__(self, room: Room, seed: int) -> None:
        self.room = room
        self.rng = np.random.default_rng(seed)

    def times(self, duration_ms: float) -> list[float]:
        out, t = [], 0.0
        while t < duration_ms:
            if self.rng.random() >= self.room.frame_drop:
                out.append(round(t, 1))
            t += 1000 / HZ + self.rng.normal(0, 4)
        return out

    def missing(self, n: int, share: float) -> list[bool]:
        """Bursty dropouts: a two-state chain with the given long-run share missing."""
        if share <= 0:
            return [False] * n
        leave = 1 / self.room.burst_frames
        enter = min(1.0, share / (1 - share) * leave)
        state, out = self.rng.random() < share, []
        for _ in range(n):
            out.append(state)
            state = self.rng.random() >= leave if state else self.rng.random() < enter
        return out

    def frames(
        self,
        duration_ms: float,
        *,
        head: Callable[[float], Head],
        pose: PoseFn | None = None,
        voice: Callable[[float], bool] | None = None,
        iod: float = 0.075,
    ) -> list[Frame]:
        times = self.times(duration_ms)
        no_face = self.missing(len(times), self.room.face_dropout)
        no_pose = self.missing(len(times), self.room.pose_dropout)
        j, rng = self.room.jitter, self.rng
        out = []
        for t, face_lost, pose_lost in zip(times, no_face, no_pose, strict=True):
            h = head(t)
            face = h.visible and abs(h.yaw) < 75 and not face_lost
            features: dict[str, Any] = {}
            if face:
                yaw = h.yaw + rng.normal(0, 1.5 * j)
                features = {
                    "yaw": round(yaw, 2),
                    "pitch": round(h.pitch + rng.normal(0, 1.5 * j), 2),
                    "nose_dx": round(NOSE_DX_PER_DEG * yaw + rng.normal(0, 0.01 * j), 4),
                    "iris_x": round(h.iris_x + rng.normal(0, 0.03 * j), 4),
                    "iris_y": round(rng.normal(0, 0.03 * j), 4),
                    "eye_open": round(0.1 if rng.random() < 0.03 else 0.9 + rng.normal(0, 0.03), 3),
                    "iod": round(iod * (1 + rng.normal(0, 0.03)), 4),
                }
            points = pose(t) if pose else None
            out.append(
                Frame(
                    t=t,
                    face=face,
                    pose=None if points is None or pose_lost else self._pose(points),
                    rms_db=self._rms(voice(t) if voice else False),
                    **features,
                )
            )
        return out

    def _pose(self, points: dict[str, tuple[float, float]]) -> Pose:
        noise = 0.003 * self.room.jitter
        keypoints = {}
        for name, (x, y) in points.items():
            seen = 0.2 if self.rng.random() < 0.02 else 0.92
            keypoints[name] = (
                round(x + self.rng.normal(0, noise), 4),
                round(y + self.rng.normal(0, noise), 4),
                seen,
            )
        return Pose(**keypoints)

    def _rms(self, speaking: bool) -> float:
        level = 10 ** (self.room.background_db / 20)
        if speaking:
            level += 10 ** (self.room.voice_db / 20)
        return round(20 * math.log10(level) + self.rng.normal(0, 1.5), 1)


def _seed(*parts: object) -> int:
    return zlib.crc32(":".join(map(str, parts)).encode())


def _ease(t: float, start: float, duration: float, a: float, b: float) -> float:
    """From a to b over [start, start + duration], smoothly."""
    if t <= start:
        return a
    if t >= start + duration:
        return b
    u = (t - start) / duration
    return a + (b - a) * (3 * u * u - 2 * u * u * u)


def _front(gaze: float, t: float) -> Head:
    head = 0.6 + 0.2 * math.sin(t / 1300)
    return Head(yaw=HEAD_DEG_PER_GAZE * head * gaze, iris_x=-IRIS_PER_GAZE * (1 - head) * gaze)


# ── Calibration (§4.3) ──────────────────────────────────────────────────────────────────────


def calibration_session(
    room: Room = GOOD_ROOM, seed: int = 0, *, follows: bool = True
) -> TaskFixture:
    order = (("left", -1.0), ("centre", 0.0), ("right", 1.0), ("centre", 0.0))
    starts = [500 + i * 1500 for i in range(len(order))]
    markers = [
        Marker(t=t, type="target", position=pos)  # type: ignore[arg-type]
        for t, (pos, _) in zip(starts, order, strict=True)
    ]

    def head(t: float) -> Head:
        if not follows:
            return _front(0.0, t)
        target = 0.0
        for start, (_, value) in zip(starts, order, strict=True):
            if t >= start + 350:  # the child follows the star after a short lag
                target = value
        return _front(0.85 * target, t)

    sim = _Sim(room, seed)
    return TaskFixture("calibration", None, tuple(sim.frames(6800, head=head)), tuple(markers))


# ── T1 Response to name (§4.4) ───────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class RtnPlan:
    latency_ms: float | None  # from voice onset to facing the caller; None = no response
    eye_contact_ms: float = 1500
    pre_state: Literal["away", "facing"] = "away"
    voice: bool = True  # False: the call is too quiet to detect (t0 falls back)
    face_hidden_before: bool = False  # face out of view in the 2 s before the call


def rtn_session(plans: Sequence[RtnPlan], room: Room = GOOD_ROOM, seed: int = 0) -> TaskFixture:
    prompts = [6000 + i * 22000 for i in range(len(plans))]
    onsets = [p + 450 for p in prompts]  # the parent starts speaking ~0.45 s after the prompt
    markers = [
        Marker(t=t, type="prompt", trial=i + 1, pre_state=plan.pre_state)
        for i, (t, plan) in enumerate(zip(prompts, plans, strict=True))
    ]

    def head(t: float) -> Head:
        for i, (onset, plan) in enumerate(zip(onsets, plans, strict=True)):
            away = Head(yaw=(45 if i % 2 == 0 else -45) + 3 * math.sin(t / 700), pitch=18)
            if plan.pre_state == "facing" and onset - 4000 <= t < onset + 3000:
                return Head(yaw=2, pitch=4)
            if plan.face_hidden_before and onset - 2500 <= t < onset:
                return Head(yaw=90, visible=False)
            if plan.latency_ms is not None:
                turn = onset + plan.latency_ms - 250
                back = onset + plan.latency_ms + plan.eye_contact_ms
                if turn <= t < back + 300:
                    yaw = (
                        _ease(t, turn, 250, away.yaw, 3)
                        if t < back
                        else _ease(t, back, 300, 3, away.yaw)
                    )
                    return Head(yaw=yaw, pitch=_ease(t, turn, 250, 18, 4))
        index = sum(t >= p + 9000 for p in prompts) % 2
        return Head(yaw=(45 if index == 0 else -45) + 3 * math.sin(t / 700), pitch=18)

    def voice(t: float) -> bool:
        return any(
            plan.voice and onset <= t < onset + 700
            for onset, plan in zip(onsets, plans, strict=True)
        )

    sim = _Sim(room, seed)
    frames = sim.frames(prompts[-1] + 12000, head=head, voice=voice, iod=0.045)
    return TaskFixture("rtn", None, tuple(frames), tuple(markers))


# ── T2 Look where I point (§4.5) ─────────────────────────────────────────────────────────────

BALANCED_SIDES: tuple[Side, ...] = ("left", "right", "right", "left", "right", "left")


@dataclass(frozen=True)
class LookPlan:
    side: Side
    look: Literal["target", "other"] | None  # where the first look goes; None = no look
    latency_ms: float = 700
    attends: bool = True  # watching the character during the engage phase


def joint_attention_session(
    plans: Sequence[LookPlan], room: Room = GOOD_ROOM, seed: int = 0
) -> TaskFixture:
    starts = [1000 + i * 6000 for i in range(len(plans))]
    markers: list[Marker] = []
    for i, (start, plan) in enumerate(zip(starts, plans, strict=True)):
        markers += [
            Marker(t=start, type="engage", trial=i + 1, side=plan.side),
            Marker(t=start + 1500, type="cue", trial=i + 1, side=plan.side),
        ]
    markers.append(Marker(t=starts[-1] + 5000, type="end"))

    def head(t: float) -> Head:
        for start, plan in zip(starts, plans, strict=True):
            if not start <= t < start + 6000:
                continue
            if t < start + 1500:
                return _front(0.0 if plan.attends else 0.9, t)
            if plan.look is None:
                return _front(0.0, t)
            direction = -1.0 if plan.side == "left" else 1.0
            if plan.look == "other":
                direction = -direction
            look = start + 1500 + plan.latency_ms
            if t < look + 1500:
                return _front(_ease(t, look, 200, 0.0, 0.8 * direction), t)
            return _front(_ease(t, look + 1500, 300, 0.8 * direction, 0.0), t)
        return _front(0.0, t)

    sim = _Sim(room, seed)
    frames = sim.frames(starts[-1] + 5500, head=head)
    return TaskFixture("joint_attention", "on_screen", tuple(frames), tuple(markers))


@dataclass(frozen=True)
class TurnPlan:
    side: Side  # image side the parent tapped
    turn: Literal["toward", "away"] | None
    latency_ms: float = 900


def joint_attention_live_session(
    plans: Sequence[TurnPlan], room: Room = GOOD_ROOM, seed: int = 0
) -> TaskFixture:
    cues = [3000 + i * 9000 for i in range(len(plans))]
    onsets = [c + 400 for c in cues]
    markers = [
        Marker(t=c, type="cue", trial=i + 1, side=plan.side)
        for i, (c, plan) in enumerate(zip(cues, plans, strict=True))
    ]
    markers.append(Marker(t=cues[-1] + 6000, type="end"))

    def head(t: float) -> Head:
        for onset, plan in zip(onsets, plans, strict=True):
            if plan.turn is None or not onset <= t < onset + 4000:
                continue
            # Toward image left = the child's own right (rear camera facing the child): yaw up.
            direction = 1.0 if plan.side == "left" else -1.0
            if plan.turn == "away":
                direction = -direction
            turn = onset + plan.latency_ms
            return Head(yaw=_ease(t, turn, 300, 5, 5 + 40 * direction), pitch=8)
        return Head(yaw=5 + 2 * math.sin(t / 900), pitch=8)

    def voice(t: float) -> bool:
        return any(onset <= t < onset + 600 for onset in onsets)

    sim = _Sim(room, seed)
    frames = sim.frames(cues[-1] + 7000, head=head, voice=voice, iod=0.045)
    return TaskFixture("joint_attention_live", "live", tuple(frames), tuple(markers))


# ── T3 Copy me (§4.6) ────────────────────────────────────────────────────────────────────────

ActionOutcome = Literal["detected", "attempt", "none"]
Action = Literal["arms_up", "clap", "wave", "touch_head"]


def _action_pose(
    action: Action, outcome: ActionOutcome, u: float
) -> dict[str, tuple[float, float]]:
    """Keypoints `u` ms into the child's response (they start moving at u = 0)."""
    points = dict(REST)
    if outcome == "none" or u < 0 or u > 3200:
        return points
    lift = _ease(u, 0, 500, 0, 1) * (1 - _ease(u, 2700, 500, 0, 1))

    def toward(name: str, target: tuple[float, float]) -> None:
        x0, y0 = REST[name]
        points[name] = (x0 + (target[0] - x0) * lift, y0 + (target[1] - y0) * lift)

    if outcome == "attempt":
        toward("r_wrist", (0.42, 0.53))  # hand to chest: movement, but no rule met
    elif action == "arms_up":
        toward("l_wrist", (0.58, 0.18))
        toward("r_wrist", (0.42, 0.18))
    elif action == "clap":
        gap = 0.03 + 0.17 * (1 - math.cos(2 * math.pi * 1.5 * u / 1000)) / 2
        toward("l_wrist", (0.5 + gap / 2, 0.55))
        toward("r_wrist", (0.5 - gap / 2, 0.55))
    elif action == "wave":
        toward("r_wrist", (0.36 + 0.05 * math.sin(2 * math.pi * 2 * u / 1000), 0.28))
    else:
        toward("r_wrist", (0.47, 0.26))  # beside the head, near the ear
    return points


def imitation_session(
    plans: dict[Action, Sequence[ActionOutcome]], room: Room = GOOD_ROOM, seed: int = 0
) -> TaskFixture:
    """`plans` lists the child's outcome in each response window (two = the automatic retry)."""
    markers: list[Marker] = []
    responses: list[tuple[float, Action, ActionOutcome]] = []
    t = 1000.0
    for action, outcomes in plans.items():
        for attempt, outcome in enumerate(outcomes, start=1):
            window = t + 3000  # after the 3 s demonstration
            markers.append(Marker(t=window, type="response_window", action=action, attempt=attempt))
            responses.append((window + 900, action, outcome))
            t = window + 5500

    def pose(now: float) -> dict[str, tuple[float, float]]:
        for start, action, outcome in responses:
            if start - 900 <= now < start + 4600:
                return _action_pose(action, outcome, now - start)
        return dict(REST)

    sim = _Sim(room, seed)
    frames = sim.frames(t, head=lambda now: _front(0.0, now), pose=pose, iod=0.04)
    return TaskFixture("imitation", "on_screen", tuple(frames), tuple(markers))


# ── T4 Look & watch (§4.7) ───────────────────────────────────────────────────────────────────


def gaze_preference_session(
    geometric_share: float, room: Room = GOOD_ROOM, seed: int = 0
) -> TaskFixture:
    markers = [
        Marker(t=0, type="stimulus", social_side="left"),
        Marker(t=20000, type="stimulus", social_side="right"),
        Marker(t=40000, type="end"),
    ]
    rng = np.random.default_rng(seed + 1)
    dwells: list[tuple[float, bool]] = []  # (end time, looking at the geometric side)
    t = geometric_time = 0.0
    while t < 40000:
        dwell = float(rng.exponential(1800)) + 300
        # Random dwell lengths, sides chosen to keep the running share near the target.
        geometric = geometric_time < geometric_share * (t + dwell / 2)
        geometric_time += dwell if geometric else 0.0
        t += dwell
        dwells.append((t, geometric))

    def head(now: float) -> Head:
        geometric = next((g for end, g in dwells if now < end), False)
        social_left = now < 20000
        on_left = geometric != social_left
        return _front(-0.6 if on_left else 0.6, now)

    sim = _Sim(room, seed)
    return TaskFixture("gaze_preference", None, tuple(sim.frames(40000, head=head)), tuple(markers))


# ── T5 Free play (§4.8) ──────────────────────────────────────────────────────────────────────


@dataclass(frozen=True)
class Movement:
    start_ms: float
    duration_ms: float
    hz: float
    amplitude: float  # normalised image units (sw = 0.16)


@dataclass(frozen=True)
class FreePlayPlan:
    flapping: tuple[Movement, ...] = ()  # both wrists, vertical
    rocking: tuple[Movement, ...] = ()  # shoulders side to side
    vocal_seconds: int = 30
    duration_ms: float = 120000
    reach_times: tuple[float, ...] = field(default=(8000, 31000, 47000, 74000, 101000))


def free_play_session(plan: FreePlayPlan, room: Room = GOOD_ROOM, seed: int = 0) -> TaskFixture:
    rng = np.random.default_rng(seed + 2)
    # Ordinary play: slow, irregular hand movement (a few sub-hertz components) and reaches.
    slow = [
        (float(rng.uniform(0.05, 0.5)), float(rng.uniform(0.008, 0.02)), float(rng.uniform(0, 6.3)))
        for _ in range(6)
    ]

    def wave(m: Movement, t: float) -> float:
        if not m.start_ms <= t < m.start_ms + m.duration_ms:
            return 0.0
        return m.amplitude * math.sin(2 * math.pi * m.hz * (t - m.start_ms) / 1000)

    def pose(t: float) -> dict[str, tuple[float, float]]:
        drift = 0.01 * math.sin(2 * math.pi * 0.07 * t / 1000)
        body = drift + sum(wave(m, t) for m in plan.rocking)
        flap = sum(wave(m, t) for m in plan.flapping)
        reach = sum(
            0.08 * _ease(t, r, 700, 0, 1) * (1 - _ease(t, r + 1500, 700, 0, 1))
            for r in plan.reach_times
        )
        points = {}
        for i, (name, (x, y)) in enumerate(REST.items()):
            dx = dy = 0.0
            if name.endswith("wrist"):
                f, a, phase = slow[i % 3 + (3 if name.startswith("l") else 0)]
                dx = a * math.sin(2 * math.pi * f * t / 1000 + phase)
                dy = a * math.cos(2 * math.pi * f * t / 1000 + phase) - reach + flap
            points[name] = (x + body + dx, y + dy)
        return points

    vocal = set(rng.choice(int(plan.duration_ms // 1000), plan.vocal_seconds, replace=False))
    labels = ("Child speech, kid speaking", "Babbling", "Laughter")
    events = []
    for second in range(int(plan.duration_ms // 1000)):
        if second in vocal:
            events.append(AudioEvent(t=second * 1000, label=labels[second % 3], score=0.7))
            events.append(AudioEvent(t=second * 1000, label="Speech", score=0.4))
        else:
            events.append(AudioEvent(t=second * 1000, label="Silence", score=0.6))

    sim = _Sim(room, seed)
    frames = sim.frames(plan.duration_ms, head=lambda t: _front(0.0, t), pose=pose, iod=0.04)
    return TaskFixture("free_play", None, tuple(frames), (), tuple(events))


# ── Profiles ─────────────────────────────────────────────────────────────────────────────────

ALL_DETECTED: dict[Action, Sequence[ActionOutcome]] = {
    "arms_up": ["detected"],
    "clap": ["detected"],
    "wave": ["detected"],
    "touch_head": ["detected"],
}


@cache
def fixture(profile: Profile, task: FixtureTask) -> TaskFixture:
    """The stored session for one profile and task. `noisy` is a typical child filmed in poor
    conditions, so the scorer, not the behaviour, decides what can be measured."""
    elevated = profile == "elevated"
    room = NOISY_ROOM if profile == "noisy" else GOOD_ROOM
    seed = _seed(profile, task)
    match task:
        case "calibration":
            return calibration_session(room, seed)
        case "rtn":
            if elevated:
                plans = [RtnPlan(3400, eye_contact_ms=600), RtnPlan(None), RtnPlan(None)]
            else:
                plans = [RtnPlan(900), RtnPlan(1400), RtnPlan(1700)]
            if profile == "noisy":
                plans[2] = RtnPlan(1200, pre_state="facing")  # never looked away in 20 s
            return rtn_session(plans, room, seed)
        case "joint_attention":
            looks: list[Literal["target", "other"] | None] = (
                ["target", None, "other", None, None, "other"]
                if elevated
                else ["target", "target", "target", "other", "target", "target"]
            )
            plans_ja = [
                LookPlan(side, look, latency_ms=700 + 100 * i)
                for i, (side, look) in enumerate(zip(BALANCED_SIDES, looks, strict=True))
            ]
            return joint_attention_session(plans_ja, room, seed)
        case "joint_attention_live":
            turns: list[Literal["toward", "away"] | None] = (
                ["toward", None, "away", None] if elevated else ["toward"] * 4
            )
            sides: tuple[Side, ...] = ("left", "right", "right", "left")
            return joint_attention_live_session(
                [TurnPlan(s, turn) for s, turn in zip(sides, turns, strict=True)], room, seed
            )
        case "imitation":
            plan = (
                {
                    "arms_up": ["detected"],
                    "clap": ["attempt", "attempt"],
                    "wave": ["none", "none"],
                    "touch_head": ["none", "attempt"],
                }
                if elevated
                else ALL_DETECTED
            )
            return imitation_session(plan, room, seed)  # type: ignore[arg-type]
        case "gaze_preference":
            return gaze_preference_session(0.85 if elevated else 0.3, room, seed)
        case "free_play":
            if elevated:
                fp = FreePlayPlan(
                    flapping=(Movement(20000, 4500, 3.5, 0.05), Movement(58000, 5000, 4.0, 0.05)),
                    rocking=(Movement(80000, 9000, 0.8, 0.025),),
                    vocal_seconds=8,
                )
            else:
                fp = FreePlayPlan()
            return free_play_session(fp, room, seed)
