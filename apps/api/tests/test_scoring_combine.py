"""combine() (SCREENING_SPEC §6): weights, classes, floors, confidence and report findings."""

from dataclasses import replace

import pytest

from app.core.questionnaire import load_questionnaire
from app.scoring.combine import combine
from app.scoring.config import load_config
from app.scoring.names import RiskClass, TaskName
from app.scoring.questionnaire import ItemScore, QuestionnaireResult, score_questionnaire
from app.scoring.results import (
    Confidence,
    Finding,
    InconclusiveReason,
    TaskQuality,
    TaskResult,
    TaskStatus,
    inconclusive,
    skipped,
)

CFG = load_config()
ITEMS = load_questionnaire().items


def item(item_id: str, concern: float | None, *, weight: float = 1, critical: bool = False,
         strength: bool = True) -> ItemScore:  # fmt: skip
    return ItemScore(
        item_id=item_id,
        option=None if concern is None else {0: "usually", 0.5: "sometimes"}.get(concern, "rarely"),
        concern=concern,
        weight=weight,
        critical=critical,
        failed=critical and concern == 1,
        can_be_strength=strength,
    )


def questionnaire(
    score: float | None = 0.0,
    *,
    failed: tuple[str, ...] = (),
    regression: bool = False,
    hearing: str | None = "yes_normal",
    low_coverage: bool = False,
    items: tuple[ItemScore, ...] = (),
) -> QuestionnaireResult:
    return QuestionnaireResult(
        score=score,
        eligible=19,
        scorable=19,
        low_coverage=low_coverage,
        failed_critical=failed,
        regression=regression,
        hearing=hearing,
        items=items,
    )


def task(
    name: TaskName, concern: float, status: TaskStatus = TaskStatus.ok, *findings: Finding
) -> TaskResult:
    return TaskResult(
        task=name,
        status=status,
        concern=concern,
        quality=TaskQuality(status=status),
        findings=findings,
    )


def finding(name: TaskName, polarity: str) -> Finding:
    return Finding(key=f"findings.{name}.x", polarity=polarity, source=name)  # type: ignore[arg-type]


# ── Weights and score ────────────────────────────────────────────────────────────────────────


def test_questionnaire_only_scores_q() -> None:
    result = combine(questionnaire(0.3), [], CFG)
    assert result.score == 30
    assert [(c.name, c.share) for c in result.components] == [("questionnaire", 1.0)]
    assert result.scoring_version == CFG.scoring_version


def test_weights_renormalise_over_available_components() -> None:
    result = combine(questionnaire(0.2), [task(TaskName.rtn, 1.0)], CFG)
    # (0.45·0.2 + 0.15·1) / (0.45 + 0.15)
    assert result.score == 40
    shares = {c.name: c.share for c in result.components}
    assert shares == pytest.approx({"questionnaire": 0.75, "rtn": 0.25})
    assert sum(c.points for c in result.components) == pytest.approx(40)


def test_all_components_use_the_spec_weights() -> None:
    tasks = [task(name, 1.0) for name in TaskName]
    result = combine(questionnaire(0.0), tasks, CFG)
    assert result.score == 55  # every task at full concern carries 0.55 of the weight
    weights = {c.name: c.weight for c in result.components}
    assert weights == {
        "questionnaire": 0.45, "rtn": 0.15, "joint_attention": 0.15, "imitation": 0.10,
        "gaze_preference": 0.10, "free_play": 0.05,
    }  # fmt: skip


def test_skipped_and_inconclusive_tasks_are_excluded_and_listed() -> None:
    no_face = inconclusive(
        TaskName.joint_attention,
        InconclusiveReason.face_not_visible,
        TaskQuality(status=TaskStatus.ok),
    )
    tasks = [task(TaskName.rtn, 0.5), skipped(TaskName.imitation), no_face]
    result = combine(questionnaire(0.5), tasks, CFG)
    assert [c.name for c in result.components] == ["questionnaire", "rtn"]
    assert result.score == 50
    assert [(e.task, e.reason) for e in result.excluded_tasks] == [
        (TaskName.imitation, InconclusiveReason.skipped),
        (TaskName.joint_attention, InconclusiveReason.face_not_visible),
    ]
    assert len(result.tasks) == 3  # all kept for the doctor report


def test_tasks_count_without_a_questionnaire_score() -> None:
    result = combine(questionnaire(None), [task(TaskName.rtn, 0.25)], CFG)
    assert result.score == 25
    assert [c.name for c in result.components] == ["rtn"]


def test_nothing_scorable_gives_no_score_or_class() -> None:
    result = combine(questionnaire(None), [skipped(TaskName.rtn)], CFG)
    assert (result.score, result.score_class, result.risk_class) == (None, None, None)
    assert result.recommendations == ("recommendations.incomplete",)
    assert result.confidence is Confidence.low


def test_each_task_combines_once() -> None:
    with pytest.raises(ValueError, match="once"):
        combine(questionnaire(), [task(TaskName.rtn, 0), task(TaskName.rtn, 1)], CFG)


@pytest.mark.parametrize(
    ("q", "score", "risk_class"),
    [
        (0.0, 0, RiskClass.low),
        (0.20, 20, RiskClass.low),
        (0.21, 21, RiskClass.moderate),
        (0.45, 45, RiskClass.moderate),
        (0.46, 46, RiskClass.elevated),
        (0.70, 70, RiskClass.elevated),
        (0.71, 71, RiskClass.high),
        (1.0, 100, RiskClass.high),
        (0.205, 21, RiskClass.moderate),  # halves round up, despite 0.205 being 0.20499… in binary
        (0.2049, 20, RiskClass.low),
    ],
)
def test_class_boundaries(q: float, score: int, risk_class: RiskClass) -> None:
    result = combine(questionnaire(q), [], CFG)
    assert (result.score, result.score_class, result.risk_class) == (score, risk_class, risk_class)
    assert result.recommendations[0] == f"recommendations.class.{risk_class}"


# ── Red flags and floors (§6.3) ──────────────────────────────────────────────────────────────


def test_regression_raises_low_to_moderate() -> None:
    result = combine(questionnaire(0.1, regression=True), [], CFG)
    assert (result.score_class, result.risk_class) == (RiskClass.low, RiskClass.moderate)
    (floor,) = result.floors
    assert (floor.rule, floor.from_class, floor.to_class) == (
        "regression", RiskClass.low, RiskClass.moderate,
    )  # fmt: skip
    assert result.red_flags == ("regression",)
    assert "recommendations.regression" in result.recommendations


def test_regression_above_moderate_keeps_the_class_but_still_warns() -> None:
    result = combine(questionnaire(0.6, regression=True), [], CFG)
    assert result.risk_class is RiskClass.elevated
    assert result.floors == ()
    assert result.red_flags == ("regression",)
    assert result.recommendations == (
        "recommendations.class.elevated",
        "recommendations.regression",
    )


@pytest.mark.parametrize(
    ("failed", "risk_class"),
    [(("q01", "q03"), RiskClass.moderate), (("q01", "q03", "q08"), RiskClass.elevated)],
)
def test_three_failed_critical_items_raise_to_elevated(
    failed: tuple[str, ...], risk_class: RiskClass
) -> None:
    result = combine(questionnaire(0.3, failed=failed), [], CFG)
    assert result.risk_class is risk_class
    assert [f.rule for f in result.floors] == (["failed_critical"] if len(failed) == 3 else [])


def test_failed_critical_floor_never_lowers_a_high_class() -> None:
    result = combine(questionnaire(0.9, failed=("q01", "q03", "q04", "q08")), [], CFG)
    assert result.risk_class is RiskClass.high
    assert result.floors == ()


def test_both_floors_are_recorded_in_order() -> None:
    result = combine(questionnaire(0.0, regression=True, failed=("q01", "q03", "q08")), [], CFG)
    assert [(f.rule, f.from_class, f.to_class) for f in result.floors] == [
        ("regression", RiskClass.low, RiskClass.moderate),
        ("failed_critical", RiskClass.moderate, RiskClass.elevated),
    ]
    assert result.risk_class is RiskClass.elevated


@pytest.mark.parametrize(
    ("rtn_concern", "q01_failed", "hearing", "recommended"),
    [
        (0.75, False, None, True),
        (0.75, False, "no", True),
        (0.75, False, "yes_problem", True),
        (0.75, False, "not_sure", True),
        (0.75, False, "yes_normal", False),
        (0.5, False, None, False),
        (0.5, True, None, True),  # q01 failed
        (0.5, True, "yes_normal", False),
        (None, True, "other", True),  # no valid rtn task
    ],
)
def test_hearing_test_recommendation(
    rtn_concern: float | None, q01_failed: bool, hearing: str | None, recommended: bool
) -> None:
    items = (item("q01", 1.0 if q01_failed else 0.0, weight=2, critical=True),)
    q = questionnaire(0.2, hearing=hearing, items=items, failed=("q01",) if q01_failed else ())
    tasks = [] if rtn_concern is None else [task(TaskName.rtn, rtn_concern)]
    result = combine(q, tasks, CFG)
    assert ("recommendations.hearing_test" in result.recommendations) is recommended


def test_inconclusive_rtn_never_triggers_the_hearing_test() -> None:
    result = combine(questionnaire(0.2, hearing=None), [skipped(TaskName.rtn)], CFG)
    assert "recommendations.hearing_test" not in result.recommendations


# ── Confidence (§6.4, OPEN_QUESTIONS #6) ─────────────────────────────────────────────────────

ok, low = TaskStatus.ok, TaskStatus.low


@pytest.mark.parametrize(
    ("statuses", "low_coverage", "confidence"),
    [
        ((), False, Confidence.low),  # questionnaire only
        ((ok,), False, Confidence.medium),
        ((ok, ok), False, Confidence.medium),
        ((ok, ok, ok), False, Confidence.high),
        ((ok, ok, ok, low), False, Confidence.medium),  # one low task
        ((ok, ok, low), False, Confidence.medium),
        ((ok, low), False, Confidence.low),  # half the valid tasks are low
        ((low,), False, Confidence.low),
        ((ok, ok, ok), True, Confidence.medium),  # < 80% of items scorable: down one level
        ((ok,), True, Confidence.low),
        ((), True, Confidence.low),  # never below low
    ],
)
def test_confidence(
    statuses: tuple[TaskStatus, ...], low_coverage: bool, confidence: Confidence
) -> None:
    tasks = [task(name, 0.0, status) for name, status in zip(TaskName, statuses, strict=False)]
    result = combine(questionnaire(0.1, low_coverage=low_coverage), tasks, CFG)
    assert result.confidence is confidence


def test_inconclusive_tasks_do_not_count_toward_confidence() -> None:
    tasks = [task(TaskName.rtn, 0), task(TaskName.imitation, 0), skipped(TaskName.free_play)]
    assert combine(questionnaire(), tasks, CFG).confidence is Confidence.medium


# ── Findings (§6.5) ──────────────────────────────────────────────────────────────────────────


def test_top_concerns_rank_by_points_in_the_score() -> None:
    items = (
        item("q01", 1.0, weight=2, critical=True),  # 2 of the questionnaire's 6 weight
        item("q02", 0.5),
        item("q07", 1.0),
        item("q12", 0.0),
        item("q14", 1.0, weight=2),
    )
    tasks = [
        task(TaskName.rtn, 1.0, ok, finding(TaskName.rtn, "concern")),
        task(TaskName.free_play, 0.3, ok, finding(TaskName.free_play, "concern")),
    ]
    q = questionnaire(5.5 / 7, items=items)
    result = combine(q, tasks, CFG)
    # Shares: questionnaire 0.45/0.65, rtn 0.15/0.65, free_play 0.05/0.65.
    q_share = 0.45 / 0.65
    expected = {
        "rtn": 100 * 0.15 / 0.65,
        "q01": 100 * q_share * 2 / 7,
        "q14": 100 * q_share * 2 / 7,
    }
    assert [f.source for f in result.top_concerns] == ["rtn", "q01", "q14"]
    for f in result.top_concerns:
        assert f.points == pytest.approx(expected[f.source], abs=0.05)
        assert f.polarity == "concern"
    assert result.top_concerns[1].key == "findings.items.q01"
    assert result.top_concerns[1].params == {"option": "rarely"}


def test_strengths_prefer_critical_domains_and_skip_concern_items() -> None:
    items = (
        item("q02", 0.0),
        item("q15", 0.0, strength=False),  # "C" item: no repetitive movement is not a strength
        item("q03", 0.0, weight=2, critical=True),
        item("q07", 0.0),
    )
    tasks = [
        task(TaskName.gaze_preference, 0.0, ok, finding(TaskName.gaze_preference, "strength")),
        task(TaskName.imitation, 0.0, ok, finding(TaskName.imitation, "strength")),
    ]
    result = combine(questionnaire(0.0, items=items), tasks, CFG)
    # Critical first (q03 outweighs imitation here), then by weight in the score.
    assert [f.source for f in result.strengths] == ["q03", "imitation", "gaze_preference"]
    assert all(f.polarity == "strength" and f.points == 0 for f in result.strengths)
    assert result.top_concerns == ()


def test_a_strength_is_shown_whenever_one_exists() -> None:
    items = (item("q01", 1.0, weight=2, critical=True), item("q07", 0.0), item("q15", 1.0))
    result = combine(questionnaire(3 / 4, items=items), [], CFG)
    assert [f.source for f in result.strengths] == ["q07"]


def test_unanswered_and_unscored_items_give_no_findings() -> None:
    items = (item("q02", None), item("q20", None, weight=0))
    result = combine(questionnaire(0.0, items=items), [], CFG)
    assert (result.top_concerns, result.strengths) == ((), ())


# ── End to end on the synthetic sessions ─────────────────────────────────────────────────────


def answers(profile: str) -> dict[str, str]:
    concern_items = {"q15", "q16", "q17", "q18"}
    calm = {i.id: "rarely" if i.id in concern_items else "usually" for i in ITEMS}
    calm |= {"q13": "sentences", "q19": "no", "q20": "yes_normal"}
    if profile != "elevated":
        return calm
    worried = {i.id: "usually" if i.id in concern_items else "rarely" for i in ITEMS}
    return worried | {"q02": "sometimes", "q07": "usually", "q13": "single_words",
                      "q19": "no", "q20": "no"}  # fmt: skip


@pytest.mark.parametrize(
    ("profile", "risk_class", "confidence"),
    [
        ("typical", RiskClass.low, Confidence.high),
        ("elevated", RiskClass.high, Confidence.high),
        ("noisy", RiskClass.low, Confidence.low),  # every measurable task was low quality
    ],
)
def test_full_screening_per_profile(
    profile: str, risk_class: RiskClass, confidence: Confidence
) -> None:
    from tests.test_scoring_detectors import run

    tasks = [
        run(profile, t)  # type: ignore[arg-type]
        for t in ("rtn", "joint_attention", "imitation", "gaze_preference", "free_play")
    ]
    q = score_questionnaire(answers(profile), 36, ITEMS, CFG)
    result = combine(q, tasks, CFG)
    assert (result.risk_class, result.confidence) == (risk_class, confidence)
    assert result.strengths  # even the elevated child has something that went well
    if profile == "elevated":
        assert len(result.top_concerns) == 3
        assert "recommendations.hearing_test" in result.recommendations
        assert result.questionnaire.failed_critical == ("q01", "q03", "q04", "q08", "q10")
    # Stored as JSON and read back for the reports.
    assert type(result).model_validate_json(result.model_dump_json()) == result


def test_questionnaire_summary_keeps_every_item() -> None:
    q = score_questionnaire(answers("typical"), 36, ITEMS, CFG)
    result = combine(replace(q, low_coverage=True), [], CFG)
    assert len(result.questionnaire.items) == 20
    assert result.questionnaire.low_coverage
