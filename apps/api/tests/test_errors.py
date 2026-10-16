import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.errors import ApiError


@pytest.fixture
def app(app: FastAPI) -> FastAPI:
    @app.get("/test/api-error")
    def api_error() -> None:
        raise ApiError(409, "child_id_taken", detail={"child_id": "SJ-7K3QX"})

    @app.get("/test/validation")
    def validation(age_months: int) -> int:
        return age_months

    @app.get("/test/crash")
    def crash() -> None:
        raise RuntimeError("boom")

    return app


def test_api_error_uses_error_format(client: TestClient) -> None:
    response = client.get("/test/api-error")
    assert response.status_code == 409
    assert response.json() == {
        "error": {
            "code": "child_id_taken",
            "message_key": "errors.child_id_taken",
            "detail": {"child_id": "SJ-7K3QX"},
        }
    }


def test_unknown_route_is_not_found_error(client: TestClient) -> None:
    response = client.get("/api/v1/does-not-exist")
    assert response.status_code == 404
    assert response.json()["error"] == {
        "code": "not_found",
        "message_key": "errors.not_found",
        "detail": {},
    }


def test_validation_error_lists_fields_without_echoing_input(client: TestClient) -> None:
    response = client.get("/test/validation", params={"age_months": "Rafi"})
    assert response.status_code == 422
    error = response.json()["error"]
    assert error["code"] == "validation_error"
    assert error["message_key"] == "errors.validation_error"
    assert error["detail"]["fields"] == [{"loc": ["query", "age_months"], "type": "int_parsing"}]
    assert "Rafi" not in response.text


def test_unhandled_exception_is_internal_error(client: TestClient) -> None:
    response = client.get("/test/crash")
    assert response.status_code == 500
    assert response.json()["error"]["code"] == "internal_error"
    assert "boom" not in response.text


def test_openapi_documents_error_shape(client: TestClient) -> None:
    schema = client.get("/openapi.json").json()
    default = schema["paths"]["/api/v1/health"]["get"]["responses"]["default"]
    assert default["content"]["application/json"]["schema"]["$ref"].endswith("/ErrorResponse")
