from fastapi import HTTPException, Header, status
from typing import Optional

def verify_role_header(x_user_role: Optional[str] = Header(None)) -> str:
    """Validate role passed in HTTP headers."""
    if not x_user_role:
        return "user"  # Default fallback to basic user
    role = x_user_role.lower()
    if role not in ["user", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{x_user_role}'. Role must be 'user' or 'admin'."
        )
    return role

def require_admin_role(x_user_role: Optional[str] = Header(None), role: Optional[str] = None):
    """Enforce admin-only permission check."""
    active_role = role or x_user_role or "user"
    if active_role.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin permissions required for this action."
        )
    return True
