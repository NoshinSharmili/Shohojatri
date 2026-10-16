"""Screening rules and access shared by the screening and report routers (SCREENING_SPEC §2-§3,
§10)."""

from collections.abc import Callable
from dataclasses import dataclass
from typing import Annotated, Literal

from fastapi import Depends

from app.core.deps import CurrentUser, DbSession
from app.core.errors import ApiError
from app.core.permissions import ChildAccess, Need, authorize
from app.core.questionnaire import load_questionnaire
from app.models import Screening, ScreeningAnswer, ScreeningStatus
from app.scoring.config import Eligibility
from app.scoring.items import OTHER, Item

# Consent texts the web app may show. The text lives in apps/web/messages (screening.consent);
# when it changes, the web bumps its version and the new version is added here. Older versions
# stay accepted only while a deployed web build can still show them.
CONSENT_VERSIONS = frozenset({"screening-consent-1"})


def age_notice(age_months: int, eligibility: Eligibility) -> Literal["younger", "older"] | None:
    if age_months < eligibility.designed_min_age:
        return "younger"
    if age_months > eligibility.designed_max_age:
        return "older"
    return None


def is_final(item: Item, answer: ScreeningAnswer) -> bool:
    """An "Other" answer counts once the parent confirmed a card, except on unmapped items."""
    return answer.option != OTHER or not item.maps_other


def shown_items(screening: Screening) -> tuple[Item, ...]:
    return load_questionnaire().shown_at(screening.age_months)


def first_unanswered(screening: Screening) -> Item | None:
    answers = {answer.item_id: answer for answer in screening.answers}
    for item in shown_items(screening):
        answer = answers.get(item.id)
        if answer is None or not is_final(item, answer):
            return item
    return None


def progress(screening: Screening) -> tuple[int, int]:
    """(items with a final answer, items shown at this age)."""
    items = shown_items(screening)
    by_id = {item.id: item for item in items}
    answered = sum(
        1 for a in screening.answers if a.item_id in by_id and is_final(by_id[a.item_id], a)
    )
    return answered, len(items)


@dataclass(frozen=True)
class ScreeningAccess:
    screening: Screening
    access: ChildAccess


def _screening_access(need: Need) -> Callable[..., ScreeningAccess]:
    """Like `require_child_access`, for routes keyed by a screening id."""

    def dependency(screening_id: int, user: CurrentUser, db: DbSession) -> ScreeningAccess:
        screening = db.get(Screening, screening_id)
        if screening is None:
            raise ApiError(404, "not_found")
        return ScreeningAccess(screening, authorize(db, user, screening.child_id, need))

    return dependency


ScreeningReader = Annotated[ScreeningAccess, Depends(_screening_access(Need.read_screenings))]
ScreeningWriter = Annotated[ScreeningAccess, Depends(_screening_access(Need.write_screenings))]


def require_in_progress(screening: Screening) -> None:
    if screening.status is not ScreeningStatus.in_progress:
        raise ApiError(409, "screening_finalized")


def require_editable(screening: Screening) -> None:
    require_in_progress(screening)
    if screening.consent_at is None:
        raise ApiError(409, "consent_required")


def require_finalized(screening: Screening) -> None:
    """Results, reports and share links exist only once the screening is finalized."""
    if screening.status is not ScreeningStatus.finalized:
        raise ApiError(409, "screening_not_finalized")
