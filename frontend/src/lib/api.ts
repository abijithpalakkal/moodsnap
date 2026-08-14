const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface User {
  id: string;
  username: string;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface MoodEntry {
  id: string;
  userId: string;
  username: string;
  role: 'user' | 'admin';
  mood: string;
  note: string;
  createdAt: string;
}

export interface MoodStats {
  scope: 'personal' | 'global';
  totalEntries: number;
  counts: Record<string, number>;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('moodsnap_token');
}

export function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginUser(username: string, password: string, role: 'user' | 'admin'): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }
    return data;
  } catch (err: any) {
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error('Unable to connect to backend server. Please ensure FastAPI server is running on http://localhost:8000.');
    }
    throw err;
  }
}

export async function signUpUser(username: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || 'Registration failed');
    }
    return data;
  } catch (err: any) {
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error('Unable to connect to backend server. Please ensure FastAPI server is running on http://localhost:8000.');
    }
    throw err;
  }
}

export async function createMood(mood: string, note: string): Promise<MoodEntry> {
  const response = await fetch(`${API_BASE_URL}/moods`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ mood, note }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to post mood entry');
  }
  return data;
}

export async function getMoods(): Promise<MoodEntry[]> {
  const response = await fetch(`${API_BASE_URL}/moods`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch timeline entries');
  }
  return data;
}

export async function deleteMood(moodId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/moods/${moodId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to delete mood entry');
  }
}

export async function getStats(): Promise<MoodStats> {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch statistics');
  }
  return data;
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch user list');
  }
  return data;
}
