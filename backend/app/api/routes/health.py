from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.project import Project

router = APIRouter(tags=["health"])


@router.get("/health")
async def healthcheck() -> dict[str, str]:
    # Keep a lightweight endpoint for uptime checks and Docker health probes.
    return {"status": "ok"}


@router.get("/api/stats")
def stats(db: Session = Depends(get_db)) -> dict[str, int]:
    """Public endpoint: returns the total number of generated roadmaps."""
    total = db.query(func.count(Project.id)).scalar() or 0
    return {"total_projects": total}
