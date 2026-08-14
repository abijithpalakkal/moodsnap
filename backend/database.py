import os
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Initialize Supabase client if configured
supabase = None
is_supabase_connected = False

if SUPABASE_URL and SUPABASE_KEY and "your-project-id" not in SUPABASE_URL:
    try:
        from supabase import create_client, Client
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        is_supabase_connected = True
        print(" Successfully connected to Supabase!")
    except Exception as e:
        print(f" Failed to initialize Supabase client: {e}. Falling back to local storage handler.")

# In-memory fallback database store
_in_memory_users: List[Dict[str, Any]] = [
    {"id": "user-john", "username": "john_doe", "role": "user", "created_at": datetime.now(timezone.utc).isoformat()},
    {"id": "user-sarah", "username": "sarah_connor", "role": "user", "created_at": datetime.now(timezone.utc).isoformat()},
    {"id": "admin-alex", "username": "admin_alex", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()},
]

_in_memory_moods: List[Dict[str, Any]] = [
    {
        "id": "m-1",
        "userId": "user-john",
        "username": "john_doe",
        "role": "user",
        "mood": "happy",
        "note": "Started learning Next.js and FastAPI!",
        "createdAt": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "m-2",
        "userId": "user-john",
        "username": "john_doe",
        "role": "user",
        "mood": "neutral",
        "note": "Regular workday, completed tasks.",
        "createdAt": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "m-3",
        "userId": "user-sarah",
        "username": "sarah_connor",
        "role": "user",
        "mood": "ecstatic",
        "note": "Great morning coffee & successful release!",
        "createdAt": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": "m-4",
        "userId": "admin-alex",
        "username": "admin_alex",
        "role": "admin",
        "mood": "happy",
        "note": "System running smoothly with RBAC active.",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
]

# Database Operations Handler
class DatabaseHandler:

    @staticmethod
    def login_or_create_user(username: str, role: str) -> Dict[str, Any]:
        """Auth logic: Login existing user or register new user."""
        if is_supabase_connected and supabase:
            try:
                # Check if user exists
                res = supabase.table("users").select("*").eq("username", username).execute()
                if res.data and len(res.data) > 0:
                    user = res.data[0]
                    # Update role if changed
                    if user["role"] != role:
                        supabase.table("users").update({"role": role}).eq("id", user["id"]).execute()
                        user["role"] = role
                    return user
                
                # Create user
                new_user = {
                    "id": str(uuid.uuid4()),
                    "username": username,
                    "role": role,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                res = supabase.table("users").insert(new_user).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
                return new_user
            except Exception as err:
                print(f"Supabase DB error during login, falling back: {err}")

        # Fallback in-memory logic
        for user in _in_memory_users:
            if user["username"] == username:
                user["role"] = role
                return user
        
        new_user = {
            "id": f"usr-{str(uuid.uuid4())[:8]}",
            "username": username,
            "role": role,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        _in_memory_users.append(new_user)
        return new_user

    @staticmethod
    def create_mood(user_id: str, username: str, role: str, mood: str, note: Optional[str] = "") -> Dict[str, Any]:
        """Create a new mood entry."""
        now_str = datetime.now(timezone.utc).isoformat()
        mood_id = str(uuid.uuid4())

        if is_supabase_connected and supabase:
            try:
                db_record = {
                    "id": mood_id,
                    "user_id": user_id,
                    "username": username,
                    "role": role,
                    "mood": mood,
                    "note": note or "",
                    "created_at": now_str
                }
                res = supabase.table("moods").insert(db_record).execute()
                if res.data and len(res.data) > 0:
                    item = res.data[0]
                    return {
                        "id": item["id"],
                        "userId": item["user_id"],
                        "username": item.get("username", username),
                        "role": item["role"],
                        "mood": item["mood"],
                        "note": item.get("note", ""),
                        "createdAt": item.get("created_at", now_str)
                    }
            except Exception as err:
                print(f"Supabase DB error during mood creation: {err}")

        # Fallback
        entry = {
            "id": f"m-{str(uuid.uuid4())[:8]}",
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
    def get_moods(user_id: Optional[str], role: str) -> List[Dict[str, Any]]:
        """
        Get mood entries.
        User role: returns last 10 personal entries for user_id.
        Admin role: returns all entries.
        """
        if is_supabase_connected and supabase:
            try:
                query = supabase.table("moods").select("*").order("created_at", desc=True)
                if role != "admin" and user_id:
                    query = query.eq("user_id", user_id).limit(10)
                
                res = query.execute()
                if res.data is not None:
                    return [
                        {
                            "id": row["id"],
                            "userId": row.get("user_id", ""),
                            "username": row.get("username", "Anonymous"),
                            "role": row.get("role", "user"),
                            "mood": row.get("mood", "neutral"),
                            "note": row.get("note", ""),
                            "createdAt": row.get("created_at", "")
                        }
                        for row in res.data
                    ]
            except Exception as err:
                print(f"Supabase error fetching moods: {err}")

        # Fallback
        if role == "admin":
            return sorted(_in_memory_moods, key=lambda x: x["createdAt"], reverse=True)
        
        # User filter (last 10 entries)
        user_entries = [m for m in _in_memory_moods if m.get("userId") == user_id]
        return sorted(user_entries, key=lambda x: x["createdAt"], reverse=True)[:10]

    @staticmethod
    def delete_mood(mood_id: str) -> bool:
        """Admin action: delete a mood entry by ID."""
        if is_supabase_connected and supabase:
            try:
                res = supabase.table("moods").delete().eq("id", mood_id).execute()
                return True
            except Exception as err:
                print(f"Supabase error deleting mood {mood_id}: {err}")

        # Fallback
        global _in_memory_moods
        initial_len = len(_in_memory_moods)
        _in_memory_moods = [m for m in _in_memory_moods if m.get("id") != mood_id]
        return len(_in_memory_moods) < initial_len

    @staticmethod
    def get_stats(user_id: Optional[str], role: str) -> Dict[str, Any]:
        """Compute mood statistics (counts per mood type)."""
        entries = DatabaseHandler.get_moods(user_id=user_id if role != "admin" else None, role=role)
        
        counts: Dict[str, int] = {
            "happy": 0,
            "neutral": 0,
            "sad": 0,
            "angry": 0,
            "ecstatic": 0,
            "anxious": 0
        }
        
        for entry in entries:
            m = entry.get("mood", "").lower()
            if m in counts:
                counts[m] += 1
            else:
                counts[m] = 1

        total = len(entries)
        return {
            "scope": "global" if role == "admin" else "personal",
            "totalEntries": total,
            "counts": counts
        }

    @staticmethod
    def get_all_users() -> List[Dict[str, Any]]:
        """Admin action: list all users."""
        if is_supabase_connected and supabase:
            try:
                res = supabase.table("users").select("*").order("created_at", desc=True).execute()
                if res.data:
                    return res.data
            except Exception as err:
                print(f"Supabase error fetching users: {err}")
        return _in_memory_users
