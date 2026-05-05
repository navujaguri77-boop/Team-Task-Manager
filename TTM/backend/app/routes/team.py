from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import TeamMemberResponse, UpdateUserRoleRequest
from app.services.user_service import UserService
from app.middleware.auth import require_admin
from app.models.user import RoleEnum
from typing import List

router = APIRouter(prefix="/api/team", tags=["team"])


@router.get("", response_model=List[TeamMemberResponse])
async def get_team(
    user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all team members (admin only)"""
    users = UserService.get_all_users(db)
    
    result = []
    for u in users:
        from sqlalchemy import func
        task_count = db.query(func.count()).filter_by(assignee_id=u.id).scalar()
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "avatar_url": u.avatar_url,
            "created_at": u.created_at,
            "task_count": task_count or 0
        })
    
    return result


@router.put("/{user_id}/role", response_model=TeamMemberResponse)
async def update_user_role(
    user_id: int,
    request: UpdateUserRoleRequest,
    user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Update user role (admin only)"""
    updated_user = UserService.change_user_role(db, user_id, request.role)
    
    from sqlalchemy import func
    task_count = db.query(func.count()).filter_by(assignee_id=updated_user.id).scalar()
    
    return {
        "id": updated_user.id,
        "name": updated_user.name,
        "email": updated_user.email,
        "role": updated_user.role,
        "avatar_url": updated_user.avatar_url,
        "created_at": updated_user.created_at,
        "task_count": task_count or 0
    }


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    user = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete user (admin only)"""
    # Check if user has assigned tasks
    from app.models.task import Task
    task_count = db.query(Task).filter(Task.assignee_id == user_id).count()
    if task_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete user with {task_count} assigned tasks"
        )
    
    UserService.delete_user(db, user_id)
