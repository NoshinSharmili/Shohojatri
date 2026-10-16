import logging
import secrets
from functools import lru_cache
from typing import Annotated, Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

logger = logging.getLogger(__name__)

# The shortest JWT_SECRET accepted in production: 32 bytes of entropy as url-safe base64.
MIN_PROD_SECRET_LENGTH = 32


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # "production" turns on the startup checks in `production_problems` and Secure cookies.
    env: Literal["development", "production"] = "development"

    database_url: str = "sqlite:///./shohojatri.db"
    # Comma-separated in the env file; NoDecode stops pydantic-settings expecting JSON.
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:3000"]
    # Where the web app is served, e.g. https://shohojatri.vercel.app (no trailing slash).
    # Share links and QR codes point here. Empty in development: the web app uses its own origin.
    public_web_url: str = ""

    # Signs access and refresh tokens. Empty → a random per-process key (see get_settings).
    jwt_secret: str = ""
    access_token_minutes: int = 15
    refresh_token_days: int = 30
    # True behind HTTPS. Off by default so cookies work on http://localhost; forced on in prod.
    cookie_secure: bool = False

    # Empty key → AI features fall back (CLAUDE.md §5). The model is OpenAI's lightweight one.
    openai_api_key: str = ""
    openai_model: str = "gpt-6-luna"
    # Passed as reasoning.effort; empty → the model's default (slower for short tasks).
    openai_reasoning_effort: str = "low"
    openai_timeout_seconds: float = 20
    # Per user per Bangladesh day; above it AI features fall back as if unconfigured. 0 = no cap.
    llm_daily_cap: int = 50

    # Abuse protection for the public demo (app/core/rate_limit.py). 0 turns a limit off.
    login_attempts_per_ip: int = 30  # per 15 minutes
    login_failures_per_account: int = 10  # per 15 minutes; counts wrong passwords only
    signups_per_ip: int = 10  # per hour

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("database_url")
    @classmethod
    def _psycopg_driver(cls, value: str) -> str:
        # Render (and most hosts) hand out postgres:// or postgresql:// URLs, which SQLAlchemy
        # would open with psycopg2. We ship psycopg 3.
        for prefix in ("postgres://", "postgresql://"):
            if value.startswith(prefix):
                return "postgresql+psycopg://" + value.removeprefix(prefix)
        return value

    @field_validator("public_web_url")
    @classmethod
    def _no_trailing_slash(cls, value: str) -> str:
        return value.strip().rstrip("/")

    @property
    def is_production(self) -> bool:
        return self.env == "production"

    def production_problems(self) -> list[str]:
        """What a production deploy is missing. Empty when everything required is set."""
        problems = []
        if not self.database_url.startswith("postgresql"):
            problems.append("DATABASE_URL must point at Postgres")
        if len(self.jwt_secret) < MIN_PROD_SECRET_LENGTH:
            problems.append(f"JWT_SECRET must be at least {MIN_PROD_SECRET_LENGTH} characters")
        if not self.openai_api_key:
            problems.append("OPENAI_API_KEY is required")
        if not self.openai_model:
            problems.append("OPENAI_MODEL is required")
        if not self.public_web_url.startswith("https://"):
            problems.append("PUBLIC_WEB_URL must be the https:// address of the web app")
        return problems


class ConfigurationError(RuntimeError):
    """Raised at startup so a misconfigured production deploy fails its health check loudly."""


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    if settings.is_production:
        problems = settings.production_problems()
        if problems:
            raise ConfigurationError("ENV=production but: " + "; ".join(problems))
        settings.cookie_secure = True
        # The browser only talks to the web origin (Next rewrites /api/v1/*), so CORS only
        # matters for direct calls; allow the web app unless CORS_ORIGINS says otherwise.
        if "cors_origins" not in settings.model_fields_set:
            settings.cors_origins = [settings.public_web_url]
    elif not settings.jwt_secret:
        # Keeps a fresh checkout runnable without committing a secret; the cost is that
        # everyone is logged out whenever the API restarts.
        logger.warning("JWT_SECRET is not set: using a random key, sessions end on restart.")
        settings.jwt_secret = secrets.token_urlsafe(32)
    return settings
