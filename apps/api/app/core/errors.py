"""One error shape for every failure (CLAUDE.md §5).

{"error": {"code": ..., "message_key": "errors.x", "detail": {...}}}
"""

import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.schemas.errors import ErrorBody, ErrorResponse

logger = logging.getLogger(__name__)


class ApiError(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        message_key: str | None = None,
        detail: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(code)
        self.status_code = status_code
        self.code = code
        self.message_key = message_key or f"errors.{code}"
        self.detail = detail or {}


# Starlette raises these for unknown routes, wrong methods etc.
_HTTP_CODES = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    405: "method_not_allowed",
    409: "conflict",
    429: "rate_limited",
}


def _response(
    status_code: int, code: str, message_key: str, detail: dict[str, Any] | None = None
) -> JSONResponse:
    body = ErrorResponse(error=ErrorBody(code=code, message_key=message_key, detail=detail or {}))
    return JSONResponse(status_code=status_code, content=jsonable_encoder(body))


async def _api_error(_: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, ApiError)
    return _response(exc.status_code, exc.code, exc.message_key, exc.detail)


async def _http_error(_: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, StarletteHTTPException)
    code = _HTTP_CODES.get(exc.status_code, "http_error")
    return _response(exc.status_code, code, f"errors.{code}")


async def _validation_error(_: Request, exc: Exception) -> JSONResponse:
    assert isinstance(exc, RequestValidationError)
    # Only field locations and error types: never echo submitted values, which may be child data.
    fields = [{"loc": list(err["loc"]), "type": err["type"]} for err in exc.errors()]
    return _response(422, "validation_error", "errors.validation_error", {"fields": fields})


async def _unhandled_error(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error on %s %s", request.method, request.url.path, exc_info=exc)
    return _response(500, "internal_error", "errors.internal_error")


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(ApiError, _api_error)
    app.add_exception_handler(StarletteHTTPException, _http_error)
    app.add_exception_handler(RequestValidationError, _validation_error)
    app.add_exception_handler(Exception, _unhandled_error)
