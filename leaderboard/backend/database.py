from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
import turso_dbapi

TURSO_URL = os.getenv("TURSO_URL", "").strip()
TURSO_AUTH_TOKEN = os.getenv("TURSO_AUTH_TOKEN", "").strip()

if not TURSO_URL or not TURSO_AUTH_TOKEN:
    raise RuntimeError("TURSO_URL and TURSO_AUTH_TOKEN must be set in .env")


def _creator():
    return turso_dbapi.connect(database=TURSO_URL, auth_token=TURSO_AUTH_TOKEN)


engine = create_engine("sqlite+pysqlite:///:memory:", creator=_creator)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

print(f"Database: Turso ({TURSO_URL})")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
