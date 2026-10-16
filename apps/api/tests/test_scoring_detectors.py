"""Task detectors (SCREENING_SPEC §4.3-§4.9) on the synthetic sessions: every detector on every
profile, then the edge cases on hand-built plans."""

from collections.abc import Sequence
from functools import cache

import pytest

from app.scoring.calibration import FALLBACK, Calibration, fit_calibration, gaze_x
from app.scoring.config import load_config
from app.scoring.free_play import detect_free_play
from app.scoring.gaze_preference import detect_gaze_preference
from app.scoring.imitation import detect_imitation
from app.scoring.inputs import AudioEvent, Frame, Marker
from app.scoring.joint_attention import detect_joint_attention
from app.scoring.results import InconclusiveReason, TaskResult, TaskStatus
from app.scoring.rtn import detect_rtn, trial_concern
from app.seed.screening_fixtures import (
    ALL_DETECTED,
    BALANCED_SIDES,
    GOOD_ROOM,
    FixtureTask,
    FreePlayPlan,
    LookPlan,
    Movement,
    Profile,
    Room,
    RtnPlan,
    TaskFixture,
    TurnPlan,
    calibration_session,
    fixture,
    free_play_session,
    gaze_preference_session,
    imitation_session,
    joint_attention_live_session,
    joint_attention_session,
    rtn_session,
)

CFG = load_config()
DARK = Room(face_dropout=0.85, pose_dropout=0.9, burst_frames=30)
# Landmark jitter but no dropouts: for tests of a rule rather than of capture conditions.
STEADY = Room(face_dropout=0, pose_dropout=0, frame_drop=0)


@cache
def calibration(profile: Profile) -> Calibration:
    session = fixture(profile, "calibration")
    return fit_calibration(session.frames, session.markers, CFG)


def detect(session: TaskFixture, cal: Calibration | None = None) -> TaskResult:
    frames, markers = session.frames, session.markers
    match session.task:
        case "rtn":
            return detect_rtn(frames, markers, CFG)
        case "joint_attention":
            return detect_joint_attention(frames, markers, cal, CFG)
        case "joint_attention_live":
            return detect_joint_attention(frames, markers, None, CFG, variant="live")
        case "imitation":
            return detect_imitation(frames, markers, CFG)
        case "gaze_preference":
            return detect_gaze_preference(frames, markers, cal, CFG)
        case _:
            return detect_free_play(frames, session.audio_events, CFG)


def run(profile: Profile, task: FixtureTask) -> TaskResult:
    return detect(fixture(profile, task), calibration(profile))


ok, low, inconclusive = TaskStatus.ok, TaskStatus.low, TaskStatus.inconclusive


# ── Every detector on every profile ──────────────────────────────────────────────────────────


@pytest.mark.parametrize(
    ("profile", "task", "status", "concern"),
    [
        ("typical", "rtn", ok, 0),
        ("typical", "joint_attention", ok, 0),
        ("typical", "joint_attention_live", ok, 0),
        ("typical", "imitation", ok, 0),
        ("typical", "gaze_preference", ok, 0),
        ("typical", "free_play", ok, 0),
        ("elevated", "rtn", ok, pytest.approx((0.5 + 1 + 1) / 3)),  # one late response
        ("elevated", "joint_attention", ok, 1),  # followed 1 of 6
        ("elevated", "joint_attention_live", ok, 1),  # 1 of 4
        ("elevated", "imitation", ok, 0.5),  # copied 1, attempted 2, nothing 1
        ("elevated", "gaze_preference", ok, 1),
        ("elevated", "free_play", ok, 1),
        # A typical child in a dark, noisy room: what can be measured is flagged low.
        ("noisy", "rtn", low, 0.5),
        ("noisy", "joint_attention", low, 0),
        ("noisy", "joint_attention_live", inconclusive, None),
        ("noisy", "imitation", low, 0),
        ("noisy", "gaze_preference", low, 0),
        ("noisy", "free_play", inconclusive, None),
    ],
)
def test_detector_on_profile(
    profile: Profile, task: FixtureTask, status: TaskStatus, concern: float | None
) -> None:
    result = run(profile, task)
    assert result.status is status
    assert result.concern == concern
    assert result.valid is (status is not inconclusive)


def test_fixtures_are_deterministic() -> None:
    fixture.cache_clear()
    first = fixture("noisy", "rtn")
    fixture.cache_clear()
    assert fixture("noisy", "rtn") == first


def test_fixture_json_round_trips_into_the_input_models() -> None:
    data = fixture("typical", "imitation").to_json()
    frames = [Frame.model_validate(f) for f in data["frames"]]
    markers = [Marker.model_validate(m) for m in data["markers"]]
    assert detect_imitation(frames, markers, CFG).concern == 0


# ── Calibration (§4.3) ───────────────────────────────────────────────────────────────────────


@pytest.mark.parametrize("profile", ["typical", "elevated"])
def test_calibration_fits_head_and_eyes(profile: Profile) -> None:
    cal = calibration(profile)
    assert cal.status == "ok"
    # Turning to their own right (yaw up) or eyes toward image left (iris_x down) → screen right.
    assert cal.a > 0 > cal.b
    looking_left = Frame(t=0, face=True, yaw=-12, iris_x=0.15)
    assert (gaze_x(looking_left, cal, CFG) or 0) < -0.35


def test_calibration_falls_back_when_the_face_is_lost() -> None:
    cal = calibration("noisy")
    assert (cal.status, cal.reason) == ("fallback", "face_not_visible")


def test_calibration_falls_back_when_the_child_doesnt_follow_the_star() -> None:
    session = calibration_session(seed=1, follows=False)
    cal = fit_calibration(session.frames, session.markers, CFG)
    assert (cal.status, cal.reason) == ("fallback", "wrong_direction")


def test_calibration_needs_every_target() -> None:
    session = calibration_session(seed=1)
    markers = [m for m in session.markers if m.position != "right"]
    cal = fit_calibration(session.frames, markers, CFG)
    assert (cal.status, cal.reason) == ("fallback", "missing_targets")


@pytest.mark.parametrize(("yaw", "gaze"), [(10, 0.4), (-50, -1.0), (40, 1.0), (0, 0.0)])
def test_fallback_gaze_is_yaw_over_25_clamped(yaw: float, gaze: float) -> None:
    assert gaze_x(Frame(t=0, face=True, yaw=yaw, iris_x=0.5), FALLBACK, CFG) == gaze


def test_no_gaze_without_a_face() -> None:
    assert gaze_x(Frame(t=0, face=False), FALLBACK, CFG) is None


# ── T1 Response to name (§4.4) ───────────────────────────────────────────────────────────────


def rtn(*plans: RtnPlan, room: Room = GOOD_ROOM, markers: Sequence[Marker] = ()) -> TaskResult:
    session = rtn_session(plans, room, seed=7)
    return detect_rtn(session.frames, [*session.markers, *markers], CFG)


def test_rtn_typical_findings_report_responses_as_a_strength() -> None:
    result = run("typical", "rtn")
    (finding,) = result.findings
    assert finding.key == "findings.rtn.responded"
    assert finding.polarity == "strength"
    assert finding.params == {"responded": 3, "valid": 3, "latency_s": 1.2}


def test_rtn_elevated_finding_reports_the_late_response() -> None:
    (finding,) = run("elevated", "rtn").findings
    assert finding.polarity == "concern"
    assert finding.params["responded"] == 1
    assert finding.params["latency_s"] == pytest.approx(3.3, abs=0.2)


def test_rtn_no_response_at_all_uses_its_own_key() -> None:
    result = rtn(RtnPlan(None), RtnPlan(None), RtnPlan(None))
    assert result.concern == 1
    assert result.findings[0].key == "findings.rtn.no_response"
    assert result.metrics["latency_s"] is None


def test_rtn_latency_is_measured_from_voice_onset() -> None:
    result = rtn(RtnPlan(900), RtnPlan(2500), RtnPlan(4000))
    latencies = [t.latency_ms for t in result.trials]
    assert latencies == [pytest.approx(900, abs=120)] * 1 + [
        pytest.approx(2500, abs=120),
        pytest.approx(4000, abs=120),
    ]
    assert [t.concern for t in result.trials] == [0, 0.25, 0.5]
    assert all(not t.t0_estimated for t in result.trials)


def test_rtn_t0_falls_back_when_no_voice_onset_is_heard() -> None:
    result = rtn(RtnPlan(1500, voice=False), RtnPlan(1500), RtnPlan(1500))
    first = result.trials[0]
    assert first.t0_estimated
    assert first.t0_ms == first.prompt_ms + CFG.voice_onset.fallback_ms
    # The call really came 450 ms after the prompt, so the measured latency shrinks by 350 ms.
    assert first.latency_ms == pytest.approx(1500 + 450 - 800, abs=120)
    assert result.metrics["t0_estimated"] == 1


def test_rtn_pre_state_facing_is_excluded() -> None:
    result = rtn(RtnPlan(900, pre_state="facing"), RtnPlan(1000), RtnPlan(1100))
    first = result.trials[0]
    assert (first.valid, first.invalid_reason, first.concern) == (False, "pre_state_facing", None)
    assert result.quality.valid_trials == 2
    assert result.status is ok


def test_rtn_needs_the_face_before_the_call() -> None:
    result = rtn(RtnPlan(900, face_hidden_before=True), RtnPlan(900), RtnPlan(900))
    assert result.trials[0].invalid_reason == "face_not_visible"
    assert result.quality.valid_trials == 2


def test_rtn_something_went_wrong_excludes_the_trial() -> None:
    result = rtn(
        RtnPlan(900),
        RtnPlan(None),
        RtnPlan(1000),
        markers=[Marker(t=40000, type="something_wrong", trial=2)],
    )
    assert result.trials[1].invalid_reason == "something_wrong"
    assert result.concern == 0


@pytest.mark.parametrize(
    ("plans", "reason"),
    [
        ([RtnPlan(900, pre_state="facing")] * 3, InconclusiveReason.not_enough_valid_trials),
        (
            [RtnPlan(900), RtnPlan(900, pre_state="facing")],
            InconclusiveReason.not_enough_valid_trials,
        ),
        ([RtnPlan(900, face_hidden_before=True)] * 3, InconclusiveReason.face_not_visible),
    ],
)
def test_rtn_without_two_valid_trials_is_inconclusive(
    plans: list[RtnPlan], reason: InconclusiveReason
) -> None:
    result = rtn(*plans)
    assert result.status is inconclusive
    assert result.concern is None
    assert result.quality.reason is reason
    assert result.findings == ()
    assert result.trials  # still reported for the doctor


def test_rtn_with_no_data() -> None:
    result = detect_rtn([], [], CFG)
    assert (result.status, result.quality.reason) == (inconclusive, InconclusiveReason.no_data)


def test_rtn_eye_contact_is_capped() -> None:
    result = rtn(RtnPlan(900, eye_contact_ms=6000), RtnPlan(900), RtnPlan(900))
    assert result.trials[0].eye_contact_ms == CFG.rtn.eye_contact_cap_ms


@pytest.mark.parametrize(
    ("latency", "concern"),
    [(0, 0), (2000, 0), (2001, 0.25), (3000, 0.25), (3001, 0.5), (5000, 0.5), (None, 1)],
)
def test_rtn_trial_concern_bands(latency: float | None, concern: float) -> None:
    assert trial_concern(latency, CFG) == concern


def test_rtn_noisy_room_flags_low_quality() -> None:
    result = run("noisy", "rtn")
    assert result.quality.face_pct is not None and result.quality.face_pct < 0.8
    assert any(t.t0_estimated for t in result.trials)  # the fan drowns the call
    assert any(t.invalid_reason == "pre_state_facing" for t in result.trials)


# ── T2 Look where I point (§4.5) ─────────────────────────────────────────────────────────────


def on_screen(
    looks: Sequence[str | None],
    *,
    attends: Sequence[bool] | None = None,
    cal: Calibration | None = None,
    markers: Sequence[Marker] = (),
) -> TaskResult:
    attends = attends or [True] * len(looks)
    plans = [
        LookPlan(side, look, attends=attend)  # type: ignore[arg-type]
        for side, look, attend in zip(BALANCED_SIDES, looks, attends, strict=False)
    ]
    session = joint_attention_session(plans, STEADY, seed=3)
    return detect_joint_attention(
        session.frames, [*session.markers, *markers], cal or calibration("typical"), CFG
    )


def test_joint_attention_first_look_decides_each_trial() -> None:
    result = on_screen(["target", "other", None, "target", "target", "target"])
    assert [t.first_look for t in result.trials] == ["left", "left", None, "left", "right", "left"]
    assert [t.followed for t in result.trials] == [True, False, False, True, True, True]
    assert result.metrics["follow_rate"] == pytest.approx(4 / 6, abs=0.001)


@pytest.mark.parametrize(
    ("followed", "concern"),
    # 0 at follow_rate ≥ 0.75, 1 at ≤ 0.25, linear in between.
    [(6, 0), (5, 0), (4, 1 / 6), (3, 0.5), (2, 5 / 6), (1, 1), (0, 1)],
)
def test_joint_attention_concern_is_linear_in_follow_rate(followed: int, concern: float) -> None:
    looks = ["target"] * followed + [None] * (6 - followed)
    assert on_screen(looks).concern == pytest.approx(concern)


def test_joint_attention_not_attending_during_engage_is_invalid() -> None:
    result = on_screen(["target"] * 6, attends=[True, False, True, True, True, True])
    assert result.trials[1].invalid_reason == "not_attending"
    assert result.trials[1].attended_centre is False
    assert result.quality.valid_trials == 5


def test_joint_attention_needs_four_valid_trials() -> None:
    result = on_screen(["target"] * 6, attends=[True, False, False, True, False, True])
    assert result.status is inconclusive
    assert result.quality.reason is InconclusiveReason.not_enough_valid_trials


def test_joint_attention_something_went_wrong_excludes_the_trial() -> None:
    result = on_screen(["target"] * 6, markers=[Marker(t=9000, type="something_wrong", trial=2)])
    assert result.trials[1].invalid_reason == "something_wrong"
    assert result.quality.valid_trials == 5


def test_joint_attention_without_calibration_uses_the_fallback_and_is_low() -> None:
    session = joint_attention_session([LookPlan(s, "target") for s in BALANCED_SIDES], seed=3)
    result = detect_joint_attention(session.frames, session.markers, None, CFG)
    assert result.quality.calibration == "fallback"
    assert result.status is low


def test_joint_attention_live_reads_head_turn_direction_from_nose_dx() -> None:
    plans = [TurnPlan("left", "toward"), TurnPlan("right", "away"), TurnPlan("right", None)]
    session = joint_attention_live_session([*plans, TurnPlan("left", "toward")], seed=5)
    result = detect_joint_attention(session.frames, session.markers, None, CFG, variant="live")
    assert [t.first_look for t in result.trials] == ["left", "left", None, "left"]
    assert [t.followed for t in result.trials] == [True, False, False, True]
    assert result.quality.calibration is None
    assert result.metrics["variant"] == "live"


def test_joint_attention_live_needs_three_valid_trials() -> None:
    session = joint_attention_live_session([TurnPlan("left", "toward")] * 4, DARK, seed=5)
    result = detect_joint_attention(session.frames, session.markers, None, CFG, variant="live")
    assert result.status is inconclusive


def test_joint_attention_live_t0_falls_back_in_a_noisy_room() -> None:
    quiet_voice = Room(voice_db=-46)
    session = joint_attention_live_session([TurnPlan("left", "toward")] * 4, quiet_voice, seed=5)
    result = detect_joint_attention(session.frames, session.markers, None, CFG, variant="live")
    assert all(t.t0_estimated for t in result.trials)
    assert result.concern == 0


def test_joint_attention_no_data() -> None:
    result = detect_joint_attention([], [], None, CFG)
    assert result.quality.reason is InconclusiveReason.no_data


# ── T3 Copy me (§4.6) ────────────────────────────────────────────────────────────────────────


@pytest.mark.parametrize("action", ["arms_up", "clap", "wave", "touch_head"])
@pytest.mark.parametrize("outcome", ["detected", "attempt", "none"])
def test_imitation_rules_per_action(action: str, outcome: str) -> None:
    others = {a: ["detected"] for a in ALL_DETECTED if a != action}
    session = imitation_session({action: [outcome], **others}, seed=11)  # type: ignore[dict-item]
    result = detect_imitation(session.frames, session.markers, CFG)
    trial = next(t for t in result.trials if t.action == action)
    assert trial.outcome == outcome
    others_detected = [t.outcome for t in result.trials if t.action != action]
    assert others_detected == ["detected"] * 3  # no rule fires for another action's movement


def test_imitation_keeps_the_best_window_after_the_retry() -> None:
    plan = {
        "arms_up": ["none", "detected"],
        "clap": ["attempt", "none"],
        **{a: ["detected"] for a in ("wave", "touch_head")},
    }
    session = imitation_session(plan, seed=11)  # type: ignore[arg-type]
    result = detect_imitation(session.frames, session.markers, CFG)
    by_action = {t.action: t for t in result.trials}
    assert (by_action["arms_up"].outcome, by_action["arms_up"].windows) == ("detected", 2)
    assert by_action["clap"].outcome == "attempt"
    assert result.concern == pytest.approx(0.5 / 4)
    assert result.findings[0].params == {"copied": 3, "attempted": 1, "valid": 4}


def test_imitation_something_went_wrong_excludes_the_action() -> None:
    session = imitation_session(dict(ALL_DETECTED), seed=11)
    wrong = Marker(t=5000, type="something_wrong", action="clap")
    result = detect_imitation(session.frames, [*session.markers, wrong], CFG)
    assert next(t for t in result.trials if t.action == "clap").invalid_reason == "something_wrong"
    assert result.quality.valid_trials == 3
    assert result.status is ok


def test_imitation_without_the_body_in_view_is_inconclusive() -> None:
    session = imitation_session(dict(ALL_DETECTED), DARK, seed=11)
    result = detect_imitation(session.frames, session.markers, CFG)
    assert (result.status, result.quality.reason) == (
        inconclusive,
        InconclusiveReason.body_not_visible,
    )
    assert all(t.invalid_reason == "body_not_visible" for t in result.trials)


def test_imitation_no_data() -> None:
    assert detect_imitation([], [], CFG).quality.reason is InconclusiveReason.no_data


# ── T4 Look & watch (§4.7) ───────────────────────────────────────────────────────────────────


@pytest.mark.parametrize(("share", "concern"), [(0.3, 0), (0.5, 0), (0.65, 0.5), (0.9, 1)])
def test_gaze_preference_concern_is_linear_in_geometric_share(share: float, concern: float) -> None:
    session = gaze_preference_session(share, seed=13)
    result = detect_gaze_preference(session.frames, session.markers, calibration("typical"), CFG)
    measured = result.metrics["geometric_pct"]
    assert isinstance(measured, int)
    assert measured == pytest.approx(share * 100, abs=6)
    assert result.concern == pytest.approx(
        CFG.gaze_preference.geometric_concern.concern(measured / 100), abs=0.02
    )
    assert result.concern == pytest.approx(concern, abs=0.2)


def test_gaze_preference_findings() -> None:
    assert run("typical", "gaze_preference").findings[0].key == "findings.gaze_preference.social"
    finding = run("elevated", "gaze_preference").findings[0]
    assert (finding.key, finding.polarity) == ("findings.gaze_preference.geometric", "concern")


def test_gaze_preference_untracked_gaze_is_inconclusive() -> None:
    session = gaze_preference_session(0.3, DARK, seed=13)
    result = detect_gaze_preference(session.frames, session.markers, calibration("typical"), CFG)
    assert result.quality.reason is InconclusiveReason.gaze_not_tracked


def test_gaze_preference_no_data() -> None:
    result = detect_gaze_preference([], [], None, CFG)
    assert result.quality.reason is InconclusiveReason.no_data


# ── T5 Free play (§4.8) ──────────────────────────────────────────────────────────────────────


def free_play(plan: FreePlayPlan, room: Room = GOOD_ROOM) -> TaskResult:
    session = free_play_session(plan, room, seed=17)
    return detect_free_play(session.frames, session.audio_events, CFG)


def test_free_play_counts_one_flapping_episode() -> None:
    result = free_play(FreePlayPlan(flapping=(Movement(30000, 4000, 3.0, 0.05),)))
    assert result.metrics["episodes"] == 1
    assert result.concern == 0.3
    (episode,) = result.trials
    assert episode.kind == "movement_episode" and episode.movement == "arm"
    assert episode.start_ms <= 30000 + 1000 and episode.end_ms >= 34000 - 1000
    assert result.findings[0].params == {"episodes": 1, "seconds": result.metrics["seconds"]}


def test_free_play_two_episodes() -> None:
    flaps = (Movement(20000, 4000, 4.5, 0.05), Movement(70000, 4000, 2.0, 0.04))
    result = free_play(FreePlayPlan(flapping=flaps))
    assert (result.metrics["episodes"], result.concern) == (2, 0.6)


def test_free_play_fifteen_seconds_is_full_concern_even_in_one_episode() -> None:
    result = free_play(FreePlayPlan(flapping=(Movement(30000, 17000, 3.0, 0.05),)))
    assert result.metrics["episodes"] == 1
    assert result.concern == 1


def test_free_play_rocking_needs_four_seconds() -> None:
    short = free_play(FreePlayPlan(rocking=(Movement(40000, 2500, 0.8, 0.03),)))
    assert short.metrics["rocking_episodes"] == 0
    long = free_play(FreePlayPlan(rocking=(Movement(40000, 9000, 0.8, 0.03),)))
    assert long.metrics["rocking_episodes"] == 1


def test_free_play_ignores_slow_and_small_movements() -> None:
    slow = free_play(FreePlayPlan(flapping=(Movement(30000, 8000, 0.8, 0.05),)))
    small = free_play(FreePlayPlan(flapping=(Movement(30000, 8000, 3.0, 0.01),)))
    assert slow.metrics["arm_episodes"] == small.metrics["arm_episodes"] == 0


def test_free_play_without_episodes_reports_no_strength() -> None:
    result = run("typical", "free_play")
    assert result.concern == 0
    assert result.findings == ()


def test_free_play_counts_vocal_seconds_from_the_top_class() -> None:
    events = [
        AudioEvent(t=0, label="Babbling", score=0.6),
        AudioEvent(t=0, label="Music", score=0.3),
        AudioEvent(t=1000, label="Music", score=0.8),
        AudioEvent(t=1000, label="Laughter", score=0.5),  # not the top class
        AudioEvent(t=2000, label="Speech", score=0.9),
    ]
    session = fixture("typical", "free_play")
    result = detect_free_play(session.frames, events, CFG)
    assert result.metrics["vocal_seconds"] == 2
    assert run("elevated", "free_play").metrics["vocal_seconds"] == 8


def test_free_play_without_the_body_in_view_is_inconclusive() -> None:
    assert free_play(FreePlayPlan(), DARK).quality.reason is InconclusiveReason.body_not_visible
    assert detect_free_play([], [], CFG).quality.reason is InconclusiveReason.no_data
