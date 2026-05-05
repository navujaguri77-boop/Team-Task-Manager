from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost/flowdesk"
    )

    # JWT
    jwt_secret: str = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    jwt_refresh_secret: str = os.getenv("JWT_REFRESH_SECRET", "your-refresh-secret-change-in-production")
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 0.25  # 15 minutes
    jwt_refresh_expiration_days: int = 7

    # App
    app_name: str = "FlowDesk"
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = environment == "development"
    port: int = int(os.getenv("PORT", 8000))
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # CORS
    cors_origins: list = ["http://localhost:3000", "http://localhost:5173"]

    # Rate limiting
    rate_limit_per_minute: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
