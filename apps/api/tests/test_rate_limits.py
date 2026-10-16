"""Abuse protection on the public demo: login and sign-up rate limits (docs/DEPLOY.md)."""

from datetime import timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import RateLimitHit, Role
from app.models.base import utcnow
from tests.conftest import PASSWORD, MakeUser

LOGIN = "/api/v1/auth/login"


def login(client: TestClient, identifier: str, password: str = PASSWORD) -> int:
    response = client.post(LOGIN, json={"identifier": identifier, "password": password})
    return response.status_code


def signup(client: TestClient, n: int) -> int:
    body = {
        "role": "parent",
        "name": "Signup test",
        "email": f"new{n}@test.bd",
        "password": "goodpass1",
    }
    return client.post("/api/v1/auth/signup", json=body).status_code


@pytest.fixture
def limits(monkeypatch: pytest.MonkeyPatch) -> None:
    settings = get_settings()
    monkeypatch.setattr(settings, "login_attempts_per_ip", 5)
    monkeypatch.setattr(settings, "login_failures_per_account", 3)
    monkeypatch.setattr(settings, "signups_per_ip", 2)


@pytest.mark.usefixtures("limits")
def test_wrong_passwords_lock_the_account_for_a_while(
    client: TestClient, make_user: MakeUser
) -> None:
    make_user(Role.parent)
    assert [login(client, "parent@test.bd", "wrongpass1") for _ in range(3)] == [401] * 3
    # Even the right password waits now, so guessing can't continue.
    response = client.post(LOGIN, json={"identifier": "parent@test.bd", "password": PASSWORD})
    assert response.status_code == 429
    assert response.json()["error"]["code"] == "rate_limited"
    assert 0 < response.json()["error"]["detail"]["retry_after"] <= 15 * 60


@pytest.mark.usefixtures("limits")
def test_successful_logins_to_the_shared_demo_account_are_not_failures(
    client: TestClient, make_user: MakeUser, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Everyone at a pitch logs into parent@demo.bd; only the per-IP limit applies to them.
    monkeypatch.setattr(get_settings(), "login_attempts_per_ip", 0)
    make_user(Role.parent)
    assert [login(client, "parent@test.bd") for _ in range(6)] == [200] * 6


@pytest.mark.usefixtures("limits")
def test_failures_on_another_account_do_not_count(client: TestClient, make_user: MakeUser) -> None:
    make_user(Role.parent)
    for _ in range(3):
        login(client, "someone-else@test.bd", "wrongpass1")
    assert login(client, "parent@test.bd") == 200


@pytest.mark.usefixtures("limits")
def test_per_ip_limit_counts_every_attempt(client: TestClient, make_user: MakeUser) -> None:
    make_user(Role.parent)
    assert [login(client, "parent@test.bd") for _ in range(5)] == [200] * 5
    assert login(client, "parent@test.bd") == 429


@pytest.mark.usefixtures("limits")
def test_old_attempts_fall_out_of_the_window(
    client: TestClient, make_user: MakeUser, db: Session
) -> None:
    make_user(Role.parent)
    for _ in range(3):
        login(client, "parent@test.bd", "wrongpass1")
    for hit in db.scalars(select(RateLimitHit)):
        hit.at = utcnow() - timedelta(minutes=16)
    db.commit()
    assert login(client, "parent@test.bd") == 200


@pytest.mark.usefixtures("limits")
def test_signups_are_limited_per_ip(client: TestClient) -> None:
    assert [signup(client, n) for n in range(3)] == [201, 201, 429]


@pytest.mark.usefixtures("limits")
def test_keys_are_stored_hashed(client: TestClient, db: Session) -> None:
    login(client, "parent@test.bd", "wrongpass1")
    keys = set(db.scalars(select(RateLimitHit.key)))
    assert keys and all(len(key) == 64 and "@" not in key for key in keys)


def test_limits_are_off_when_set_to_zero(client: TestClient, make_user: MakeUser) -> None:
    # conftest's defaults, which the rest of the suite relies on.
    make_user(Role.parent)
    assert all(login(client, "parent@test.bd", "wrongpass1") == 401 for _ in range(20))
