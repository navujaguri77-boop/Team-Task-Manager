from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskStatusUpdate
from app.services.task_service import TaskService
from app.services.project_service import ProjectService
from app.middleware.auth import get_current_user
from app.models.user import RoleEnum
from app.models.task import TaskStatusEnum
from typing import List
from datetime import date

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskResponse])
async def get_user_tasks(
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tasks assigned to current user"""
    tasks = TaskService.get_tasks_for_user(db, user.id)
    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get task details"""
    task = TaskService.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check access
    if user.role != RoleEnum.ADMIN and task.assignee_id != user.id and task.created_by != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return task


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    request: TaskUpdate,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update task"""
    task = TaskService.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check access
    if user.role != RoleEnum.ADMIN and task.assignee_id != user.id and task.created_by != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_task = TaskService.update_task(
        db=db,
        task_id=task_id,
        title=request.title,
        description=request.description,
        priority=request.priority,
        assignee_id=request.assignee_id,
        due_date=request.due_date,
        status=request.status
    )
    return updated_task


@router.patch("/{task_id}/status")
async def update_task_status(
    task_id: int,
    request: TaskStatusUpdate,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update task status only"""
    task = TaskService.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check access
    if user.role != RoleEnum.ADMIN and task.assignee_id != user.id and task.created_by != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    updated_task = TaskService.update_task_status(db, task_id, request.status)
    return updated_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete task (admin or creator only)"""
    task = TaskService.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check access
    if user.role != RoleEnum.ADMIN and task.created_by != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    TaskService.delete_task(db, task_id)


@router.get("/projects/{project_id}/tasks", response_model=List[TaskResponse])
async def get_project_tasks(
    project_id: int,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tasks in a project"""
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check access
    if user.role != RoleEnum.ADMIN:
        from app.models.project import ProjectMember
        member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    tasks = TaskService.get_tasks_for_project(db, project_id)
    return tasks


@router.post("/projects/{project_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    project_id: int,
    request: TaskCreate,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task in a project"""
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check access
    if user.role != RoleEnum.ADMIN:
        from app.models.project import ProjectMember
        member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id
        ).first()
        if not member:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    
    task = TaskService.create_task(
        db=db,
        project_id=project_id,
        title=request.title,
        description=request.description,
        priority=request.priority,
        assignee_id=request.assignee_id,
        due_date=request.due_date,
        created_by=user.id
    )
    return task
