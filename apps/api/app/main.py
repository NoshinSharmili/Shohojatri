from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.errors import register_error_handlers
from app.routers import admin, auth, health, me
from app.schemas.errors import ErrorResponse

API_PREFIX = "/api/v1"


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Shohojatri API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        # Auth uses httpOnly cookies (B2), so the browser must send credentials.
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_error_handlers(app)

    # Documenting the error shape on every route lets the generated TS client type `error`.
    api = APIRouter(
        prefix=API_PREFIX,
        responses={"default": {"model": ErrorResponse, "description": "Error"}},
    )
    for router in (health.router, auth.router, me.router, admin.router):
        api.include_router(router)
    app.include_router(api)
    return app


app = create_app()
