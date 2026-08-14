from fastapi import APIRouter, Query, Header
from typing import Optional
from models.mood import StatsResponse
from database import DatabaseHandler

router = APIRouter(prefix="/api", tags=["Statistics"])

@router.get("/stats", response_model=StatsResponse)
def get_statistics(
    userId: Optional[str] = Query(None, description="User ID for personal stats scope"),
    role: Optional[str] = Query("user", description="Caller role ('user' or 'admin')"),
    x_user_role: Optional[str] = Header(None)
):
    """
    Get mood statistics breakdown:
    - User role: Returns personal mood counts for the given userId.
    - Admin role: Returns global mood counts across all users.
    """
    active_role = (x_user_role or role or "user").lower()
    stats = DatabaseHandler.get_stats(user_id=userId, role=active_role)
    return stats
