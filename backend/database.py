import os
import uuid
import socket
import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from fastapi import HTTPException, status
from utils.security import hash_password, verify_password

load_dotenv()

# -----------------------------------------------------------------------
# Startup: fail hard if SUPABASE_DB_URL is not configured
# -----------------------------------------------------------------------
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
if not SUPABASE_DB_URL:
    raise RuntimeError(
        "SUPABASE_DB_URL environment variable is not set. "
        "Add it to your .env file or deployment environment."
    )


def get_db_connection() -> psycopg2.extensions.connection:
    """Open a fresh PostgreSQL connection, forcing IPv4. Raises HTTPException 503 if it fails."""
    try:
        parsed = urlparse(SUPABASE_DB_URL)
        hostname = parsed.hostname
        port = parsed.port or 5432

        # Resolve hostname to IPv4 to avoid IPv6 issues on some networks
        ipv4_address = socket.getaddrinfo(hostname, port, socket.AF_INET)[0][4][0]

        conn = psycopg2.connect(
            host=ipv4_address,
            port=port,
            dbname=parsed.path.lstrip("/"),
            user=parsed.username,
            password=parsed.password,
            sslmode="require",
            cursor_factory=RealDictCursor,
        )
        return conn
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Cannot connect to database: {exc}"
        )


class DatabaseHandler:

    # -------------------------------------------------------------------
    # Users
    # -------------------------------------------------------------------
    @staticmethod
    def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
        """Return user dict or None. Raises 503 if DB unreachable."""
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM users WHERE username = %s;", (username,))
                row = cur.fetchone()
                if row:
                    result = dict(row)
                    result["id"] = str(result["id"])
                    return result
                return None
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching user: {exc}"
            )
        finally:
            conn.close()

    @staticmethod
    def register_user(username: str, password_raw: str, role: str = "user") -> Dict[str, Any]:
        """Insert new user. Raises 500 if INSERT fails or returns no data."""
        pass_hash = hash_password(password_raw)
        user_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO users (id, username, password_hash, role, created_at)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id, username, role, created_at;
                    """,
                    (user_id, username, pass_hash, role, created_at)
                )
                conn.commit()
                row = cur.fetchone()
                if not row:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="register_user: INSERT succeeded but returned no data."
                    )
                result = dict(row)
                result["id"] = str(result["id"])
                return result
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error registering user: {exc}"
            )
        finally:
            conn.close()

    @staticmethod
    def authenticate(username: str, password_raw: str) -> Optional[Dict[str, Any]]:
        """Verify credentials. Returns user dict or None (invalid password)."""
        user = DatabaseHandler.get_user_by_username(username)
        if not user:
            return None
        if verify_password(password_raw, user.get("password_hash", "")):
            return user
        return None

    # -------------------------------------------------------------------
    # Moods
    # -------------------------------------------------------------------
    @staticmethod
    def create_mood(
        user_id: str,
        username: str,
        role: str,
        mood: str,
        note: Optional[str] = "",
    ) -> Dict[str, Any]:
        """Insert mood entry. Raises 500 if INSERT fails or returns no data."""
        mood_id = str(uuid.uuid4())
        now_str = datetime.now(timezone.utc).isoformat()

        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO moods (id, user_id, username, role, mood, note, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING id, user_id, username, role, mood, note, created_at;
                    """,
                    (mood_id, user_id, username, role, mood, note or "", now_str)
                )
                conn.commit()
                row = cur.fetchone()
                if not row:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="create_mood: INSERT succeeded but returned no data."
                    )
                item = dict(row)
                return {
                    "id": str(item["id"]),
                    "userId": str(item["user_id"]),
                    "username": item["username"],
                    "role": item["role"],
                    "mood": item["mood"],
                    "note": item.get("note", ""),
                    "createdAt": str(item["created_at"]),
                }
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error creating mood: {exc}"
            )
        finally:
            conn.close()

    @staticmethod
    def get_moods(user_id: str, role: str) -> List[Dict[str, Any]]:
        """Fetch moods from DB. Raises 500 on query failure."""
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                if role == "admin":
                    cur.execute("SELECT * FROM moods ORDER BY created_at DESC;")
                else:
                    cur.execute(
                        "SELECT * FROM moods WHERE user_id = %s ORDER BY created_at DESC LIMIT 10;",
                        (user_id,)
                    )
                rows = cur.fetchall()
                return [
                    {
                        "id": str(r["id"]),
                        "userId": str(r["user_id"]),
                        "username": r.get("username", "Anonymous"),
                        "role": r.get("role", "user"),
                        "mood": r.get("mood", "neutral"),
                        "note": r.get("note", ""),
                        "createdAt": str(r["created_at"]),
                    }
                    for r in rows
                ]
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching moods: {exc}"
            )
        finally:
            conn.close()

    @staticmethod
    def delete_mood(mood_id: str) -> bool:
        """Delete mood by ID. Raises 500 on DB error."""
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM moods WHERE id = %s;", (mood_id,))
                conn.commit()
                return cur.rowcount > 0
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error deleting mood: {exc}"
            )
        finally:
            conn.close()

    # -------------------------------------------------------------------
    # Stats
    # -------------------------------------------------------------------
    @staticmethod
    def get_stats(user_id: str, role: str) -> Dict[str, Any]:
        """Compute mood statistics from DB."""
        entries = DatabaseHandler.get_moods(user_id=user_id, role=role)
        counts: Dict[str, int] = {
            "happy": 0, "neutral": 0, "sad": 0, "angry": 0, "ecstatic": 0, "anxious": 0
        }
        for entry in entries:
            m = entry.get("mood", "").lower()
            counts[m] = counts.get(m, 0) + 1
        return {
            "scope": "global" if role == "admin" else "personal",
            "totalEntries": len(entries),
            "counts": counts,
        }

    # -------------------------------------------------------------------
    # Admin helpers
    # -------------------------------------------------------------------
    @staticmethod
    def get_all_users() -> List[Dict[str, Any]]:
        """Return all users (admin only). Raises 500 on DB error."""
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC;"
                )
                rows = cur.fetchall()
                return [
                    {
                        "id": str(r["id"]),
                        "username": r["username"],
                        "role": r["role"],
                        "created_at": str(r["created_at"]),
                    }
                    for r in rows
                ]
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error fetching users: {exc}"
            )
        finally:
            conn.close()
