"""Specialists (and anyone given a temporary password) must set their own password first."""

import re
from collections.abc import Callable

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.models import Role
from tests.conftest import PASSWORD, MakeUser

# The only endpoints a user with must_change_password may use (besides public ones).
ALLOWED_PENDING = {
    ("GET", "/api/v1/me"),
    ("POST", "/api/v1/auth/change-password"),
}
PUBLIC = {
    ("GET", "/api/v1/health"),
    ("POST", "/api/v1/auth/signup"),
    ("POST", "/api/v1/auth/login"),
    ("POST", "/api/v1/auth/refresh"),
    ("POST", "/api/v1/auth/logout"),
}


def _guarded_routes() -> list[tuple[str, str]]:
    # From the OpenAPI schema, so endpoints added in later phases are covered automatically.
    from app.main import create_app

    routes = []
    for path, operations in create_app().openapi()["paths"].items():
        for method in operations:
            key = (method.upper(), path)
            if key not in ALLOWED_PENDING | PUBLIC:
                routes.append(key)
    return sorted(routes)


@pytest.fixture
def pending_client(
    client: TestClient, make_user: MakeUser, login: Callable[[str], TestClient]
) -> TestClient:
    make_user(role=Role.specialist, email="doc@test.bd", must_change_password=True)
    return login("doc@test.bd")


def test_login_succeeds_and_me_reports_pending_change(pending_client: TestClient) -> None:
    me = pending_client.get("/api/v1/me")
    assert me.status_code == 200
    assert me.json()["must_change_password"] is True


@pytest.mark.parametrize(("method", "path"), _guarded_routes())
def test_every_other_endpoint_refuses_until_password_changed(
    pending_client: TestClient, method: str, path: str
) -> None:
    # Path parameters get a dummy id: the gate must fire before any lookup or validation.
    url = re.sub(r"\{[^}]+\}", "1", path)
    response = pending_client.request(method, url, json={})
    assert response.status_code == 403, (method, path, response.text)
    assert response.json()["error"]["code"] == "password_change_required"


def test_there_are_guarded_routes_to_check() -> None:
    # Guards the test above against silently parametrising over nothing.
    assert ("PATCH", "/api/v1/me") in _guarded_routes()
    assert ("GET", "/api/v1/admin/specialists") in _guarded_routes()


def test_changing_password_lifts_the_gate(pending_client: TestClient) -> None:
    same = pending_client.post("/api/v1/auth/change-password", json={"new_password": PASSWORD})
    assert same.json()["error"]["code"] == "password_unchanged"

    # No current password needed: the user just logged in with the temporary one.
    response = pending_client.post(
        "/api/v1/auth/change-password", json={"new_password": "mynewpass9"}
    )
    assert response.status_code == 200
    assert response.json()["must_change_password"] is False
    assert pending_client.patch("/api/v1/me", json={"preferred_locale": "en"}).status_code == 200


def test_gate_applies_before_role_check(
    app: FastAPI, client: TestClient, make_user: MakeUser, login: Callable[[str], TestClient]
) -> None:
    # Even an admin given a pending change (e.g. via the DB) is held at the gate.
    make_user(role=Role.admin, email="admin@test.bd", must_change_password=True)
    login("admin@test.bd")
    response = client.get("/api/v1/admin/specialists")
    assert response.json()["error"]["code"] == "password_change_required"
