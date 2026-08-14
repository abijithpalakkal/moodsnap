from fastapi import APIRouter, HTTPException, status
from models.mood import LoginRequest, UserResponse
from database import DatabaseHandler

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login", response_model=UserResponse)
def login(payload: LoginRequest):
    """
    Mock Auth login endpoint.
    Accepts username and role selection (user/admin).
    Creates or fetches user in database.
    """
    username = payload.username.strip()
    role = payload.role.lower().strip()
    
    if not username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username cannot be empty."
        )
        
    if role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be either 'user' or 'admin'."
        )

    user = DatabaseHandler.login_or_create_user(username=username, role=role)
    return user
