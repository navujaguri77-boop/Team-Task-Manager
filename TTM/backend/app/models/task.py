from sqlalchemy import Column, String, Integer, Enum, DateTime, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from .base import Base, TimestampMixin


class TaskStatusEnum(str, enum.Enum):
    TODO = "to_do"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"


class PriorityEnum(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(Base, TimestampMixin):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TaskStatusEnum), default=TaskStatusEnum.TODO, nullable=False)
    priority = Column(Enum(PriorityEnum), default=PriorityEnum.MEDIUM, nullable=False)
    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    due_date = Column(Date, nullable=True)

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks_assigned", foreign_keys=[assignee_id])
    creator = relationship("User", back_populates="tasks_created", foreign_keys=[created_by])

    def __repr__(self):
        return f"<Task {self.title}>"
