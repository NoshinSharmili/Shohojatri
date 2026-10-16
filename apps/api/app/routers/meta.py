"""Public settings the web app needs at runtime."""

from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.meta import ClientConfig

router = APIRouter(tags=["meta"])


@router.get("/client-config", operation_id="getClientConfig")
def client_config() -> ClientConfig:
    return ClientConfig(public_web_url=get_settings().public_web_url or None)
