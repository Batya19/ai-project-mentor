from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


def get_project_for_user_or_404(db: Session, project_id: str, user_id: str) -> Project:
    """Get project or raise 404 if not found or not owned by user."""
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def create_project(db: Session, user_id: str, payload: ProjectCreate) -> Project:
    """Create a new project for the given user."""
    project = Project(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        level=payload.level,
        technologies=payload.technologies,
        roadmap=payload.roadmap,
        tasks=payload.tasks,
        progress=payload.progress,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def list_projects(db: Session, user_id: str) -> list[Project]:
    """List all projects for the given user, ordered by creation date descending."""
    return (
        db.query(Project)
        .filter(Project.user_id == user_id)
        .order_by(Project.created_at.desc())
        .all()
    )


def get_project(db: Session, project_id: str, user_id: str) -> Project:
    """Get a single project by id, ensuring it belongs to the user."""
    return get_project_for_user_or_404(db, project_id, user_id)


def update_project(db: Session, project_id: str, user_id: str, payload: ProjectUpdate) -> Project:
    """Update a project, ensuring it belongs to the user."""
    project = get_project_for_user_or_404(db, project_id, user_id)

    updates = payload.model_dump(exclude_unset=True)
    for field_name, field_value in updates.items():
        setattr(project, field_name, field_value)

    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: str, user_id: str) -> None:
    """Delete a project, ensuring it belongs to the user."""
    project = get_project_for_user_or_404(db, project_id, user_id)
    db.delete(project)
    db.commit()
