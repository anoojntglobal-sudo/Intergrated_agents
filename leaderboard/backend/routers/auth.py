import os
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import jwt

router = APIRouter(prefix="/auth", tags=["auth"])

JWT_SECRET = os.getenv("JWT_SECRET", "change-me-please")
JWT_ALGORITHM = "HS256"
TOKEN_TTL_HOURS = 24 * 7  # 7-day sessions

APP_USERNAME = os.getenv("APP_USERNAME", "user")
APP_PASSWORD = os.getenv("APP_PASSWORD", "")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(data: LoginRequest):
    role = None
    if ADMIN_USERNAME and data.username == ADMIN_USERNAME and data.password == ADMIN_PASSWORD:
        role = "admin"
    elif APP_PASSWORD and data.username == APP_USERNAME and data.password == APP_PASSWORD:
        role = "user"

    if not role:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    payload = {
        "sub": data.username,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=TOKEN_TTL_HOURS),
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {"access_token": token, "role": role}
