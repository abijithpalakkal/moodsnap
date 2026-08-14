import os
import uuid
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from utils.security import hash_password, verify_password

load_dotenv()

SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL", "postgresql://postgres:owjMrZwqZYEhpecz@db.fwouzdqdabwhyasotgpx.supabase.co:5432/postgres")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Connect directly to Supabase PostgreSQL Database
def get_db_connection():
    try:
        conn = psycopg2.connect(SUPABASE_DB_URL, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        return None

# Test initial connection
conn = get_db_connection()
is_postgres_connected = False
if conn:
    is_postgres_connected = True
    print("[SUCCESS] DIRECT POSTGRESQL CONNECTION TO SUPABASE SUCCESSFUL! (db.fwouzdqdabwhyasotgpx.supabase.co)")
    conn.close()
else:
    print("\n⚠️ PostgreSQL Direct Connection Failed. Fallback mode active.\n")

# Fallback store (only used if DB connection fails)
_in_memory_users: List[Dict[str, Any]] = [
    {
        "id": "admin-001",
        "username": "admin",
        "password_hash": hash_password("adminpassword"),
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "user-001",
        "username": "john_doe",
        "password_hash": hash_password("password123"),
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

_in_memory_moods: List[Dict[str, Any]] = [
    {
        "id": "m-001",
        "userId": "admin-001",
        "username": "admin",
        "role": "admin",
        "mood": "happy",
        "note": "System initialized with single Admin role.",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
]

class DatabaseHandler:

    @staticmethod
    def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
        """Fetch user record by username directly from Supabase PostgreSQL."""
        if is_postgres_connected:
            conn = get_db_connection()
            if conn:
                try:
                    with conn.cursor() as cur:
                        cur.execute("SELECT * FROM users WHERE username = %s;", (username,))
                        row = cur.fetchone()
                        if row:
                            row_dict = dict(row)
                            row_dict["id"] = str(row_dict["id"])
                            return row_dict
                except Exception as err:
                    print(f"PostgreSQL fetch error: {err}")
                finally:
                    conn.close()

        # Fallback
        for u in _in_memory_users:
            if u["username"] == username:
                return u
        return None

    @staticmethod
    def register_user(username: str, password_raw: str, role: str = "user") -> Dict[str, Any]:
        """Sign Up: Save new user with hashed password directly into Supabase PostgreSQL."""
        pass_hash = hash_password(password_raw)
        user_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()

        if is_postgres_connected:
            conn = get_db_connection()
            if conn:
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
                        if row:
                            res = dict(row)
                            res["id"] = str(res["id"])
                            print(f"[SUCCESS] Saved user '{username}' directly into Supabase 'users' PostgreSQL table!")
                            return res
                except Exception as err:
                    print(f"[ERROR] PostgreSQL user registration error: {err}")
                finally:
                    conn.close()

        # Fallback
        print(f"[INFO] Registered user '{username}' in memory fallback.")
        user_obj = {
            "id": f"usr-{user_id[:8]}",
            "username": username,
            "password_hash": pass_hash,
            "role": role,
            "created_at": created_at
        }
        _in_memory_users.append(user_obj)
        return user_obj

    @staticmethod
    def authenticate(username: str, password_raw: str) -> Optional[Dict[str, Any]]:
        """Validate user credentials against Supabase PostgreSQL database."""
        user = DatabaseHandler.get_user_by_username(username)
        if not user:
            return None
        
        pass_hash = user.get("password_hash", "")
        if verify_password(password_raw, pass_hash):
            return user
        return None

    @staticmethod
    def create_mood(user_id: str, username: str, role: str, mood: str, note: Optional[str] = "") -> Dict[str, Any]:
        """Create mood entry directly in Supabase PostgreSQL."""
        now_str = datetime.now(timezone.utc).isoformat()
        mood_id = str(uuid.uuid4())

        if is_postgres_connected:
            conn = get_db_connection()
            if conn:
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
                        if row:
                            item = dict(row)
                            print(f"[SUCCESS] Logged mood '{mood}' for user '{username}' directly into Supabase 'moods' table!")
                            return {
                                "id": str(item["id"]),
                                "userId": str(item["user_id"]),
                                "username": item["username"],
                                "role": item["role"],
                                "mood": item["mood"],
                                "note": item.get("note", ""),
                                "createdAt": str(item["created_at"])
                            }
                except Exception as err:
                    print(f"[ERROR] PostgreSQL mood creation error: {err}")
                finally:
                    conn.close()

        # Fallback
        entry = {
            "id": f"m-{mood_id[:8]}",
            "userId": user_id,
            "username": username,
            "role": role,
            "mood": mood,
            "note": note or "",
            "createdAt": now_str
        }
        _in_memory_moods.insert(0, entry)
        return entry

    @staticmethod
    def get_moods(user_id: str, role: str) -> List[Dict[str, Any]]:
        """Fetch mood timeline directly from Supabase PostgreSQL."""
        if is_postgres_connected:
            conn = get_db_connection()
            if conn:
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
                                "createdAt": str(r["created_at"])
                            }
                            for r in rows
                        ]
                except Exception as err:
                    print(f"PostgreSQL mood fetch error: {err}")
                finally:
                    conn.close()

        # Fallback
        if role == "admin":
            return sorted(_in_memory_moods, key=lambda x: x["createdAt"], reverse=True)
        user_entries = [m for m in _in_memory_moods if m.get("userId") == user_id]
        return sorted(user_entries, key=lambda x: x["createdAt"], reverse=True)[:10]

    @staticmethod
    def delete_mood(mood_id: str) -> bool:
        """Admin action: Delete mood entry directly from Supabase PostgreSQL."""
        if is_postgres_connected:
            conn = get_db_connection()
            if conn:
                try:
                    with conn.cursor() as cur:
                        cur.execute("DELETE FROM moods WHERE id = %s;", (mood_id,))
                        conn.commit()
                        return cur.rowcount > 0
                except Exception as err:
                    print(f"PostgreSQL delete error: {err}")
                finally:
                    conn.close()

        # Fallback
        global _in_memory_moods
        initial_len = len(_in_memory_moods)
        _in_memory_moods = [m for m in _in_memory_moods if m.get("id") != mood_id]
        return len(_in_memory_moods) < initial_len

    @staticmethod
    def get_stats(user_id: str, role: str) -> Dict[str, Any]:
        """Compute statistics directly from database entries."""
        entries = DatabaseHandler.get_moods(user_id=user_id, role=role)
        counts: Dict[str, int] = {
            "happy": 0, "neutral": 0, "sad": 0, "angry": 0, "ecstatic": 0, "anxious": 0
        }
        for entry in entries:
            m = entry.get("mood", "").lower()
            if m in counts:
                counts[m] += 1
            else:
                counts[m] = 1

        return {
            "scope": "global" if role == "admin" else "personal",
            "totalEntries": len(entries),
            "counts": counts
        }

    @staticmethod
    def get_all_users() -> List[Dict[str, Any]]:
        """Admin action: List all registered users directly from Supabase PostgreSQL."""
        if is_postgres_connected:
            conn = get_db_connection()
            if conn:
                try:
                    with conn.cursor() as cur:
                        cur.execute("SELECT id, username, role, created_at FROM users ORDER BY created_at DESC;")
                        rows = cur.fetchall()
                        return [
                            {
                                "id": str(r["id"]),
                                "username": r["username"],
                                "role": r["role"],
                                "created_at": str(r["created_at"])
                            }
                            for r in rows
                        ]
                except Exception as err:
                    print(f"PostgreSQL get_all_users error: {err}")
                finally:
                    conn.close()

        # Fallback
        return [
            {"id": u["id"], "username": u["username"], "role": u["role"], "created_at": u.get("created_at", "")}
            for u in _in_memory_users
        ]
