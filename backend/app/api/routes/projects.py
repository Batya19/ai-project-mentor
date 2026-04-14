from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectGenerateRequest,
    ProjectResponse,
    ProjectUpdate,
)
from app.services.ai_service import (
    format_roadmap,
    format_tasks,
    generate_project_idea,
)
from app.services.project_service import (
    create_project as service_create_project,
    delete_project as service_delete_project,
    get_project as service_get_project,
    list_projects as service_list_projects,
    update_project as service_update_project,
)

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectResponse:
    return service_create_project(db, current_user.id, payload)


@router.get("", response_model=list[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ProjectResponse]:
    return service_list_projects(db, current_user.id)


@router.post("/generate", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def generate_project(
    payload: ProjectGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectResponse:
    """Generate a project idea using AI and create it automatically."""
    domain = payload.domain or "general"

    # Call AI service to generate project data
    ai_result = generate_project_idea(
        level=payload.level,
        technologies=payload.technologies,
        domain=domain,
    )
    
    # Format the generated data into project structure
    formatted_roadmap = format_roadmap(ai_result.get("roadmap", []))
    formatted_tasks = format_tasks(ai_result.get("tasks", []))
    
    # Create ProjectCreate schema with generated data
    project_create = ProjectCreate(
        title=ai_result.get("title", "Untitled Project"),
        description=ai_result.get("description", ""),
        level=payload.level,
        domain=domain,
        business_value=payload.business_value or ai_result.get("business_value", ""),
        unique_aspects=payload.unique_aspects or ai_result.get("unique_aspects", ""),
        technologies=payload.technologies,
        roadmap=formatted_roadmap,
        tasks=formatted_tasks,
        progress=0,
    )
    
    # Save to database
    return service_create_project(db, current_user.id, project_create)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectResponse:
    return service_get_project(db, project_id, current_user.id)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectResponse:
    return service_update_project(db, project_id, current_user.id, payload)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    service_delete_project(db, project_id, current_user.id)