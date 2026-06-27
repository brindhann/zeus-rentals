from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Locate the local database file path
SQLALCHEMY_DATABASE_URL = "sqlite:///./zeus_rentals.db"

# 2. Fire up the database connection engine
# Note: connect_args={"check_same_thread": False} is required only for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 3. Create a session factory to handle queries
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Define the base class that our tables will inherit from
Base = declarative_base()

# 5. Dependency to safely open and close database connections per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()