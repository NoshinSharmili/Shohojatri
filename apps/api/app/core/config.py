import logging
import secrets
from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./shohojatri.db"
    # Comma-separated in the env file; NoDecode stops pydantic-settings expecting JSON.
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:3000"]

    # Signs access and refresh tokens. Empty → a random per-process key (see get_settings).
    jwt_secret: str = ""
    access_token_minutes: int = 15
    refresh_token_days: int = 30
    # True behind HTTPS. Off by default so cookies work on http://localhost.
    cookie_secure: bool = False

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if not settings.jwt_secret:
        # Keeps a fresh checkout runnable without committing a secret; the cost is that
        # everyone is logged out whenever the API restarts.
        logger.warning("JWT_SECRET is not set: using a random key, sessions end on restart.")
        settings.jwt_secret = secrets.token_urlsafe(32)
    return settings
