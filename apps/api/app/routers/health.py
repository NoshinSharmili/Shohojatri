from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.errors import ApiError
from app.schemas.health import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", operation_id="getHealth")
def health(db: Annotated[Session, Depends(get_db)]) -> HealthResponse:
    try:
        db.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise ApiError(503, "database_unavailable") from exc
    return HealthResponse(status="ok", database="ok")
