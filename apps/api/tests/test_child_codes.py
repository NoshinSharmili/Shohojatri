import re
from datetime import date

import pytest
from sqlalchemy.orm import Session

from app.core.child_codes import ALPHABET, new_code, normalize_code
from app.core.dates import age_in_months


@pytest.mark.parametrize(
    ("typed", "expected"),
    [
        ("SJ-7K3QX", "SJ-7K3QX"),
        ("sj-7k3qx", "SJ-7K3QX"),
        ("  SJ 7K3 QX ", "SJ-7K3QX"),
        ("SJ7K3QX", "SJ-7K3QX"),
        ("7K3QX", "SJ-7K3QX"),
        # Crockford: O reads as 0, I and L as 1.
        ("SJ-OIL23", "SJ-01123"),
        # Bangla digits seven and three, as a parent's phone keyboard might type them.
        ("SJ-\u09edK\u09e9QX", "SJ-7K3QX"),
    ],
)
def test_normalize_code_accepts_what_people_type(typed: str, expected: str) -> None:
    assert normalize_code(typed) == expected


@pytest.mark.parametrize(
    "typed", ["", "SJ-7K3Q", "SJ-7K3QXY", "SJ-7K3QU", "XY-7K3QX", "SJ-7K!QX", "SJ-123"]
)
def test_normalize_code_rejects_impossible_codes(typed: str) -> None:
    assert normalize_code(typed) is None


def test_alphabet_is_crockford_base32() -> None:
    assert len(ALPHABET) == 32
    assert not set("ILOU") & set(ALPHABET)


def test_new_codes_are_well_formed_and_distinct(db: Session) -> None:
    codes = {new_code(db) for _ in range(200)}
    assert all(re.fullmatch(r"SJ-[0-9A-HJKMNP-TV-Z]{5}", code) for code in codes)
    assert not any(code.startswith("SJ-SJ") for code in codes)
    # Random, so a rare repeat is fine here: uniqueness is checked against the DB.
    assert len(codes) > 190


@pytest.mark.parametrize(
    ("dob", "today", "months"),
    [
        (date(2023, 12, 15), date(2024, 2, 14), 1),
        (date(2023, 12, 15), date(2024, 2, 15), 2),
        (date(2023, 1, 31), date(2023, 2, 28), 0),
        (date(2022, 8, 5), date(2025, 10, 16), 38),
        (date(2025, 10, 20), date(2025, 10, 16), 0),
    ],
)
def test_age_in_completed_months(dob: date, today: date, months: int) -> None:
    assert age_in_months(dob, today) == months
