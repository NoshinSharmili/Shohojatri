from typing import Any

from pydantic import BaseModel


class ErrorBody(BaseModel):
    code: str
    # i18n key the web app translates, e.g. "errors.not_found".
    message_key: str
    detail: dict[str, Any] = {}


class ErrorResponse(BaseModel):
    error: ErrorBody
