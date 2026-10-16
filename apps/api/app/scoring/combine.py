"""Combining the questionnaire and the tasks into one result (SCREENING_SPEC §6)."""

import math
from collections.abc import Sequence
from dataclasses import dataclass
from typing import Literal

from app.scoring.config import ScoringConfig
from app.scoring.names import RiskClass, TaskName
from app.scoring.questionnaire import QuestionnaireResult
from app.scoring.results import (
    Component,
    Confidence,
    ExcludedTask,
    Finding,
    Floor,
    ItemResult,
    Polarity,
    QuestionnaireSummary,
    RiskResult,
    TaskResult,
    TaskStatus,
)

CONFIDENCE_ORDER = (Confidence.low, Confidence.medium, Confidence.high)
ComponentName = Literal["questionnaire"] | TaskName


def combine(
    questionnaire: QuestionnaireResult, tasks: Sequence[TaskResult], cfg: ScoringConfig
) -> RiskResult:
    names = [t.task for t in tasks]
    if len(names) != len(set(names)):
        raise ValueError("each task can be combined once")
    valid = [t for t in tasks if t.valid and t.concern is not None]

    components = _components(questionnaire, valid, cfg)
    score = _round_half_up(sum(c.points for c in components)) if components else None
    score_class = None if score is None else cfg.risk_class(score)
    risk_class, floors = _apply_floors(score_class, questionnaire, cfg)

    return RiskResult(
        scoring_version=cfg.scoring_version,
        score=score,
        score_class=score_class,
        risk_class=risk_class,
        floors=floors,
        red_flags=("regression",) if questionnaire.regression else (),
        recommendations=_recommendations(risk_class, questionnaire, valid, cfg),
        confidence=_confidence(questionnaire, tasks, cfg),
        components=components,
        excluded_tasks=tuple(
            ExcludedTask(task=t.task, reason=t.quality.reason) for t in tasks if not t.valid
        ),
        questionnaire=_summary(questionnaire),
        tasks=tuple(tasks),
        **_findings(questionnaire, valid, components, cfg),
    )


def _components(
    q: QuestionnaireResult, valid: list[TaskResult], cfg: ScoringConfig
) -> tuple[Component, ...]:
    """Weights renormalised over the questionnaire (when scorable) and the valid tasks."""
    parts: list[tuple[ComponentName, float]] = []
    if q.score is not None:
        parts.append(("questionnaire", q.score))
    parts += [(t.task, t.concern) for t in valid if t.concern is not None]
    total = sum(cfg.weights[name] for name, _ in parts)
    return tuple(
        Component(
            name=name,
            weight=(weight := cfg.weights[name]),
            share=weight / total,
            concern=concern,
            points=100 * weight / total * concern,
        )
        for name, concern in parts
    )


def _round_half_up(value: float) -> int:
    # Round first so float noise (20.499999999) doesn't move a class boundary.
    return math.floor(round(value, 6) + 0.5)


def _apply_floors(
    score_class: RiskClass | None, q: QuestionnaireResult, cfg: ScoringConfig
) -> tuple[RiskClass | None, tuple[Floor, ...]]:
    if score_class is None:
        return None, ()
    rules: list[tuple[Literal["regression", "failed_critical"], RiskClass]] = []
    if q.regression:
        rules.append(("regression", cfg.floors.regression))
    if len(q.failed_critical) >= cfg.floors.failed_critical.min_items:
        rules.append(("failed_critical", cfg.floors.failed_critical.at_least))
    current, floors = score_class, []
    for rule, at_least in rules:
        if at_least.rank > current.rank:
            floors.append(Floor(rule=rule, from_class=current, to_class=at_least))
            current = at_least
    return current, tuple(floors)


def _recommendations(
    risk_class: RiskClass | None,
    q: QuestionnaireResult,
    valid: list[TaskResult],
    cfg: ScoringConfig,
) -> tuple[str, ...]:
    out = [
        "recommendations.incomplete"
        if risk_class is None
        else f"recommendations.class.{risk_class}"
    ]
    if q.regression:
        out.append("recommendations.regression")
    h = cfg.hearing_test
    rtn = next((t for t in valid if t.task is TaskName.rtn), None)
    weak_response = (rtn is not None and (rtn.concern or 0) >= h.rtn_concern) or any(
        s.item_id == h.item and s.failed for s in q.items
    )
    if weak_response and q.hearing != h.normal_answer:
        out.append("recommendations.hearing_test")
    return tuple(out)


def _confidence(
    q: QuestionnaireResult, tasks: Sequence[TaskResult], cfg: ScoringConfig
) -> Confidence:
    """OPEN_QUESTIONS #6: a base level from the valid tasks, one lower when fewer than 80% of
    the questionnaire's eligible items have a scorable answer."""
    valid = [t for t in tasks if t.valid]
    low = sum(t.status is TaskStatus.low for t in valid)
    if len(valid) >= cfg.confidence.high_min_tasks and low == 0:
        level = Confidence.high
    elif valid and low < len(valid) / 2:
        level = Confidence.medium
    else:
        level = Confidence.low
    if q.low_coverage:
        level = CONFIDENCE_ORDER[max(0, CONFIDENCE_ORDER.index(level) - 1)]
    return level


@dataclass(frozen=True)
class _Candidate:
    finding: Finding
    critical: bool
    weight: float  # points the source would carry at full concern


def _findings(
    q: QuestionnaireResult,
    valid: list[TaskResult],
    components: tuple[Component, ...],
    cfg: ScoringConfig,
) -> dict[str, tuple[Finding, ...]]:
    """§6.5: the top concerns by their points in the score, and up to three strengths,
    critical domains first."""
    share = {c.name: c.share for c in components}
    candidates: list[_Candidate] = []
    for task in valid:
        weight = 100 * share[task.task]
        critical = task.task in cfg.findings.critical_tasks
        for f in task.findings:
            points = weight * (task.concern or 0) if f.polarity == "concern" else 0.0
            ranked = f.model_copy(update={"points": round(points, 1)})
            candidates.append(_Candidate(ranked, critical, weight))

    if q.score is not None:
        counted = sum(s.weight for s in q.items if s.concern is not None and s.weight > 0)
        for s in q.items:
            if s.concern is None or s.weight == 0:
                continue
            weight = 100 * share["questionnaire"] * s.weight / counted
            polarity: Polarity
            if s.concern > 0:
                polarity = "concern"
            elif s.can_be_strength:
                polarity = "strength"
            else:
                continue
            finding = Finding(
                key=f"findings.items.{s.item_id}",
                params={"option": s.option},
                polarity=polarity,
                source=s.item_id,
                points=round(weight * s.concern, 1),
            )
            candidates.append(_Candidate(finding, s.critical, weight))

    concerns = sorted(
        (c for c in candidates if c.finding.polarity == "concern"),
        key=lambda c: -(c.finding.points or 0),
    )
    strengths = sorted(
        (c for c in candidates if c.finding.polarity == "strength"),
        key=lambda c: (not c.critical, -c.weight),
    )
    return {
        "top_concerns": tuple(c.finding for c in concerns[: cfg.findings.max_concerns]),
        "strengths": tuple(c.finding for c in strengths[: cfg.findings.max_strengths]),
    }


def _summary(q: QuestionnaireResult) -> QuestionnaireSummary:
    return QuestionnaireSummary(
        score=q.score,
        eligible=q.eligible,
        scorable=q.scorable,
        low_coverage=q.low_coverage,
        failed_critical=q.failed_critical,
        regression=q.regression,
        hearing=q.hearing,
        items=tuple(
            ItemResult(
                item_id=s.item_id,
                option=s.option,
                concern=s.concern,
                weight=s.weight,
                critical=s.critical,
                failed=s.failed,
            )
            for s in q.items
        ),
    )
