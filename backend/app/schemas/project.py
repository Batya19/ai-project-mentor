from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ProjectGenerateRequest(BaseModel):
    """Request schema for AI project generation."""
    level: str = Field(description="Project level: junior, mid, or advanced")
    technologies: list[str] = Field(min_length=1, description="Technologies to use")
    domain: str = Field(default="general", description="Project domain: web, ai, devops, games, or general")
    business_value: str = Field(default="")
    unique_aspects: str = Field(default="")


class ProjectCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str = Field(min_length=10)
    level: str = Field(min_length=2, max_length=50)
    domain: str = Field(default="general", min_length=2, max_length=100)
    business_value: str = Field(default="")
    unique_aspects: str = Field(default="")
    technologies: list[str] = Field(default_factory=list)
    roadmap: list[dict[str, Any]] = Field(default_factory=list)
    tasks: list[dict[str, Any]] = Field(default_factory=list)
    progress: int = Field(default=0, ge=0, le=100)


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = Field(default=None, min_length=10)
    level: str | None = Field(default=None, min_length=2, max_length=50)
    domain: str | None = Field(default=None, min_length=2, max_length=100)
    business_value: str | None = None
    unique_aspects: str | None = None
    technologies: list[str] | None = None
    roadmap: list[dict[str, Any]] | None = None
    tasks: list[dict[str, Any]] | None = None
    progress: int | None = Field(default=None, ge=0, le=100)


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    description: str
    level: str
    domain: str
    business_value: str
    unique_aspects: str
    technologies: list[str]
    roadmap: list[dict[str, Any]]
    tasks: list[dict[str, Any]]
    progress: int
    created_at: datetime
    updated_at: datetime
