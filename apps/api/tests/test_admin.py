from collections.abc import Callable

import pytest
from fastapi.testclient import TestClient

from app.models import Role
from tests.conftest import MakeUser

SPECIALISTS = "/api/v1/admin/specialists"
NEW_SPECIALIST = {
    "name": "Dr. Test Specialist",
    "specialty": "Developmental paediatrics",
    "registration_no": "TEST-123",
    "organisation": "Test Clinic",
    "email": "Doc@Test.bd",
}

ADMIN_ENDPOINTS = [
    ("GET", SPECIALISTS, None),
    ("POST", SPECIALISTS, NEW_SPECIALIST),
    ("PATCH", f"{SPECIALISTS}/1", {"is_active": False}),
    ("POST", "/api/v1/admin/users/1/temporary-password", None),
]


@pytest.fixture
def admin(
    client: TestClient, make_user: MakeUser, login: Callable[[str], TestClient]
) -> TestClient:
    make_user(role=Role.admin, email="admin@test.bd")
    return login("admin@test.bd")


def create_specialist(admin: TestClient, **overrides: object) -> dict[str, object]:
    response = admin.post(SPECIALISTS, json={**NEW_SPECIALIST, **overrides})
    assert response.status_code == 201, response.text
    return response.json()  # type: ignore[no-any-return]


# --- role guards ----------------------------------------------------------------------------


@pytest.mark.parametrize(("method", "path", "body"), ADMIN_ENDPOINTS)
@pytest.mark.parametrize("role", [Role.parent, Role.teacher, Role.specialist])
def test_admin_endpoints_refuse_other_roles(
    client: TestClient,
    make_user: MakeUser,
    login: Callable[[str], TestClient],
    role: Role,
    method: str,
    path: str,
    body: object,
) -> None:
    make_user(role=role, email="someone@test.bd")
    login("someone@test.bd")
    response = client.request(method, path, json=body)
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "forbidden"


@pytest.mark.parametrize(("method", "path", "body"), ADMIN_ENDPOINTS)
def test_admin_endpoints_require_login(
    client: TestClient, method: str, path: str, body: object
) -> None:
    response = client.request(method, path, json=body)
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "not_authenticated"


# --- specialists ----------------------------------------------------------------------------


def test_create_specialist_returns_one_time_password_that_works(
    admin: TestClient, app: object
) -> None:
    created = create_specialist(admin)
    specialist = created["specialist"]
    assert isinstance(specialist, dict)
    assert specialist["email"] == "doc@test.bd"
    assert specialist["verified"] is True
    assert specialist["must_change_password"] is True
    temporary_password = created["temporary_password"]
    assert isinstance(temporary_password, str) and len(temporary_password) == 12

    listed = admin.get(SPECIALISTS).json()
    assert [s["id"] for s in listed] == [specialist["id"]]
    # The password is never shown again.
    assert "temporary_password" not in listed[0]

    with TestClient(admin.app) as specialist_client:  # type: ignore[arg-type]
        response = specialist_client.post(
            "/api/v1/auth/login",
            json={"identifier": "doc@test.bd", "password": temporary_password},
        )
        assert response.status_code == 200
        assert response.json()["role"] == "specialist"
        assert response.json()["must_change_password"] is True


@pytest.mark.parametrize(
    ("overrides", "code"),
    [
        ({"registration_no": ""}, "validation_error"),
        ({"specialty": "  "}, "validation_error"),
        ({"email": None, "phone": None}, "identifier_required"),
        ({"email": "bad"}, "invalid_email"),
    ],
)
def test_create_specialist_validation(
    admin: TestClient, overrides: dict[str, object], code: str
) -> None:
    response = admin.post(SPECIALISTS, json={**NEW_SPECIALIST, **overrides})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == code


def test_create_specialist_rejects_taken_email(admin: TestClient) -> None:
    response = admin.post(SPECIALISTS, json={**NEW_SPECIALIST, "email": "admin@test.bd"})
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "email_taken"


def test_deactivate_ends_sessions_and_blocks_login(admin: TestClient) -> None:
    created = create_specialist(admin)
    specialist_id = created["specialist"]["id"]  # type: ignore[index]

    with TestClient(admin.app) as specialist_client:  # type: ignore[arg-type]
        specialist_client.post(
            "/api/v1/auth/login",
            json={"identifier": "doc@test.bd", "password": created["temporary_password"]},
        )
        assert specialist_client.get("/api/v1/me").status_code == 200

        response = admin.patch(f"{SPECIALISTS}/{specialist_id}", json={"is_active": False})
        assert response.status_code == 200
        assert response.json()["is_active"] is False

        # Immediately, not at the next token expiry.
        assert specialist_client.get("/api/v1/me").status_code == 401
        assert specialist_client.post("/api/v1/auth/refresh").status_code == 401
        login = specialist_client.post(
            "/api/v1/auth/login",
            json={"identifier": "doc@test.bd", "password": created["temporary_password"]},
        )
        assert login.json()["error"]["code"] == "account_inactive"

    reactivated = admin.patch(f"{SPECIALISTS}/{specialist_id}", json={"is_active": True})
    assert reactivated.json()["is_active"] is True


def test_patch_only_targets_specialists(admin: TestClient, make_user: MakeUser) -> None:
    parent = make_user(role=Role.parent, email="parent@test.bd")
    response = admin.patch(f"{SPECIALISTS}/{parent.id}", json={"is_active": False})
    assert response.status_code == 404
    assert admin.patch(f"{SPECIALISTS}/999", json={"is_active": False}).status_code == 404


def test_issue_temporary_password_resets_any_non_admin(
    admin: TestClient, make_user: MakeUser
) -> None:
    parent = make_user(role=Role.parent, email="parent@test.bd")
    with TestClient(admin.app) as parent_client:  # type: ignore[arg-type]
        parent_client.post(
            "/api/v1/auth/login", json={"identifier": "parent@test.bd", "password": "demo1234"}
        )

        response = admin.post(f"/api/v1/admin/users/{parent.id}/temporary-password")
        assert response.status_code == 200
        temporary_password = response.json()["temporary_password"]

        assert parent_client.post("/api/v1/auth/refresh").status_code == 401
        login = parent_client.post(
            "/api/v1/auth/login",
            json={"identifier": "parent@test.bd", "password": temporary_password},
        )
        assert login.json()["must_change_password"] is True


def test_cannot_reset_an_admin(admin: TestClient) -> None:
    me = admin.get("/api/v1/me").json()
    response = admin.post(f"/api/v1/admin/users/{me['id']}/temporary-password")
    assert response.status_code == 404
