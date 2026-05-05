from sqlalchemy.orm import Session
from app.models.project import Project, ProjectMember, ProjectStatusEnum
from app.models.user import User
from fastapi import HTTPException, status
from typing import Optional, List
from sqlalchemy import and_, or_


class ProjectService:
    @staticmethod
    def create_project(db: Session, name: str, description: Optional[str], created_by: int, status: ProjectStatusEnum = ProjectStatusEnum.ACTIVE) -> Project:
        """Create a new project"""
        project = Project(
            name=name,
            description=description,
            status=status,
            created_by=created_by
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        
        # Add creator as member
        ProjectService.add_member(db, project.id, created_by)
        
        return project

    @staticmethod
    def get_project_by_id(db: Session, project_id: int) -> Optional[Project]:
        """Get project by ID"""
        return db.query(Project).filter(Project.id == project_id).first()

    @staticmethod
    def get_projects_for_user(db: Session, user_id: int, is_admin: bool = False) -> List[Project]:
        """Get projects for user (admin sees all, member sees assigned only)"""
        if is_admin:
            return db.query(Project).all()
        else:
            # Member sees projects they're assigned to
            return db.query(Project).join(
                ProjectMember, Project.id == ProjectMember.project_id
            ).filter(ProjectMember.user_id == user_id).all()

    @staticmethod
    def update_project(db: Session, project_id: int, name: Optional[str] = None, 
                      description: Optional[str] = None, status: Optional[ProjectStatusEnum] = None) -> Project:
        """Update project"""
        project = ProjectService.get_project_by_id(db, project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        if name:
            project.name = name
        if description is not None:
            project.description = description
        if status:
            project.status = status
        
        db.commit()
        db.refresh(project)
        return project

    @staticmethod
    def delete_project(db: Session, project_id: int) -> None:
        """Delete project"""
        project = ProjectService.get_project_by_id(db, project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Check if project has active tasks
        from app.models.task import Task
        active_tasks = db.query(Task).filter(
            Task.project_id == project_id,
            Task.status != "done"
        ).count()
        
        if active_tasks > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot delete project with {active_tasks} active tasks. Please complete or delete tasks first."
            )
        
        db.delete(project)
        db.commit()

    @staticmethod
    def add_member(db: Session, project_id: int, user_id: int) -> ProjectMember:
        """Add member to project"""
        project = ProjectService.get_project_by_id(db, project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check if already member
        existing = db.query(ProjectMember).filter(
            and_(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id)
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a member of this project"
            )
        
        member = ProjectMember(project_id=project_id, user_id=user_id)
        db.add(member)
        db.commit()
        db.refresh(member)
        return member

    @staticmethod
    def remove_member(db: Session, project_id: int, user_id: int) -> None:
        """Remove member from project"""
        member = db.query(ProjectMember).filter(
            and_(ProjectMember.project_id == project_id, ProjectMember.user_id == user_id)
        ).first()
        
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Member not found in project"
            )
        
        # Check if member has assigned tasks
        from app.models.task import Task
        assigned_tasks = db.query(Task).filter(
            and_(Task.project_id == project_id, Task.assignee_id == user_id)
        ).count()
        
        if assigned_tasks > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot remove member with {assigned_tasks} assigned tasks. Please reassign tasks first."
            )
        
        db.delete(member)
        db.commit()

    @staticmethod
    def get_project_members(db: Session, project_id: int) -> List[User]:
        """Get all members of a project"""
        return db.query(User).join(
            ProjectMember, User.id == ProjectMember.user_id
        ).filter(ProjectMember.project_id == project_id).all()

    @staticmethod
    def get_project_stats(db: Session, project_id: int) -> dict:
        """Get project statistics"""
        from app.models.task import Task, TaskStatusEnum
        
        project = ProjectService.get_project_by_id(db, project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        total_tasks = db.query(Task).filter(Task.project_id == project_id).count()
        completed_tasks = db.query(Task).filter(
            and_(Task.project_id == project_id, Task.status == TaskStatusEnum.DONE)
        ).count()
        
        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "progress": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        }
