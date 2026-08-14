from fastapi import APIRouter, Depends
from typing import Dict, Any
from models.mood import StatsResponse
from database import DatabaseHandler
from utils.role_checker import get_current_user

router = APIRouter(prefix="/api", tags=["Statistics"])

@router.get("/stats", response_model=StatsResponse)
def get_statistics(
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get mood analytics breakdown:
    - User role: Returns personal mood counts for authenticated user.
    - Admin role: Returns global mood counts across all users.
    """
    user_id = current_user["id"]
    role = current_user["role"]
    
    stats = DatabaseHandler.get_stats(user_id=user_id, role=role)
    return stats
