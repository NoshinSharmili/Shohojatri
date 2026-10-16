"""Production configuration (docs/DEPLOY.md): startup checks, cookies, public web URL."""

import pytest
from fastapi.testclient import TestClient

from app.core import config
from app.core.config import ConfigurationError, Settings, get_settings
from app.core.security import ACCESS_COOKIE, REFRESH_COOKIE
from app.models import Role
from tests.conftest import MakeUser

PROD_ENV = {
    "ENV": "production",
    "DATABASE_URL": "postgresql://sj:secret@db.internal:5432/shohojatri",
    "JWT_SECRET": "x" * 43,
    "OPENAI_API_KEY": "sk-test",
    "OPENAI_MODEL": "gpt-6-luna",
    "PUBLIC_WEB_URL": "https://shohojatri.example.app/",
}


def build_settings(monkeypatch: pytest.MonkeyPatch, **env: str) -> Settings:
    """Runs get_settings' startup logic on a fresh Settings, outside the app's cache."""
    for name, value in {**PROD_ENV, **env}.items():
        monkeypatch.setenv(name, value)
    monkeypatch.delenv("CORS_ORIGINS", raising=False)
    return config.get_settings.__wrapped__()


def test_complete_production_config_starts(monkeypatch: pytest.MonkeyPatch) -> None:
    settings = build_settings(monkeypatch)
    assert settings.is_production
    assert settings.cookie_secure
    assert settings.database_url == "postgresql+psycopg://sj:secret@db.internal:5432/shohojatri"
    assert settings.public_web_url == "https://shohojatri.example.app"
    assert settings.cors_origins == ["https://shohojatri.example.app"]


def test_cookie_secure_cannot_be_turned_off_in_production(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    assert build_settings(monkeypatch, COOKIE_SECURE="false").cookie_secure


def test_render_style_postgres_url_gets_the_psycopg_driver(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    settings = build_settings(monkeypatch, DATABASE_URL="postgres://u:p@h/db")
    assert settings.database_url == "postgresql+psycopg://u:p@h/db"


@pytest.mark.parametrize(
    ("name", "value", "message"),
    [
        ("DATABASE_URL", "sqlite:///./shohojatri.db", "DATABASE_URL"),
        ("JWT_SECRET", "", "JWT_SECRET"),
        ("JWT_SECRET", "too-short", "JWT_SECRET"),
        ("OPENAI_API_KEY", "", "OPENAI_API_KEY"),
        ("OPENAI_MODEL", "", "OPENAI_MODEL"),
        ("PUBLIC_WEB_URL", "", "PUBLIC_WEB_URL"),
        ("PUBLIC_WEB_URL", "http://insecure.example", "PUBLIC_WEB_URL"),
    ],
)
def test_production_fails_fast_when_a_required_var_is_missing(
    monkeypatch: pytest.MonkeyPatch, name: str, value: str, message: str
) -> None:
    with pytest.raises(ConfigurationError, match=message):
        build_settings(monkeypatch, **{name: value})


def test_development_needs_none_of_it(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ENV", "development")
    monkeypatch.setenv("JWT_SECRET", "")
    monkeypatch.setenv("PUBLIC_WEB_URL", "")
    settings = config.get_settings.__wrapped__()
    assert not settings.cookie_secure
    assert settings.jwt_secret  # a random per-process key


def test_production_cookies_are_secure_httponly_lax_without_domain(
    client: TestClient, make_user: MakeUser, monkeypatch: pytest.MonkeyPatch
) -> None:
    make_user(Role.parent)
    monkeypatch.setattr(get_settings(), "cookie_secure", True)
    response = client.post(
        "/api/v1/auth/login", json={"identifier": "parent@test.bd", "password": "demo1234"}
    )
    assert response.status_code == 200
    cookies = {c.split("=", 1)[0]: c.lower() for c in response.headers.get_list("set-cookie")}
    for name in (ACCESS_COOKIE, REFRESH_COOKIE):
        attributes = [part.strip() for part in cookies[name].split(";")]
        assert "secure" in attributes
        assert "httponly" in attributes
        assert "samesite=lax" in attributes
        assert not any(part.startswith("domain=") for part in attributes)


def test_client_config_reports_the_public_web_url(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    assert client.get("/api/v1/client-config").json() == {"public_web_url": None}
    monkeypatch.setattr(get_settings(), "public_web_url", "https://shohojatri.example.app")
    assert client.get("/api/v1/client-config").json() == {
        "public_web_url": "https://shohojatri.example.app"
    }
