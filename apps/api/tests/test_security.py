import pytest

from app.core.security import (
    decode_token,
    generate_temporary_password,
    hash_password,
    issue_access_token,
    issue_refresh_token,
    normalize_phone,
    parse_identifier,
    password_is_acceptable,
    verify_password,
)


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("01712345678", "+8801712345678"),
        ("+8801712345678", "+8801712345678"),
        ("8801712345678", "+8801712345678"),
        ("01712-345678", "+8801712345678"),
        ("(017) 1234 5678", "+8801712345678"),
        ("০১৭১২৩৪৫৬৭৮", "+8801712345678"),
        ("01212345678", None),  # 012 isn't a mobile prefix
        ("0171234567", None),  # too short
        ("+15551234567", None),
        ("", None),
    ],
)
def test_normalize_phone(raw: str, expected: str | None) -> None:
    assert normalize_phone(raw) == expected


def test_parse_identifier() -> None:
    assert parse_identifier("A@B.bd") == parse_identifier("a@b.bd")
    email = parse_identifier("A@B.bd")
    assert email is not None and email.kind == "email" and email.value == "a@b.bd"
    phone = parse_identifier("01812345678")
    assert phone is not None and phone.kind == "phone"
    assert parse_identifier("a@b") is None
    assert parse_identifier("hello") is None


@pytest.mark.parametrize(
    ("password", "ok"),
    [("demo1234", True), ("abcdefg1", True), ("abc1", False), ("abcdefgh", False)],
)
def test_password_rules(password: str, ok: bool) -> None:
    assert password_is_acceptable(password) is ok


def test_hash_roundtrip() -> None:
    hashed = hash_password("demo1234")
    assert hashed.startswith("$argon2")
    assert verify_password(hashed, "demo1234")
    assert not verify_password(hashed, "demo12345")
    assert not verify_password("not-a-hash", "demo1234")


def test_temporary_passwords_are_valid_and_unambiguous() -> None:
    passwords = {generate_temporary_password() for _ in range(50)}
    assert len(passwords) == 50
    for password in passwords:
        assert password_is_acceptable(password)
        assert not set(password) & set("0O1lI")


def test_tokens_carry_their_type() -> None:
    access = issue_access_token(7)
    refresh = issue_refresh_token(7)
    claims = decode_token(access.token, "access")
    assert claims is not None and claims.user_id == 7
    assert decode_token(access.token, "refresh") is None
    assert decode_token(refresh.token, "access") is None
    assert decode_token(refresh.token, "refresh") is not None
