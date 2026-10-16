"""Questionnaire item definitions (SCREENING_SPEC §3.1-§3.2). The items themselves live in
app/seed/questionnaire.yaml."""

from enum import StrEnum
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

OTHER = "other"
NOT_SURE = "not_sure"


class ItemType(StrEnum):
    freq = "freq"
    communication = "communication"  # q13
    regression = "regression"  # q19
    hearing = "hearing"  # q20


class Direction(StrEnum):
    positive = "positive"  # "P": concern when the behaviour is absent
    concern = "concern"  # "C": concern when the behaviour is present


# The answer cards per item type, in display order. "Other (write it)" is offered on every item.
OPTIONS: dict[ItemType, tuple[str, ...]] = {
    ItemType.freq: ("usually", "sometimes", "rarely", NOT_SURE),
    ItemType.communication: ("sentences", "single_words", "sounds_gestures", "little"),
    ItemType.regression: ("no", "yes", NOT_SURE),
    ItemType.hearing: ("yes_normal", "yes_problem", "no", NOT_SURE),
}


class Item(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    id: str
    domain: str
    type: ItemType
    direction: Direction | None = None
    critical: bool = False
    weight: float = Field(ge=0)
    min_age: int = Field(ge=0)
    text_en: str
    text_bn: str

    @model_validator(mode="after")
    def _direction_only_for_freq(self) -> Self:
        if (self.type is ItemType.freq) != (self.direction is not None):
            raise ValueError(f"{self.id}: direction is required for freq items, and only for them")
        return self

    @property
    def options(self) -> tuple[str, ...]:
        return OPTIONS[self.type]

    @property
    def scored(self) -> bool:
        return self.weight > 0

    @property
    def maps_other(self) -> bool:
        """Whether an "Other" answer is mapped onto an option (§3.3). Unscored items (q20) keep
        the text verbatim for the doctor report instead (OPEN_QUESTIONS #5)."""
        return self.scored

    def shown_at(self, age_months: int) -> bool:
        return age_months >= self.min_age

    def accepts(self, option: str) -> bool:
        """Options that may be stored. not_sure is also the fallback when an "Other" answer
        can't be matched to an option (§3.3), so mapped items accept it even where it is not
        one of the cards (q13)."""
        return option in self.options or option == OTHER or (self.maps_other and option == NOT_SURE)
