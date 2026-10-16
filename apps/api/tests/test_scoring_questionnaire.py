"""score_questionnaire (SCREENING_SPEC §3.1-§3.5) on the real items and config."""

from pathlib import Path

import pytest
from pydantic import ValidationError

from app.core.questionnaire import load_questionnaire
from app.scoring.config import CONFIG_PATH, load_config, parse_config
from app.scoring.questionnaire import score_questionnaire

ITEMS = load_questionnaire().items
CFG = load_config()
WEIGHTS = {item.id: item.weight for item in ITEMS}
CRITICAL = ("q01", "q03", "q04", "q08", "q10")
CONCERN_ITEMS = ("q15", "q16", "q17", "q18")  # "C": concern when the behaviour is present


def no_concern_answers() -> dict[str, str]:
    """The answer to every item that carries no concern."""
    answers = {item.id: "usually" for item in ITEMS}
    answers |= dict.fromkeys(CONCERN_ITEMS, "rarely")
    return answers | {"q13": "sentences", "q19": "no", "q20": "yes_normal"}


def full_concern_answers() -> dict[str, str]:
    answers = {item.id: "rarely" for item in ITEMS}
    answers |= dict.fromkeys(CONCERN_ITEMS, "usually")
    return answers | {"q13": "little", "q19": "yes", "q20": "no"}


def score(answers: dict[str, str], age: int = 36):
    return score_questionnaire(answers, age, ITEMS, CFG)


def test_no_concern_scores_zero_with_full_coverage() -> None:
    result = score(no_concern_answers())
    assert result.score == 0
    assert (result.eligible, result.scorable) == (19, 19)  # q20 is shown but never scored
    assert not result.low_coverage
    assert result.failed_critical == ()
    assert not result.regression
    assert result.hearing == "yes_normal"
    assert len(result.items) == 20


def test_full_concern_scores_one_and_fails_every_critical_item() -> None:
    result = score(full_concern_answers())
    assert result.score == 1
    assert result.failed_critical == CRITICAL
    assert result.regression


def test_score_is_the_weighted_mean_of_scorable_answers() -> None:
    answers = dict.fromkeys(WEIGHTS, "not_sure") | {
        "q01": "rarely",  # critical P item, w 2, concern 1
        "q02": "sometimes",  # w 1, concern 0.5
        "q15": "usually",  # C item, w 1, concern 1
        "q13": "single_words",  # w 1.5, concern 0.5 at 36 months
    }
    result = score(answers)
    assert result.score == pytest.approx((2 * 1 + 1 * 0.5 + 1 * 1 + 1.5 * 0.5) / (2 + 1 + 1 + 1.5))
    assert result.scorable == 4


@pytest.mark.parametrize(
    ("age", "eligible", "shown"),
    [
        (12, 10, 11),
        (13, 10, 11),
        (14, 15, 16),  # q04 q05 q06 q10 q14
        (16, 17, 18),  # q11 q16
        (18, 18, 19),  # q12
        (19, 18, 19),
        (20, 19, 20),  # q09
        (72, 19, 20),
    ],
)
def test_items_count_from_their_min_age(age: int, eligible: int, shown: int) -> None:
    result = score({}, age)
    assert (result.eligible, len(result.items)) == (eligible, shown)


def test_answers_to_items_above_the_childs_age_are_ignored() -> None:
    answers = no_concern_answers() | {"q09": "rarely"}  # q09 starts at 20 months
    result = score(answers, age=18)
    assert result.score == 0
    assert "q09" not in {s.item_id for s in result.items}


def test_not_sure_is_excluded_not_counted_as_concern() -> None:
    answers = no_concern_answers() | {"q01": "not_sure", "q02": "rarely"}
    result = score(answers)
    q01 = next(s for s in result.items if s.item_id == "q01")
    assert q01.concern is None and not q01.failed
    assert result.scorable == 18
    # q01's weight is out of the denominator too.
    assert result.score == pytest.approx(1 / (sum(WEIGHTS.values()) - WEIGHTS["q01"]))


def test_unconfirmed_other_and_unanswered_items_are_excluded() -> None:
    answers = no_concern_answers() | {"q02": "other"}
    del answers["q03"]
    result = score(answers)
    assert result.scorable == 17
    by_id = {s.item_id: s for s in result.items}
    assert by_id["q02"].concern is None
    assert by_id["q03"].option is None and by_id["q03"].concern is None


@pytest.mark.parametrize(
    ("age", "option", "concern"),
    [
        (12, "sentences", 0),
        (12, "single_words", 0),
        (17, "sounds_gestures", 0.25),
        (17, "little", 1),
        (18, "sounds_gestures", 0.5),
        (23, "single_words", 0),
        (23, "sounds_gestures", 0.5),
        (24, "single_words", 0.25),
        (24, "sounds_gestures", 0.75),
        (29, "single_words", 0.25),
        (30, "single_words", 0.5),
        (30, "sounds_gestures", 1),
        (48, "sentences", 0),
        (48, "little", 1),
    ],
)
def test_q13_concern_follows_the_age_table(age: int, option: str, concern: float) -> None:
    result = score({"q13": option}, age)
    q13 = next(s for s in result.items if s.item_id == "q13")
    assert q13.concern == concern
    assert result.score == concern  # the only scorable answer


def test_q13_not_sure_fallback_is_excluded() -> None:
    # Stored when the parent's own words couldn't be matched to a card (§3.3).
    result = score({"q13": "not_sure"})
    assert result.score is None


@pytest.mark.parametrize(
    ("item_id", "option", "failed"),
    [
        ("q01", "rarely", True),
        ("q01", "sometimes", False),
        ("q01", "usually", False),
        ("q08", "rarely", True),
        ("q10", "not_sure", False),
        ("q02", "rarely", False),  # not critical
        ("q15", "usually", False),  # concern 1, but not critical
    ],
)
def test_critical_item_fails_only_at_full_concern(item_id: str, option: str, failed: bool) -> None:
    result = score(no_concern_answers() | {item_id: option})
    assert (item_id in result.failed_critical) is failed


def test_concern_items_count_when_the_behaviour_is_present() -> None:
    assert score({"q15": "usually"}).score == 1
    assert score({"q15": "sometimes"}).score == 0.5
    assert score({"q15": "rarely"}).score == 0


@pytest.mark.parametrize(
    ("option", "regression"), [("yes", True), ("no", False), ("not_sure", False)]
)
def test_q19_regression_is_a_red_flag(option: str, regression: bool) -> None:
    result = score(no_concern_answers() | {"q19": option})
    assert result.regression is regression
    assert "q19" not in result.failed_critical


@pytest.mark.parametrize("option", ["yes_normal", "yes_problem", "no", "not_sure", "other"])
def test_q20_hearing_is_reported_but_never_scored(option: str) -> None:
    result = score(no_concern_answers() | {"q20": option})
    assert result.hearing == option
    assert result.score == 0
    assert next(s for s in result.items if s.item_id == "q20").concern is None


def test_coverage_below_80_percent_is_flagged() -> None:
    # At 12 months 10 items are scored: 8 scorable answers is exactly 80%.
    shown = [s.item_id for s in score({}, 12).items if WEIGHTS[s.item_id] > 0]
    assert len(shown) == 10
    calm = no_concern_answers()
    eight = {item_id: calm[item_id] for item_id in shown[:8]}
    assert not score(eight, 12).low_coverage
    seven = {item_id: calm[item_id] for item_id in shown[:7]}
    assert score(seven, 12).low_coverage


def test_nothing_scorable_gives_no_score() -> None:
    result = score(dict.fromkeys(WEIGHTS, "not_sure"))
    assert result.score is None
    assert result.scorable == 0
    assert result.low_coverage


def test_unknown_option_is_a_programming_error() -> None:
    with pytest.raises(ValueError, match="q01"):
        score({"q01": "sentences"})


def test_config_rejects_bands_that_leave_young_ages_uncovered(tmp_path: Path) -> None:
    text = CONFIG_PATH.read_text(encoding="utf-8").replace("{ min_age: 0,", "{ min_age: 6,")
    bad = tmp_path / "config.yaml"
    bad.write_text(text, encoding="utf-8")
    with pytest.raises(ValidationError):
        parse_config(bad)


def test_yes_and_no_keys_stay_strings() -> None:
    # YAML 1.1 reads bare yes/no as booleans; the config quotes them.
    assert CFG.questionnaire.regression_concern == {"no": 0, "yes": 1}
