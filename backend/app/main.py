from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.models.user import User


def create_app() -> FastAPI:
    """Application factory to support testing and clean startup."""
    app = FastAPI(title=settings.app_name)

    # Import models and create tables during early development.
    User
    Base.metadata.create_all(bind=engine)

    app.include_router(health_router)
    app.include_router(auth_router)
    return app


app = create_app()
