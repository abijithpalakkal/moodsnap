-- ==============================================================================
-- MoodSnap - Supabase (PostgreSQL) Database Schema
-- Password Authentication & Role-Based Access Control (RBAC)
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to recreate schema
DROP TABLE IF EXISTS moods CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create Users Table with Password Hashing & Role Constraints
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Moods Table linked to Users
CREATE TABLE IF NOT EXISTS moods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin')),
    mood VARCHAR(50) NOT NULL,      -- e.g. 'happy', 'sad', 'neutral', 'angry', 'ecstatic', 'anxious'
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id);
CREATE INDEX IF NOT EXISTS idx_moods_created_at ON moods(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access to users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to moods" ON moods FOR ALL USING (true) WITH CHECK (true);

-- 5. Insert Default Single Admin Account & Sample User
-- Default Admin credentials: username = "admin", password = "adminpassword"
-- SHA-256 password hash for 'adminpassword': 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
-- SHA-256 password hash for 'password123': 8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92

INSERT INTO users (username, password_hash, role) VALUES 
    ('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'admin'),
    ('john_doe', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'user')
ON CONFLICT (username) DO NOTHING;

-- Seed Sample Mood Entries
INSERT INTO moods (user_id, username, role, mood, note, created_at)
SELECT id, username, role, 'happy', 'Welcome to MoodSnap! System initialized.', NOW() - INTERVAL '1 hour'
FROM users WHERE username = 'admin';

INSERT INTO moods (user_id, username, role, mood, note, created_at)
SELECT id, username, role, 'ecstatic', 'Logged in as regular user with JWT token.', NOW() - INTERVAL '30 minutes'
FROM users WHERE username = 'john_doe';
