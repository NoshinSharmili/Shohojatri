import os

# Must be set before `app` is imported: settings and the engine are created at import time.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["CORS_ORIGINS"] = "http://localhost:3000"
os.environ["JWT_SECRET"] = "test-secret-not-for-production-use-32b"

from collections.abc import Callable, Iterator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.db import get_db
from app.core.security import hash_password
from app.main import create_app
from app.models import Base, Role, User

PASSWORD = "demo1234"


@pytest.fixture
def engine() -> Iterator[Engine]:
    # One shared connection, so every session sees the same in-memory database.
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture
def session_factory(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


@pytest.fixture
def db(session_factory: sessionmaker[Session]) -> Iterator[Session]:
    with session_factory() as session:
        yield session


@pytest.fixture
def app(session_factory: sessionmaker[Session]) -> FastAPI:
    app = create_app()

    def override_get_db() -> Iterator[Session]:
        with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    return app


@pytest.fixture
def client(app: FastAPI) -> Iterator[TestClient]:
    # raise_server_exceptions=False so the 500 handler's response can be asserted on.
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client


MakeUser = Callable[..., User]


@pytest.fixture
def make_user(db: Session) -> MakeUser:
    """Inserts a user with password PASSWORD. Email defaults to <role>@test.bd."""
    # One hash for all: argon2 is deliberately slow.
    password_hash = hash_password(PASSWORD)

    def make(role: Role = Role.parent, **fields: object) -> User:
        fields.setdefault("email", f"{role.value}@test.bd")
        fields.setdefault("name", f"Test {role.value}")
        user = User(role=role, password_hash=password_hash, **fields)
        db.add(user)
        db.commit()
        return user

    return make


@pytest.fixture
def login(client: TestClient) -> Callable[[str], TestClient]:
    """Logs `client` in as the given email (cookies are kept on the client)."""

    def do_login(email: str, password: str = PASSWORD) -> TestClient:
        response = client.post(
            "/api/v1/auth/login", json={"identifier": email, "password": password}
        )
        assert response.status_code == 200, response.text
        return client

    return do_login
