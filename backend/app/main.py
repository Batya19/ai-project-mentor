from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.auth import router as auth_router
from app.api.routes.health import router as health_router
from app.api.routes.projects import router as projects_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.models.project import Project
from app.models.user import User, OTPCode


def create_app() -> FastAPI:
    """Application factory to support testing and clean startup."""
    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Import models and create tables during early development.
    User
    Project
    OTPCode
    Base.metadata.create_all(bind=engine)

    app.include_router(health_router)
    app.include_router(auth_router)
    app.include_router(projects_router)
    return app


app = create_app()
