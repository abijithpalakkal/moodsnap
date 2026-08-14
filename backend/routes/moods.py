from fastapi import APIRouter, HTTPException, Query, Header, status
from typing import List, Optional
from models.mood import MoodCreate, MoodResponse, UserResponse
from database import DatabaseHandler
from utils.role_checker import require_admin_role

router = APIRouter(prefix="/api", tags=["Moods"])

@router.post("/moods", response_model=MoodResponse, status_code=status.HTTP_201_CREATED)
def create_mood(entry: MoodCreate):
    """
    Create a new mood entry.
    Accepts emoji mood, optional note, userId, username, and role.
    """
    if not entry.mood:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mood field is required."
        )

    saved_entry = DatabaseHandler.create_mood(
        user_id=entry.userId,
        username=entry.username or "Anonymous",
        role=entry.role or "user",
        mood=entry.mood,
        note=entry.note
    )
    return saved_entry


@router.get("/moods", response_model=List[MoodResponse])
def get_moods(
    userId: Optional[str] = Query(None, description="User ID to filter entries for non-admin users"),
    role: Optional[str] = Query("user", description="User role: 'user' or 'admin'"),
    x_user_role: Optional[str] = Header(None)
):
    """
    Retrieve mood entries timeline based on role:
    - User role: Filtered by userId (Last 10 personal entries).
    - Admin role: All system entries returned.
    """
    active_role = (x_user_role or role or "user").lower()
    
    entries = DatabaseHandler.get_moods(user_id=userId, role=active_role)
    return entries


@router.delete("/moods/{mood_id}", status_code=status.HTTP_200_OK)
def delete_mood(
    mood_id: str,
    role: Optional[str] = Query("user", description="Caller role"),
    x_user_role: Optional[str] = Header(None)
):
    """
    Delete a mood entry (Admin Only action).
    Non-admin requests will be rejected with HTTP 403 Forbidden.
    """
    active_role = (x_user_role or role or "user").lower()
    require_admin_role(role=active_role)

    success = DatabaseHandler.delete_mood(mood_id=mood_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mood entry with ID '{mood_id}' not found."
        )
    return {"message": f"Mood entry '{mood_id}' successfully deleted.", "id": mood_id}


@router.get("/users", response_model=List[UserResponse])
def list_users(
    role: Optional[str] = Query("user"),
    x_user_role: Optional[str] = Header(None)
):
    """
    Admin control: View list of registered users.
    """
    active_role = (x_user_role or role or "user").lower()
    require_admin_role(role=active_role)

    users = DatabaseHandler.get_all_users()
    return users
