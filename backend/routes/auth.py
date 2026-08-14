from fastapi import APIRouter, HTTPException, status
from models.mood import SignUpRequest, LoginRequest, AuthResponse, UserResponse
from database import DatabaseHandler
from utils.security import create_access_token

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignUpRequest):
    """
    User Account Registration.
    Self-registering users are automatically assigned the 'user' role.
    Generates and returns JWT access_token.
    """
    username = payload.username.strip()
    password = payload.password.strip()

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required."
        )

    if len(password) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 4 characters long."
        )

    # Check if username exists
    existing = DatabaseHandler.get_user_by_username(username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{username}' is already taken. Please choose another username."
        )

    # Register user with 'user' role
    user_record = DatabaseHandler.register_user(username=username, password_raw=password, role="user")

    # Generate JWT token
    token_data = {
        "sub": user_record["id"],
        "username": user_record["username"],
        "role": user_record["role"]
    }
    access_token = create_access_token(data=token_data)

    created_at_val = user_record.get("created_at")
    user_resp = UserResponse(
        id=str(user_record["id"]),
        username=user_record["username"],
        role=user_record["role"],
        created_at=str(created_at_val) if created_at_val else None
    )

    return AuthResponse(access_token=access_token, token_type="bearer", user=user_resp)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest):
    """
    Password-based Login.
    Enforces Role-Based Access Control (RBAC):
    If a regular user attempts to log in as 'admin', returns 403 Forbidden: "You don't have admin permissions."
    """
    username = payload.username.strip()
    password = payload.password.strip()
    requested_role = (payload.role or "user").lower().strip()

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required."
        )

    # Authenticate credentials
    user_record = DatabaseHandler.authenticate(username=username, password_raw=password)
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )

    actual_role = user_record.get("role", "user").lower()

    # RBAC Role Validation: If normal user selects Admin role, reject with 403 Forbidden!
    if requested_role == "admin" and actual_role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have admin permissions."
        )

    # Generate JWT token
    token_data = {
        "sub": user_record["id"],
        "username": user_record["username"],
        "role": actual_role
    }
    access_token = create_access_token(data=token_data)

    created_at_val = user_record.get("created_at")
    user_resp = UserResponse(
        id=str(user_record["id"]),
        username=user_record["username"],
        role=actual_role,
        created_at=str(created_at_val) if created_at_val else None
    )

    return AuthResponse(access_token=access_token, token_type="bearer", user=user_resp)
