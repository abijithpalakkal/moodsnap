const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface User {
  id: str;
  username: str;
  role: 'user' | 'admin';
  created_at?: str;
}

export interface MoodEntry {
  id: str;
  userId: str;
  username: str;
  role: 'user' | 'admin';
  mood: str;
  note: str;
  createdAt: str;
}

export interface MoodStats {
  scope: 'personal' | 'global';
  totalEntries: number;
  counts: Record<string, number>;
}

export async function loginUser(username: string, role: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, role }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Login failed');
  }
  return response.json();
}

export async function createMood(
  userId: string,
  username: string,
  role: string,
  mood: string,
  note: string
): Promise<MoodEntry> {
  const response = await fetch(`${API_BASE_URL}/moods`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Role': role,
    },
    body: JSON.stringify({ userId, username, role, mood, note }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to post mood entry');
  }
  return response.json();
}

export async function getMoods(userId: string, role: string): Promise<MoodEntry[]> {
  const params = new URLSearchParams({ userId, role });
  const response = await fetch(`${API_BASE_URL}/moods?${params.toString()}`, {
    headers: {
      'X-User-Role': role,
    },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to fetch timeline entries');
  }
  return response.json();
}

export async function deleteMood(moodId: string, role: string): Promise<void> {
  const params = new URLSearchParams({ role });
  const response = await fetch(`${API_BASE_URL}/moods/${moodId}?${params.toString()}`, {
    method: 'DELETE',
    headers: {
      'X-User-Role': role,
    },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to delete mood entry');
  }
}

export async function getStats(userId: string, role: string): Promise<MoodStats> {
  const params = new URLSearchParams({ userId, role });
  const response = await fetch(`${API_BASE_URL}/stats?${params.toString()}`, {
    headers: {
      'X-User-Role': role,
    },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to fetch statistics');
  }
  return response.json();
}

export async function getUsers(role: string): Promise<User[]> {
  const params = new URLSearchParams({ role });
  const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
    headers: {
      'X-User-Role': role,
    },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to fetch user list');
  }
  return response.json();
}
