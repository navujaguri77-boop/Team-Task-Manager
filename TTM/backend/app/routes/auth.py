from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import RegisterRequest, LoginRequest, TokenResponse, RefreshTokenRequest, UserResponse, UserProfileUpdate, CurrentUser
from app.services.user_service import UserService
from app.utils.security import verify_password, create_access_token, create_refresh_token, decode_refresh_token
from datetime import timedelta
from app.config import settings
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    # Create user
    user = UserService.create_user(
        db=db,
        name=request.name,
        email=request.email,
        password=request.password
    )
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login user"""
    # Get user by email
    user = UserService.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token"""
    payload = decode_refresh_token(request.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user_id = payload.get("sub")
    access_token = create_access_token(data={"sub": user_id})
    new_refresh_token = create_refresh_token(data={"sub": user_id})
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.get("/me", response_model=CurrentUser)
async def get_current_user_info(user = Depends(get_current_user)):
    """Get current user info"""
    return user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    request: UserProfileUpdate,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    updated_user = UserService.update_user_profile(
        db=db,
        user=user,
        name=request.name,
        avatar_url=request.avatar_url
    )
    return updated_user
