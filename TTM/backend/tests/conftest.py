import pytest
from app.database import SessionLocal, create_all_tables, drop_all_tables
from app.models.base import Base


@pytest.fixture(scope="session")
def setup_db():
    """Setup test database"""
    drop_all_tables()
    create_all_tables()
    yield
    drop_all_tables()


@pytest.fixture
def db(setup_db):
    """Get database session"""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    """Create test client"""
    from fastapi.testclient import TestClient
    from app.main import app

    return TestClient(app)
