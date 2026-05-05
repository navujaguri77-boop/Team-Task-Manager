import pytest
from app.services.task_service import TaskService
from app.services.project_service import ProjectService
from app.services.user_service import UserService
from app.models.user import RoleEnum
from app.models.task import PriorityEnum
from datetime import date, timedelta


@pytest.fixture
def admin_user(db):
    return UserService.create_user(
        db=db,
        name="Admin",
        email="admin@example.com",
        password="AdminPass123",
        role=RoleEnum.ADMIN
    )


@pytest.fixture
def member_user(db):
    return UserService.create_user(
        db=db,
        name="Member",
        email="member@example.com",
        password="MemberPass123",
        role=RoleEnum.MEMBER
    )


@pytest.fixture
def project(db, admin_user):
    return ProjectService.create_project(
        db=db,
        name="Test Project",
        description="Test",
        created_by=admin_user.id
    )


def test_create_task(db, admin_user, project):
    """Test task creation"""
    task = TaskService.create_task(
        db=db,
        project_id=project.id,
        title="Test Task",
        description="Test description",
        priority=PriorityEnum.HIGH,
        assignee_id=None,
        due_date=date.today() + timedelta(days=1),
        created_by=admin_user.id
    )

    assert task.id is not None
    assert task.title == "Test Task"
    assert task.priority == PriorityEnum.HIGH


def test_create_task_with_past_due_date(db, admin_user, project):
    """Test cannot create task with past due date"""
    from fastapi import HTTPException

    with pytest.raises(HTTPException):
        TaskService.create_task(
            db=db,
            project_id=project.id,
            title="Past Task",
            description="",
            priority=PriorityEnum.MEDIUM,
            assignee_id=None,
            due_date=date.today() - timedelta(days=1),
            created_by=admin_user.id
        )


def test_update_task_status(db, admin_user, project):
    """Test task status update"""
    task = TaskService.create_task(
        db=db,
        project_id=project.id,
        title="Task",
        description="",
        priority=PriorityEnum.MEDIUM,
        assignee_id=None,
        due_date=None,
        created_by=admin_user.id
    )

    from app.models.task import TaskStatusEnum
    updated = TaskService.update_task_status(db, task.id, TaskStatusEnum.DONE)

    assert updated.status == TaskStatusEnum.DONE


def test_get_user_tasks(db, admin_user, member_user, project):
    """Test getting user tasks"""
    ProjectService.add_member(db, project.id, member_user.id)

    task1 = TaskService.create_task(
        db=db,
        project_id=project.id,
        title="Task 1",
        description="",
        priority=PriorityEnum.MEDIUM,
        assignee_id=member_user.id,
        due_date=None,
        created_by=admin_user.id
    )

    task2 = TaskService.create_task(
        db=db,
        project_id=project.id,
        title="Task 2",
        description="",
        priority=PriorityEnum.MEDIUM,
        assignee_id=member_user.id,
        due_date=None,
        created_by=admin_user.id
    )

    tasks = TaskService.get_tasks_for_user(db, member_user.id)
    assert len(tasks) >= 2
