from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import DashboardStats
from app.middleware.auth import get_current_user
from app.models.task import Task, TaskStatusEnum
from datetime import date

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    from app.models.project import ProjectMember
    from app.models.user import RoleEnum
    
    # Get all projects (admin sees all, member sees assigned)
    if user.role == RoleEnum.ADMIN:
        total_projects = db.query(ProjectMember.project_id).distinct().count()
    else:
        total_projects = db.query(ProjectMember).filter(ProjectMember.user_id == user.id).count()
    
    # Get all tasks
    if user.role == RoleEnum.ADMIN:
        total_tasks = db.query(Task).count()
        completed_tasks = db.query(Task).filter(Task.status == TaskStatusEnum.DONE).count()
        overdue_tasks = db.query(Task).filter(
            Task.due_date < date.today(),
            Task.status != TaskStatusEnum.DONE
        ).count()
    else:
        total_tasks = db.query(Task).filter(Task.assignee_id == user.id).count()
        completed_tasks = db.query(Task).filter(
            Task.assignee_id == user.id,
            Task.status == TaskStatusEnum.DONE
        ).count()
        overdue_tasks = db.query(Task).filter(
            Task.assignee_id == user.id,
            Task.due_date < date.today(),
            Task.status != TaskStatusEnum.DONE
        ).count()
    
    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "overdue_tasks": overdue_tasks
    }
