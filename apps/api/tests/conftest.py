import os

# Must be set before `app` is imported: settings and the engine are created at import time.
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["CORS_ORIGINS"] = "http://localhost:3000"
os.environ["JWT_SECRET"] = "test-secret-not-for-production-use-32b"
# Beats a developer's .env, so no test ever calls OpenAI; tests mock app.ai.llm instead.
os.environ["OPENAI_API_KEY"] = ""
os.environ["ENV"] = "development"
os.environ["PUBLIC_WEB_URL"] = ""
# The permission matrix logs in hundreds of times from one address; test_rate_limits turns the
# limits back on.
os.environ["LOGIN_ATTEMPTS_PER_IP"] = "0"
os.environ["LOGIN_FAILURES_PER_ACCOUNT"] = "0"
os.environ["SIGNUPS_PER_IP"] = "0"

from collections.abc import Callable, Iterator
from datetime import date

import pytest
from argon2 import PasswordHasher
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core import security
from app.core.db import get_db
from app.core.security import hash_password
from app.main import create_app
from app.models import Base, Child, Role, User

PASSWORD = "demo1234"

# Production-cost argon2 makes each login ~0.1 s, and the permission matrix logs in ~200 times.
# Hashes record their own parameters, so verification is unaffected.
security._hasher = PasswordHasher(time_cost=1, memory_cost=1024, parallelism=1)


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


@pytest.fixture
def client_for(app: FastAPI) -> Iterator[Callable[[str], TestClient]]:
    """A separate logged-in client per email, for tests where several people act."""
    clients: list[TestClient] = []

    def make(email: str) -> TestClient:
        test_client = TestClient(app, raise_server_exceptions=False)
        test_client.__enter__()
        clients.append(test_client)
        response = test_client.post(
            "/api/v1/auth/login", json={"identifier": email, "password": PASSWORD}
        )
        assert response.status_code == 200, response.text
        return test_client

    yield make
    for test_client in clients:
        test_client.__exit__(None, None, None)


MakeChild = Callable[..., Child]


@pytest.fixture
def make_child(db: Session) -> MakeChild:
    """Inserts a child of `parent` (about 3 years old unless `dob` is given)."""
    counter = iter(range(10_000))

    def make(parent: User, **fields: object) -> Child:
        fields.setdefault("name", "Test child")
        fields.setdefault("dob", date(2023, 8, 1))
        fields.setdefault("code", f"SJ-T{next(counter):04d}")
        child = Child(parent_id=parent.id, **fields)
        db.add(child)
        db.commit()
        return child

    return make
