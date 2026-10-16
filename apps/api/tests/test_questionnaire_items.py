"""The seeded items match SCREENING_SPEC §3.2 (transcribed by hand from the spec table)."""

import re

from app.core.questionnaire import load_questionnaire
from app.scoring.items import Direction, ItemType

P, C = Direction.positive, Direction.concern
# id: (domain, type, direction, critical, weight, min_age)
SPEC = {
    "q01": ("response_to_name", ItemType.freq, P, True, 2, 12),
    "q02": ("eye_contact", ItemType.freq, P, False, 1, 12),
    "q03": ("joint_attention", ItemType.freq, P, True, 2, 12),
    "q04": ("joint_attention", ItemType.freq, P, True, 2, 14),
    "q05": ("requesting", ItemType.freq, P, False, 1, 14),
    "q06": ("sharing", ItemType.freq, P, False, 1, 14),
    "q07": ("social_smile", ItemType.freq, P, False, 1, 12),
    "q08": ("imitation", ItemType.freq, P, True, 2, 12),
    "q09": ("pretend_play", ItemType.freq, P, False, 1, 20),
    "q10": ("peer_interest", ItemType.freq, P, True, 2, 14),
    "q11": ("showing_off", ItemType.freq, P, False, 1, 16),
    "q12": ("understanding", ItemType.freq, P, False, 1, 18),
    "q13": ("language", ItemType.communication, None, False, 1.5, 12),
    "q14": ("social_referencing", ItemType.freq, P, False, 1, 14),
    "q15": ("repetitive_movement", ItemType.freq, C, False, 1, 12),
    "q16": ("repetitive_play", ItemType.freq, C, False, 1, 16),
    "q17": ("sensory_sound", ItemType.freq, C, False, 1, 12),
    "q18": ("sensory_other", ItemType.freq, C, False, 1, 12),
    "q19": ("regression", ItemType.regression, None, False, 2, 12),
    "q20": ("hearing", ItemType.hearing, None, False, 0, 12),
}
BANGLA = re.compile(r"[ঀ-৿]")


def test_items_match_the_spec_table() -> None:
    items = load_questionnaire().items
    assert [item.id for item in items] == list(SPEC)
    for item in items:
        assert (
            item.domain,
            item.type,
            item.direction,
            item.critical,
            item.weight,
            item.min_age,
        ) == SPEC[item.id], item.id


def test_every_item_has_both_languages() -> None:
    for item in load_questionnaire().items:
        assert item.text_en.endswith("?"), item.id
        assert BANGLA.search(item.text_bn), item.id
        assert not BANGLA.search(item.text_en), item.id


def test_answer_options_per_type() -> None:
    q = load_questionnaire()
    assert q.item("q01").options == ("usually", "sometimes", "rarely", "not_sure")
    assert q.item("q13").options == ("sentences", "single_words", "sounds_gestures", "little")
    assert q.item("q19").options == ("no", "yes", "not_sure")
    assert q.item("q20").options == ("yes_normal", "yes_problem", "no", "not_sure")
    # q20 isn't scored, so its "Other" text is kept verbatim instead of being mapped.
    assert [item.id for item in q.items if not item.maps_other] == ["q20"]
