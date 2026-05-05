import pytest
from app.services.user_service import UserService
from app.models.user import User, RoleEnum
from app.utils.security import verify_password


def test_create_user(db):
    """Test user creation"""
    user = UserService.create_user(
        db=db,
        name="John Doe",
        email="john@example.com",
        password="SecurePass123",
        role=RoleEnum.MEMBER
    )

    assert user.id is not None
    assert user.email == "john@example.com"
    assert user.name == "John Doe"
    assert user.role == RoleEnum.MEMBER
    assert verify_password("SecurePass123", user.password_hash)


def test_create_user_invalid_password(db):
    """Test user creation with weak password"""
    from fastapi import HTTPException

    with pytest.raises(HTTPException):
        UserService.create_user(
            db=db,
            name="Jane Doe",
            email="jane@example.com",
            password="weak",
            role=RoleEnum.MEMBER
        )


def test_create_user_duplicate_email(db):
    """Test duplicate email handling"""
    from fastapi import HTTPException

    UserService.create_user(
        db=db,
        name="User1",
        email="duplicate@example.com",
        password="ValidPass123",
    )

    with pytest.raises(HTTPException):
        UserService.create_user(
            db=db,
            name="User2",
            email="duplicate@example.com",
            password="ValidPass123",
        )


def test_get_user_by_email(db):
    """Test getting user by email"""
    UserService.create_user(
        db=db,
        name="Test User",
        email="test@example.com",
        password="ValidPass123",
    )

    user = UserService.get_user_by_email(db, "test@example.com")
    assert user is not None
    assert user.email == "test@example.com"


def test_update_user_profile(db):
    """Test user profile update"""
    user = UserService.create_user(
        db=db,
        name="Original Name",
        email="profile@example.com",
        password="ValidPass123",
    )

    updated = UserService.update_user_profile(
        db=db,
        user=user,
        name="Updated Name",
        avatar_url="https://example.com/avatar.jpg"
    )

    assert updated.name == "Updated Name"
    assert updated.avatar_url == "https://example.com/avatar.jpg"
