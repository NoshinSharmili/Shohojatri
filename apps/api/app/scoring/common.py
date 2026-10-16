"""Small rules every detector shares."""

from collections.abc import Sequence

from app.scoring.config import ScoringConfig
from app.scoring.inputs import Marker
from app.scoring.results import Polarity, TaskStatus


def valid_status(
    presence: float, cfg: ScoringConfig, *, calibration_fallback: bool = False
) -> TaskStatus:
    """A task with enough valid trials is still `low` when the child was poorly seen (§4.9)."""
    if calibration_fallback or presence < cfg.quality.low_presence_share:
        return TaskStatus.low
    return TaskStatus.ok


def polarity(concern: float) -> Polarity:
    return "strength" if concern == 0 else "concern"


def flagged(markers: Sequence[Marker]) -> set[int | str]:
    """Trials (numbers) and imitation actions the parent marked "Something went wrong"."""
    out: set[int | str] = set()
    for m in markers:
        if m.type != "something_wrong":
            continue
        if m.trial is not None:
            out.add(m.trial)
        if m.action is not None:
            out.add(m.action)
    return out


def pct(share: float) -> int:
    return round(share * 100)
