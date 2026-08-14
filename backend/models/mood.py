from pydantic import BaseModel, Field
from typing import Optional, Dict

class SignUpRequest(BaseModel):
    username: str = Field(..., example="john_doe")
    password: str = Field(..., example="password123")

class LoginRequest(BaseModel):
    username: str = Field(..., example="admin")
    password: str = Field(..., example="adminpassword")
    role: str = Field("user", example="admin")  # Requested login role ('user' or 'admin')

class UserResponse(BaseModel):
    id: str
    username: str
    role: str
    created_at: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class MoodCreate(BaseModel):
    mood: str = Field(..., example="happy")  # 'happy', 'sad', 'neutral', 'angry', 'ecstatic', 'anxious'
    note: Optional[str] = Field("", example="Feeling great today!")

class MoodResponse(BaseModel):
    id: str
    userId: str
    username: str
    role: str
    mood: str
    note: str
    createdAt: str

class StatsResponse(BaseModel):
    scope: str
    totalEntries: int
    counts: Dict[str, int]
