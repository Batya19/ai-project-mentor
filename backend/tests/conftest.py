import os
from pathlib import Path


TEST_DB_PATH = Path(__file__).resolve().parent / "test_backend.db"

os.environ.setdefault("APP_NAME", "AI Project Mentor API Test")
os.environ.setdefault("DATABASE_URL", f"sqlite:///{TEST_DB_PATH.as_posix()}")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key-32-characters-long")
os.environ.setdefault("GROQ_API_KEY", "")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")

from fastapi.testclient import TestClient

from app.db.base import Base
from app.db.session import engine
from app.main import app


def reset_database() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


import pytest


@pytest.fixture(autouse=True)
def clean_database() -> None:
    reset_database()
    yield
    reset_database()


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)