from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse, AddProjectMemberRequest
from app.services.project_service import ProjectService
from app.middleware.auth import get_current_user, require_admin
from app.models.user import RoleEnum
from typing import List

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=List[ProjectResponse])
async def get_projects(
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get projects (admin sees all, member sees assigned only)"""
    is_admin = user.role == RoleEnum.ADMIN
    projects = ProjectService.get_projects_for_user(db, user.id, is_admin)
    
    # Enrich with stats
    result = []
    for project in projects:
        stats = ProjectService.get_project_stats(db, project.id)
        project_dict = {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "status": project.status,
            "created_by": project.created_by,
            "created_at": project.created_at,
            "members": [{"id": m.id, "name": m.name, "email": m.email, "role": m.role, "avatar_url": m.avatar_url, "created_at": m.created_at} for m in project.members],
            "task_count": stats["total_tasks"],
            "completed_task_count": stats["completed_tasks"]
        }
        result.append(project_dict)
    
    return result


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    request: ProjectCreate,
    user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Create a new project (admin only)"""
    project = ProjectService.create_project(
        db=db,
        name=request.name,
        description=request.description,
        created_by=user.id,
        status=request.status
    )
    
    stats = ProjectService.get_project_stats(db, project.id)
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "created_by": project.created_by,
        "created_at": project.created_at,
        "members": [{"id": m.id, "name": m.name, "email": m.email, "role": m.role, "avatar_url": m.avatar_url, "created_at": m.created_at} for m in project.members],
        "task_count": stats["total_tasks"],
        "completed_task_count": stats["completed_tasks"]
    }


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: int,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get project details"""
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if user has access
    from app.models.project import ProjectMember
    if user.role != RoleEnum.ADMIN:
        member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    stats = ProjectService.get_project_stats(db, project_id)
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "created_by": project.created_by,
        "created_at": project.created_at,
        "members": [{"id": m.id, "name": m.name, "email": m.email, "role": m.role, "avatar_url": m.avatar_url, "created_at": m.created_at} for m in project.members],
        "task_count": stats["total_tasks"],
        "completed_task_count": stats["completed_tasks"]
    }


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: int,
    request: ProjectUpdate,
    user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update project (admin only)"""
    project = ProjectService.update_project(
        db=db,
        project_id=project_id,
        name=request.name,
        description=request.description,
        status=request.status
    )
    
    stats = ProjectService.get_project_stats(db, project_id)
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "status": project.status,
        "created_by": project.created_by,
        "created_at": project.created_at,
        "members": [{"id": m.id, "name": m.name, "email": m.email, "role": m.role, "avatar_url": m.avatar_url, "created_at": m.created_at} for m in project.members],
        "task_count": stats["total_tasks"],
        "completed_task_count": stats["completed_tasks"]
    }


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: int,
    user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete project (admin only)"""
    ProjectService.delete_project(db, project_id)


@router.get("/{project_id}/members")
async def get_project_members(
    project_id: int,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get project members"""
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    members = ProjectService.get_project_members(db, project_id)
    return [{"id": m.id, "name": m.name, "email": m.email, "role": m.role, "avatar_url": m.avatar_url, "created_at": m.created_at} for m in members]


@router.post("/{project_id}/members", status_code=status.HTTP_201_CREATED)
async def add_project_member(
    project_id: int,
    request: AddProjectMemberRequest,
    user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Add member to project (admin only)"""
    member = ProjectService.add_member(db, project_id, request.user_id)
    return {"message": "Member added successfully"}


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_project_member(
    project_id: int,
    user_id: int,
    user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Remove member from project (admin only)"""
    ProjectService.remove_member(db, project_id, user_id)
