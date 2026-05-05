from sqlalchemy import Column, String, Integer, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .base import Base, TimestampMixin


class RoleEnum(str, enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.MEMBER, nullable=False)
    avatar_url = Column(String(500), nullable=True)

    # Relationships
    projects_created = relationship("Project", back_populates="creator", foreign_keys="Project.created_by")
    project_members = relationship("ProjectMember", back_populates="user", cascade="all, delete-orphan")
    tasks_assigned = relationship("Task", back_populates="assignee", foreign_keys="Task.assignee_id")
    tasks_created = relationship("Task", back_populates="creator", foreign_keys="Task.created_by")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.name} ({self.email})>"
