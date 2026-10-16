"""Child IDs: `SJ-` + 5 Crockford base32 characters, e.g. SJ-7K3QX (COMPANION_SPEC §2).

Crockford's alphabet leaves out I, L, O and U, and its decoding rules read O as 0 and I/L as 1,
so a code copied by hand from a note or read aloud over the phone still matches.
Codes are random, never derived from the child's details.
"""

import re
import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Child

ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
PREFIX = "SJ-"
LENGTH = 5

_BN_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")
_LOOKALIKES = str.maketrans("OIL", "011")
_SEPARATORS = re.compile(r"[\s\-_.]")


def normalize_code(raw: str) -> str | None:
    """Anything a person might type for a Child ID → `SJ-XXXXX`, or None if it can't be one.

    Accepts lower case, Bangla digits, spaces/dashes, and the code with or without "SJ".
    """
    compact = _SEPARATORS.sub("", raw.translate(_BN_DIGITS)).upper()
    # Safe to strip unconditionally because no code body starts with "SJ" (see new_code).
    compact = compact.removeprefix("SJ").translate(_LOOKALIKES)
    if len(compact) != LENGTH or any(char not in ALPHABET for char in compact):
        return None
    return PREFIX + compact


def new_code(db: Session) -> str:
    """A random code no child has. 32⁵ ≈ 33.5 million codes, so a retry is rare."""
    while True:
        body = "".join(secrets.choice(ALPHABET) for _ in range(LENGTH))
        # A body starting with "SJ" would make a mistyped "SJ-123" look like a whole code.
        if body.startswith("SJ"):
            continue
        code = PREFIX + body
        if db.scalar(select(Child.id).where(Child.code == code)) is None:
            return code
