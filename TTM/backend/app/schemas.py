from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime, date
from app.models.user import RoleEnum
from app.models.project import ProjectStatusEnum
from app.models.task import TaskStatusEnum, PriorityEnum


# ============ Auth Schemas ============
class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ============ User Schemas ============
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class CurrentUser(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


# ============ Project Schemas ============
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[ProjectStatusEnum] = ProjectStatusEnum.ACTIVE


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatusEnum] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    status: ProjectStatusEnum
    created_by: int
    created_at: datetime
    members: list[UserResponse] = []
    task_count: Optional[int] = 0
    completed_task_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ProjectDetailResponse(ProjectResponse):
    pass


class AddProjectMemberRequest(BaseModel):
    user_id: int


# ============ Task Schemas ============
class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = PriorityEnum.MEDIUM
    assignee_id: Optional[int] = None
    due_date: Optional[date] = None
    status: Optional[TaskStatusEnum] = TaskStatusEnum.TODO


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    assignee_id: Optional[int] = None
    due_date: Optional[date] = None
    status: Optional[TaskStatusEnum] = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatusEnum


class TaskResponse(BaseModel):
    id: int
    project_id: int
    title: str
    description: Optional[str]
    status: TaskStatusEnum
    priority: PriorityEnum
    assignee_id: Optional[int] = None
    assignee: Optional[UserResponse] = None
    created_by: int
    creator: Optional[UserResponse] = None
    due_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Dashboard Schemas ============
class DashboardStats(BaseModel):
    total_projects: int
    total_tasks: int
    completed_tasks: int
    overdue_tasks: int


# ============ Team Schemas ============
class TeamMemberResponse(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    avatar_url: Optional[str]
    created_at: datetime
    task_count: int

    class Config:
        from_attributes = True


class UpdateUserRoleRequest(BaseModel):
    role: RoleEnum


# ============ Notification Schemas ============
class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
