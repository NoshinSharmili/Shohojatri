"""Loads the screening questionnaire from app/seed/questionnaire.yaml.

The items are versioned content shipped with the code rather than rows in the database, so the
scoring engine, the API and the tests always read the same 20 items.
"""

from functools import lru_cache
from pathlib import Path
from typing import Self

import yaml
from pydantic import BaseModel, ConfigDict, model_validator

from app.scoring.items import Item

QUESTIONNAIRE_PATH = Path(__file__).parents[1] / "seed" / "questionnaire.yaml"


class Questionnaire(BaseModel):
    model_config = ConfigDict(frozen=True, extra="forbid")

    version: str
    items: tuple[Item, ...]

    @model_validator(mode="after")
    def _unique_ids(self) -> Self:
        ids = [item.id for item in self.items]
        if len(ids) != len(set(ids)):
            raise ValueError("questionnaire item ids must be unique")
        return self

    def item(self, item_id: str) -> Item | None:
        return next((item for item in self.items if item.id == item_id), None)

    def shown_at(self, age_months: int) -> tuple[Item, ...]:
        return tuple(item for item in self.items if item.shown_at(age_months))


@lru_cache
def load_questionnaire() -> Questionnaire:
    data = yaml.safe_load(QUESTIONNAIRE_PATH.read_text(encoding="utf-8"))
    return Questionnaire.model_validate(data)
