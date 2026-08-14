from pydantic import BaseModel, Field
from typing import Optional, Dict

class LoginRequest(BaseModel):
    username: str = Field(..., example="john_doe")
    role: str = Field(..., example="user")  # 'user' or 'admin'

class UserResponse(BaseModel):
    id: str
    username: str
    role: str
    created_at: Optional[str] = None

class MoodCreate(BaseModel):
    userId: str = Field(..., example="usr-123")
    username: Optional[str] = Field("Anonymous", example="john_doe")
    role: str = Field("user", example="user")
    mood: str = Field(..., example="happy")  # 'happy', 'sad', 'neutral', 'angry', 'ecstatic', 'anxious'
    note: Optional[str] = Field("", example="Feeling good today!")

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
