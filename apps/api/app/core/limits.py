"""Request size limit for screening task uploads (SCREENING_SPEC §10: 5 MB).

Checked on the Content-Length header before the body is read, so an oversized upload never
reaches JSON parsing. Browsers always send the header for these JSON bodies; the ASGI server
stops a client from sending more than it declared.
"""

import re

from starlette.types import ASGIApp, Receive, Scope, Send

from app.core.errors import error_response

TASK_UPLOAD_MAX_BYTES = 5 * 1024 * 1024
TASK_UPLOAD_PATH = re.compile(r"^/api/v1/screenings/[^/]+/tasks/[^/]+$")


class TaskUploadLimit:
    def __init__(self, app: ASGIApp, max_bytes: int = TASK_UPLOAD_MAX_BYTES) -> None:
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if (
            scope["type"] == "http"
            and scope["method"] == "POST"
            and TASK_UPLOAD_PATH.match(scope["path"])
        ):
            length = dict(scope["headers"]).get(b"content-length")
            if length is None or not length.isdigit():
                response = error_response(411, "length_required", "errors.length_required")
                return await response(scope, receive, send)
            if int(length) > self.max_bytes:
                response = error_response(
                    413,
                    "payload_too_large",
                    "errors.payload_too_large",
                    {"max_bytes": self.max_bytes},
                )
                return await response(scope, receive, send)
        await self.app(scope, receive, send)
