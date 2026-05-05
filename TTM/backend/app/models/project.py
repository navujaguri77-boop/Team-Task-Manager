from sqlalchemy import Column, String, Integer, Enum, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .base import Base, TimestampMixin


class ProjectStatusEnum(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(ProjectStatusEnum), default=ProjectStatusEnum.ACTIVE, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    creator = relationship("User", back_populates="projects_created", foreign_keys=[created_by])
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project {self.name}>"


class ProjectMember(Base, TimestampMixin):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_members")

    def __repr__(self):
        return f"<ProjectMember project={self.project_id} user={self.user_id}>"
