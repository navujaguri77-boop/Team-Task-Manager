import pytest
from app.services.project_service import ProjectService
from app.services.user_service import UserService
from app.models.user import RoleEnum


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


def test_create_project(db, admin_user):
    """Test project creation"""
    project = ProjectService.create_project(
        db=db,
        name="Test Project",
        description="Test description",
        created_by=admin_user.id
    )

    assert project.id is not None
    assert project.name == "Test Project"
    assert project.created_by == admin_user.id


def test_get_projects_for_admin(db, admin_user, member_user):
    """Test admin sees all projects"""
    project1 = ProjectService.create_project(
        db=db,
        name="Project 1",
        description="Desc 1",
        created_by=admin_user.id
    )

    project2 = ProjectService.create_project(
        db=db,
        name="Project 2",
        description="Desc 2",
        created_by=admin_user.id
    )

    projects = ProjectService.get_projects_for_user(db, admin_user.id, is_admin=True)
    assert len(projects) >= 2


def test_get_projects_for_member(db, admin_user, member_user):
    """Test member sees only assigned projects"""
    project = ProjectService.create_project(
        db=db,
        name="Member Project",
        description="Desc",
        created_by=admin_user.id
    )

    ProjectService.add_member(db, project.id, member_user.id)

    projects = ProjectService.get_projects_for_user(db, member_user.id, is_admin=False)
    assert len(projects) == 1
    assert projects[0].id == project.id


def test_add_project_member(db, admin_user, member_user):
    """Test adding member to project"""
    project = ProjectService.create_project(
        db=db,
        name="Test Project",
        description="Desc",
        created_by=admin_user.id
    )

    ProjectService.add_member(db, project.id, member_user.id)

    members = ProjectService.get_project_members(db, project.id)
    assert len(members) == 2  # admin + member


def test_update_project(db, admin_user):
    """Test project update"""
    project = ProjectService.create_project(
        db=db,
        name="Original Name",
        description="Original",
        created_by=admin_user.id
    )

    updated = ProjectService.update_project(
        db=db,
        project_id=project.id,
        name="Updated Name",
        description="Updated"
    )

    assert updated.name == "Updated Name"
    assert updated.description == "Updated"


def test_delete_project_with_active_tasks(db, admin_user):
    """Test cannot delete project with active tasks"""
    from fastapi import HTTPException
    from app.services.task_service import TaskService
    from app.models.task import PriorityEnum

    project = ProjectService.create_project(
        db=db,
        name="Test Project",
        description="Desc",
        created_by=admin_user.id
    )

    ProjectService.add_member(db, project.id, admin_user.id)

    TaskService.create_task(
        db=db,
        project_id=project.id,
        title="Active Task",
        description="",
        priority=PriorityEnum.MEDIUM,
        assignee_id=None,
        due_date=None,
        created_by=admin_user.id
    )

    with pytest.raises(HTTPException):
        ProjectService.delete_project(db, project.id)
