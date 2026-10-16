"""Part 1 score (SCREENING_SPEC §3.1-§3.5). Pure: no I/O, no database."""

from collections.abc import Mapping, Sequence
from dataclasses import dataclass

from app.scoring.config import ScoringConfig
from app.scoring.items import Direction, Item, ItemType


@dataclass(frozen=True)
class ItemScore:
    item_id: str
    option: str | None  # None when unanswered
    concern: float | None  # 0-1; None when excluded (not_sure, unconfirmed "other", unscored)
    weight: float
    critical: bool
    failed: bool  # critical item with concern 1
    # A behaviour whose presence is a strength (P items, q13). "C" items and q19 describe
    # concerns, so their absence is not reported as a strength (§6.5).
    can_be_strength: bool


@dataclass(frozen=True)
class QuestionnaireResult:
    score: float | None  # Q in 0-1; None when no answer is scorable
    eligible: int  # scored items shown at this age
    scorable: int  # of those, answered with a scorable option
    low_coverage: bool  # scorable share below the threshold → confidence drops a level
    failed_critical: tuple[str, ...]
    regression: bool  # q19 "yes": red flag (§6.3)
    hearing: str | None  # q20 answer as given, for the hearing-test recommendation
    items: tuple[ItemScore, ...]  # every item shown at this age, in order


def item_concern(item: Item, option: str, age_months: int, cfg: ScoringConfig) -> float | None:
    """Concern 0-1 for one answer, or None when the answer doesn't count."""
    if not item.accepts(option):
        raise ValueError(f"{item.id}: unknown option {option!r}")
    if not item.scored:
        return None
    q = cfg.questionnaire
    match item.type:
        case ItemType.freq:
            assert item.direction is not None
            table = q.freq_concern[item.direction]
        case ItemType.communication:
            table = q.communication_band(age_months).concern
        case ItemType.regression:
            table = q.regression_concern
        case ItemType.hearing:
            return None
    # not_sure and an unconfirmed "other" are in no table: excluded, not counted as concern.
    return table.get(option)


def score_questionnaire(
    answers: Mapping[str, str],
    age_months: int,
    items: Sequence[Item],
    cfg: ScoringConfig,
) -> QuestionnaireResult:
    """`answers` maps item id → stored option. Q = Σ wᵢ·cᵢ / Σ wᵢ over scorable answers to items
    shown at this age (§3.5). Answers to items not shown at this age are ignored."""
    scores: list[ItemScore] = []
    for item in items:
        if not item.shown_at(age_months):
            continue
        option = answers.get(item.id)
        concern = None if option is None else item_concern(item, option, age_months, cfg)
        scores.append(
            ItemScore(
                item_id=item.id,
                option=option,
                concern=concern,
                weight=item.weight,
                critical=item.critical,
                failed=item.critical and concern == 1,
                can_be_strength=item.type is ItemType.communication
                or item.direction is Direction.positive,
            )
        )

    eligible = sum(1 for item in items if item.shown_at(age_months) and item.scored)
    counted = [(s.weight, s.concern) for s in scores if s.concern is not None and s.weight > 0]
    total_weight = sum(weight for weight, _ in counted)
    score = sum(w * c for w, c in counted) / total_weight if counted else None
    share = len(counted) / eligible if eligible else 0.0
    by_type = {item.id: item.type for item in items}

    return QuestionnaireResult(
        score=score,
        eligible=eligible,
        scorable=len(counted),
        low_coverage=share < cfg.questionnaire.min_scorable_share,
        failed_critical=tuple(s.item_id for s in scores if s.failed),
        regression=any(
            by_type[s.item_id] is ItemType.regression and s.concern == 1 for s in scores
        ),
        hearing=next((s.option for s in scores if by_type[s.item_id] is ItemType.hearing), None),
        items=tuple(scores),
    )
