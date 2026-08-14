from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any
from models.mood import MoodCreate, MoodResponse, UserResponse
from database import DatabaseHandler
from utils.role_checker import get_current_user, require_admin

router = APIRouter(prefix="/api", tags=["Moods"])

@router.post("/moods", response_model=MoodResponse, status_code=status.HTTP_201_CREATED)
def create_mood(
    entry: MoodCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Create a new mood entry.
    Requires authenticated user (JWT Token).
    Uses authenticated user ID, username, and role.
    """
    if not entry.mood:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mood field is required."
        )

    saved_entry = DatabaseHandler.create_mood(
        user_id=current_user["id"],
        username=current_user["username"],
        role=current_user["role"],
        mood=entry.mood,
        note=entry.note
    )
    return saved_entry


@router.get("/moods", response_model=List[MoodResponse])
def get_moods(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get mood entries feed:
    - User role: Filtered to last 10 personal entries for current_user["id"].
    - Admin role: Full global entries feed for all users.
    """
    user_id = current_user["id"]
    role = current_user["role"]
    
    entries = DatabaseHandler.get_moods(user_id=user_id, role=role)
    return entries


@router.delete("/moods/{mood_id}", status_code=status.HTTP_200_OK)
def delete_mood(
    mood_id: str,
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    Delete a mood entry (Admin Only Action).
    Non-admin tokens are rejected on the backend with HTTP 403 Forbidden.
    """
    success = DatabaseHandler.delete_mood(mood_id=mood_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mood entry with ID '{mood_id}' not found."
        )
    return {"message": f"Mood entry '{mood_id}' successfully deleted.", "id": mood_id}


@router.get("/users", response_model=List[UserResponse])
def list_users(
    admin_user: Dict[str, Any] = Depends(require_admin)
):
    """
    View registered users list (Admin Only Action).
    Non-admin tokens are rejected on the backend with HTTP 403 Forbidden.
    """
    users = DatabaseHandler.get_all_users()
    return users
