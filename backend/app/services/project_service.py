from datetime import datetime, timezone

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
        domain=payload.domain,
        business_value=payload.business_value,
        unique_aspects=payload.unique_aspects,
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

    if "tasks" in updates:
        old_by_id = {t["id"]: t for t in (project.tasks or [])}
        now = datetime.now(timezone.utc).isoformat()
        stamped = []
        for task in updates["tasks"]:
            old = old_by_id.get(task.get("id", ""), {})
            was_done = bool(old.get("completed", False))
            is_done = bool(task.get("completed", False))
            if is_done and not was_done:
                # just completed — stamp with current time
                task = {**task, "completed_at": now}
            elif not is_done:
                # uncompleted or never completed — no timestamp
                task = {**task, "completed_at": None}
            else:
                # already completed — preserve the original timestamp
                task = {**task, "completed_at": old.get("completed_at")}
            stamped.append(task)
        updates["tasks"] = stamped

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
