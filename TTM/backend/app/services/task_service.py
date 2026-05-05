from sqlalchemy.orm import Session
from app.models.task import Task, TaskStatusEnum, PriorityEnum
from app.models.project import ProjectMember
from fastapi import HTTPException, status
from typing import Optional, List
from sqlalchemy import and_
from datetime import date


class TaskService:
    @staticmethod
    def create_task(db: Session, project_id: int, title: str, description: Optional[str],
                   priority: PriorityEnum, assignee_id: Optional[int], 
                   due_date: Optional[date], created_by: int) -> Task:
        """Create a new task"""
        from app.services.project_service import ProjectService
        
        # Verify project exists
        project = ProjectService.get_project_by_id(db, project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Validate due date not in past
        if due_date and due_date < date.today():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Due date cannot be in the past"
            )
        
        # Validate assignee is project member if provided
        if assignee_id:
            member = db.query(ProjectMember).filter(
                and_(ProjectMember.project_id == project_id, ProjectMember.user_id == assignee_id)
            ).first()
            if not member:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Assignee must be a member of this project"
                )
        
        task = Task(
            project_id=project_id,
            title=title,
            description=description,
            priority=priority,
            assignee_id=assignee_id,
            due_date=due_date,
            created_by=created_by
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def get_task_by_id(db: Session, task_id: int) -> Optional[Task]:
        """Get task by ID"""
        return db.query(Task).filter(Task.id == task_id).first()

    @staticmethod
    def get_tasks_for_user(db: Session, user_id: int) -> List[Task]:
        """Get all tasks assigned to a user"""
        return db.query(Task).filter(Task.assignee_id == user_id).all()

    @staticmethod
    def get_tasks_for_project(db: Session, project_id: int) -> List[Task]:
        """Get all tasks in a project"""
        return db.query(Task).filter(Task.project_id == project_id).all()

    @staticmethod
    def update_task(db: Session, task_id: int, title: Optional[str] = None,
                   description: Optional[str] = None, priority: Optional[PriorityEnum] = None,
                   assignee_id: Optional[int] = None, due_date: Optional[date] = None,
                   status: Optional[TaskStatusEnum] = None) -> Task:
        """Update task"""
        task = TaskService.get_task_by_id(db, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        if title:
            task.title = title
        if description is not None:
            task.description = description
        if priority:
            task.priority = priority
        if assignee_id is not None:
            # Validate assignee is project member
            if assignee_id:
                member = db.query(ProjectMember).filter(
                    and_(ProjectMember.project_id == task.project_id, ProjectMember.user_id == assignee_id)
                ).first()
                if not member:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Assignee must be a member of this project"
                    )
            task.assignee_id = assignee_id
        if due_date is not None:
            if due_date < date.today():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Due date cannot be in the past"
                )
            task.due_date = due_date
        if status:
            task.status = status
        
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def update_task_status(db: Session, task_id: int, status: TaskStatusEnum) -> Task:
        """Update only task status"""
        task = TaskService.get_task_by_id(db, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        task.status = status
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def delete_task(db: Session, task_id: int) -> None:
        """Delete task"""
        task = TaskService.get_task_by_id(db, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Task not found"
            )
        
        db.delete(task)
        db.commit()

    @staticmethod
    def get_overdue_tasks(db: Session) -> List[Task]:
        """Get all overdue tasks"""
        return db.query(Task).filter(
            and_(Task.due_date < date.today(), Task.status != TaskStatusEnum.DONE)
        ).all()

    @staticmethod
    def get_tasks_due_tomorrow(db: Session) -> List[Task]:
        """Get all tasks due tomorrow"""
        from datetime import timedelta
        tomorrow = date.today() + timedelta(days=1)
        return db.query(Task).filter(Task.due_date == tomorrow).all()
