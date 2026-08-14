import os
import hashlib
import time
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "moodsnap-super-secret-jwt-key-2026-auth-secure")
ALGORITHM = "HS256"
TOKEN_EXPIRE_SECONDS = 86400 * 7  # 7 days validity

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with static salt."""
    salt = "moodsnap_salt_2026_"
    salted = f"{salt}{password}".encode("utf-8")
    return hashlib.sha256(salted).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against hashed password."""
    return hash_password(plain_password) == hashed_password

def create_access_token(data: Dict[str, Any], expires_delta: Optional[int] = None) -> str:
    """Create JWT Access Token signed with secret key."""
    try:
        import pyjwt as jwt
    except ImportError:
        import jwt  # PyJWT

    to_encode = data.copy()
    expire_time = int(time.time()) + (expires_delta or TOKEN_EXPIRE_SECONDS)
    to_encode.update({"exp": expire_time})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate JWT Access Token."""
    try:
        import pyjwt as jwt
    except ImportError:
        import jwt

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        if exp and exp < int(time.time()):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired. Please log in again."
            )
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}"
        )
