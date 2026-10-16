from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from app.core.db import get_db


def test_health_ok(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "database": "ok"}


def test_health_reports_database_down_in_error_format(app: FastAPI, client: TestClient) -> None:
    class BrokenSession(Session):
        def execute(self, *args: object, **kwargs: object) -> None:  # type: ignore[override]
            raise OperationalError("SELECT 1", {}, Exception("down"))

    app.dependency_overrides[get_db] = lambda: BrokenSession()
    response = client.get("/api/v1/health")
    assert response.status_code == 503
    assert response.json() == {
        "error": {
            "code": "database_unavailable",
            "message_key": "errors.database_unavailable",
            "detail": {},
        }
    }


def test_cors_allows_web_origin_with_credentials(client: TestClient) -> None:
    response = client.options(
        "/api/v1/health",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"},
    )
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_cors_rejects_other_origins(client: TestClient) -> None:
    response = client.get("/api/v1/health", headers={"Origin": "https://evil.example"})
    assert "access-control-allow-origin" not in response.headers
