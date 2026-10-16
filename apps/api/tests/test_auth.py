from collections.abc import Callable
from datetime import UTC, datetime, timedelta

import jwt
import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.core.security import ACCESS_COOKIE, REFRESH_COOKIE
from app.models import Role
from tests.conftest import PASSWORD, MakeUser

SIGNUP = "/api/v1/auth/signup"
LOGIN = "/api/v1/auth/login"
REFRESH = "/api/v1/auth/refresh"
LOGOUT = "/api/v1/auth/logout"
CHANGE_PASSWORD = "/api/v1/auth/change-password"
ME = "/api/v1/me"


def parent_signup(**overrides: object) -> dict[str, object]:
    body: dict[str, object] = {
        "role": "parent",
        "name": "Test Parent",
        "email": "new.parent@test.bd",
        "password": "secret123",
    }
    body.update(overrides)
    return body


def error_code(response: object) -> str:
    return response.json()["error"]["code"]  # type: ignore[attr-defined]


# --- sign-up --------------------------------------------------------------------------------


def test_signup_parent_logs_in_and_me_works(client: TestClient) -> None:
    response = client.post(SIGNUP, json=parent_signup(preferred_locale="en"))
    assert response.status_code == 201
    user = response.json()
    assert user["role"] == "parent"
    assert user["preferred_locale"] == "en"
    assert user["must_change_password"] is False
    assert "password_hash" not in user

    me = client.get(ME)
    assert me.status_code == 200
    assert me.json()["id"] == user["id"]


def test_auth_cookies_are_httponly_lax_and_refresh_is_path_scoped(client: TestClient) -> None:
    response = client.post(SIGNUP, json=parent_signup())
    cookies = {c.split("=", 1)[0]: c.lower() for c in response.headers.get_list("set-cookie")}
    for name in (ACCESS_COOKIE, REFRESH_COOKIE):
        assert "httponly" in cookies[name]
        assert "samesite=lax" in cookies[name]
    assert "path=/;" in cookies[ACCESS_COOKIE] or cookies[ACCESS_COOKIE].endswith("path=/")
    assert "path=/api/v1/auth" in cookies[REFRESH_COOKIE]


def test_signup_teacher_requires_school(client: TestClient) -> None:
    response = client.post(SIGNUP, json=parent_signup(role="teacher"))
    assert response.status_code == 422
    assert response.json()["error"] == {
        "code": "organisation_required",
        "message_key": "errors.organisation_required",
        "detail": {"field": "organisation"},
    }

    ok = client.post(SIGNUP, json=parent_signup(role="teacher", organisation="Sample School"))
    assert ok.status_code == 201
    assert ok.json()["organisation"] == "Sample School"


@pytest.mark.parametrize("role", ["specialist", "admin"])
def test_signup_cannot_create_specialist_or_admin(client: TestClient, role: str) -> None:
    response = client.post(SIGNUP, json=parent_signup(role=role))
    assert response.status_code == 422
    assert error_code(response) == "validation_error"


def test_signup_with_bangla_phone_normalises_and_logs_in_with_any_format(
    client: TestClient,
) -> None:
    response = client.post(SIGNUP, json=parent_signup(email=None, phone="০১৭১২ ৩৪৫৬৭৮"))
    assert response.status_code == 201
    assert response.json()["phone"] == "+8801712345678"
    assert response.json()["email"] is None

    client.post(LOGOUT)
    for identifier in ("01712345678", "+880 1712-345678", "8801712345678"):
        login = client.post(LOGIN, json={"identifier": identifier, "password": "secret123"})
        assert login.status_code == 200, identifier


@pytest.mark.parametrize(
    ("overrides", "status", "code", "field"),
    [
        ({"email": None, "phone": None}, 422, "identifier_required", "email"),
        ({"email": "not-an-email"}, 422, "invalid_email", "email"),
        ({"email": None, "phone": "12345"}, 422, "invalid_phone", "phone"),
        ({"password": "short1"}, 422, "weak_password", "password"),
        ({"password": "longbutnodigits"}, 422, "weak_password", "password"),
    ],
)
def test_signup_validation_errors_name_the_field(
    client: TestClient, overrides: dict[str, object], status: int, code: str, field: str
) -> None:
    response = client.post(SIGNUP, json=parent_signup(**overrides))
    assert response.status_code == status
    assert response.json()["error"]["code"] == code
    assert response.json()["error"]["detail"] == {"field": field}


def test_signup_rejects_duplicate_email_case_insensitively(
    client: TestClient, make_user: MakeUser
) -> None:
    make_user(email="taken@test.bd")
    response = client.post(SIGNUP, json=parent_signup(email="Taken@Test.bd"))
    assert response.status_code == 409
    assert error_code(response) == "email_taken"


def test_signup_rejects_duplicate_phone(client: TestClient, make_user: MakeUser) -> None:
    make_user(email=None, phone="+8801812345678")
    response = client.post(SIGNUP, json=parent_signup(email=None, phone="01812345678"))
    assert response.status_code == 409
    assert error_code(response) == "phone_taken"


# --- login ----------------------------------------------------------------------------------


def test_login_with_email_is_case_insensitive(client: TestClient, make_user: MakeUser) -> None:
    make_user(email="parent@test.bd")
    response = client.post(LOGIN, json={"identifier": " Parent@Test.BD ", "password": PASSWORD})
    assert response.status_code == 200
    assert response.json()["email"] == "parent@test.bd"


@pytest.mark.parametrize(
    ("identifier", "password"),
    [("parent@test.bd", "wrong-pass1"), ("nobody@test.bd", PASSWORD), ("garbage", PASSWORD)],
)
def test_login_failures_are_indistinguishable(
    client: TestClient, make_user: MakeUser, identifier: str, password: str
) -> None:
    make_user(email="parent@test.bd")
    response = client.post(LOGIN, json={"identifier": identifier, "password": password})
    assert response.status_code == 401
    assert error_code(response) == "invalid_credentials"
    assert ACCESS_COOKIE not in response.cookies


def test_login_inactive_account(client: TestClient, make_user: MakeUser) -> None:
    make_user(email="parent@test.bd", is_active=False)
    response = client.post(LOGIN, json={"identifier": "parent@test.bd", "password": PASSWORD})
    assert response.status_code == 403
    assert error_code(response) == "account_inactive"

    wrong = client.post(LOGIN, json={"identifier": "parent@test.bd", "password": "nope12345"})
    assert error_code(wrong) == "invalid_credentials"


# --- session --------------------------------------------------------------------------------


def test_me_requires_login(client: TestClient) -> None:
    response = client.get(ME)
    assert response.status_code == 401
    assert error_code(response) == "not_authenticated"


def _token(user_id: int, token_type: str, expires_in: timedelta, secret: str | None = None) -> str:
    claims = {
        "sub": str(user_id),
        "type": token_type,
        "jti": "x",
        "exp": datetime.now(UTC) + expires_in,
    }
    return jwt.encode(claims, secret or get_settings().jwt_secret, algorithm="HS256")


@pytest.mark.parametrize(
    "make_token",
    [
        lambda uid: _token(uid, "access", timedelta(minutes=-1)),
        lambda uid: _token(
            uid, "access", timedelta(minutes=5), secret="another-secret-that-is-at-least-32-bytes"
        ),
        lambda uid: _token(uid, "refresh", timedelta(minutes=5)),
        lambda uid: "not-a-jwt",
    ],
    ids=["expired", "bad-signature", "refresh-used-as-access", "garbage"],
)
def test_invalid_access_tokens_are_rejected(
    client: TestClient, make_user: MakeUser, make_token: Callable[[int], str]
) -> None:
    user = make_user()
    client.cookies.set(ACCESS_COOKIE, make_token(user.id))
    response = client.get(ME)
    assert response.status_code == 401
    assert error_code(response) == "not_authenticated"


def test_refresh_issues_new_access_token(
    client: TestClient, make_user: MakeUser, login: Callable[[str], TestClient]
) -> None:
    make_user(email="parent@test.bd")
    login("parent@test.bd")
    client.cookies.delete(ACCESS_COOKIE)
    assert client.get(ME).status_code == 401

    response = client.post(REFRESH)
    assert response.status_code == 200
    assert response.json()["email"] == "parent@test.bd"
    assert client.get(ME).status_code == 200


def test_refresh_without_session_fails(client: TestClient) -> None:
    response = client.post(REFRESH)
    assert response.status_code == 401
    assert error_code(response) == "not_authenticated"


def test_logout_revokes_refresh_token(
    client: TestClient, make_user: MakeUser, login: Callable[[str], TestClient]
) -> None:
    make_user(email="parent@test.bd")
    login("parent@test.bd")
    refresh_token = client.cookies.get(REFRESH_COOKIE)
    assert refresh_token

    response = client.post(LOGOUT)
    assert response.status_code == 200
    assert client.get(ME).status_code == 401

    # Replaying the old refresh token doesn't bring the session back.
    client.cookies.set(REFRESH_COOKIE, refresh_token, path="/api/v1/auth")
    assert client.post(REFRESH).status_code == 401


def test_logout_without_session_is_ok(client: TestClient) -> None:
    assert client.post(LOGOUT).status_code == 200


# --- change password ------------------------------------------------------------------------


def test_change_password_needs_current_password(
    client: TestClient, make_user: MakeUser, login: Callable[[str], TestClient]
) -> None:
    make_user(email="parent@test.bd")
    login("parent@test.bd")
    for body in (
        {"new_password": "newpass123"},
        {"current_password": "wrong123", "new_password": "newpass123"},
    ):
        response = client.post(CHANGE_PASSWORD, json=body)
        assert response.status_code == 400
        assert response.json()["error"]["detail"] == {"field": "current_password"}


def test_change_password_rules(
    client: TestClient, make_user: MakeUser, login: Callable[[str], TestClient]
) -> None:
    make_user(email="parent@test.bd")
    login("parent@test.bd")
    weak = client.post(CHANGE_PASSWORD, json={"current_password": PASSWORD, "new_password": "abc"})
    assert error_code(weak) == "weak_password"
    same = client.post(
        CHANGE_PASSWORD, json={"current_password": PASSWORD, "new_password": PASSWORD}
    )
    assert error_code(same) == "password_unchanged"


def test_change_password_logs_out_other_sessions(
    app: object, client: TestClient, make_user: MakeUser, login: Callable[[str], TestClient]
) -> None:
    make_user(email="parent@test.bd")
    with TestClient(client.app) as other_device:  # type: ignore[arg-type]
        other_device.post(LOGIN, json={"identifier": "parent@test.bd", "password": PASSWORD})
        login("parent@test.bd")

        response = client.post(
            CHANGE_PASSWORD, json={"current_password": PASSWORD, "new_password": "newpass123"}
        )
        assert response.status_code == 200
        # This device keeps working with fresh cookies…
        assert client.get(ME).status_code == 200
        # …the other one can no longer refresh.
        assert other_device.post(REFRESH).status_code == 401

    old = client.post(LOGIN, json={"identifier": "parent@test.bd", "password": PASSWORD})
    assert error_code(old) == "invalid_credentials"
    new = client.post(LOGIN, json={"identifier": "parent@test.bd", "password": "newpass123"})
    assert new.status_code == 200


# --- me -------------------------------------------------------------------------------------


def test_update_preferred_locale(
    client: TestClient, make_user: MakeUser, login: Callable[[str], TestClient]
) -> None:
    make_user(email="teacher@test.bd", role=Role.teacher)
    login("teacher@test.bd")
    response = client.patch(ME, json={"preferred_locale": "en"})
    assert response.status_code == 200
    assert client.get(ME).json()["preferred_locale"] == "en"

    bad = client.patch(ME, json={"preferred_locale": "fr"})
    assert bad.status_code == 422
