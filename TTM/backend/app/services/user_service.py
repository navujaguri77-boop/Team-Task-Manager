from sqlalchemy.orm import Session
from app.models.user import User, RoleEnum
from app.utils.security import hash_password, verify_password, validate_password_strength
from app.utils.validators import is_valid_email
from fastapi import HTTPException, status
from typing import Optional


class UserService:
    @staticmethod
    def create_user(db: Session, name: str, email: str, password: str, role: RoleEnum = RoleEnum.MEMBER) -> User:
        """Create a new user"""
        # Validate email
        is_valid, message = is_valid_email(email)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid email: {message}"
            )
        
        # Check if email exists
        if db.query(User).filter(User.email == email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Validate password strength
        is_strong, message = validate_password_strength(password)
        if not is_strong:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        # Create user
        hashed_password = hash_password(password)
        user = User(
            name=name,
            email=email,
            password_hash=hashed_password,
            role=role
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def update_user_profile(db: Session, user: User, name: Optional[str] = None, avatar_url: Optional[str] = None) -> User:
        """Update user profile"""
        if name:
            user.name = name
        if avatar_url is not None:
            user.avatar_url = avatar_url
        
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def change_user_role(db: Session, user_id: int, new_role: RoleEnum) -> User:
        """Change user role (admin only)"""
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user.role = new_role
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_all_users(db: Session) -> list[User]:
        """Get all users"""
        return db.query(User).all()

    @staticmethod
    def delete_user(db: Session, user_id: int) -> None:
        """Delete user"""
        user = UserService.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        db.delete(user)
        db.commit()
