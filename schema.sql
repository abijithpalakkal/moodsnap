-- ==============================================================================
-- MoodSnap - Supabase (PostgreSQL) Database Schema
-- Run this script in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Moods Table
CREATE TABLE IF NOT EXISTS moods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL, -- UUID string or user identification
    username VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin')),
    mood VARCHAR(50) NOT NULL,      -- e.g. 'happy', 'sad', 'neutral', 'angry', 'ecstatic', 'anxious'
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id);
CREATE INDEX IF NOT EXISTS idx_moods_created_at ON moods(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 4. Enable Row Level Security (RLS) - Optional/Recommended for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow full read/write for service role & API backend requests)
CREATE POLICY "Public full access to users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to moods" ON moods FOR ALL USING (true) WITH CHECK (true);

-- 5. Seed Initial Demo Data
INSERT INTO users (username, role) VALUES 
    ('john_doe', 'user'),
    ('sarah_connor', 'user'),
    ('admin_alex', 'admin')
ON CONFLICT (username) DO NOTHING;

INSERT INTO moods (user_id, username, role, mood, note, created_at) VALUES
    ('user-john', 'john_doe', 'user', 'happy', 'Started learning Next.js and FastAPI!', NOW() - INTERVAL '2 days'),
    ('user-john', 'john_doe', 'user', 'neutral', 'Regular workday, finished tasks.', NOW() - INTERVAL '1 day'),
    ('user-john', 'john_doe', 'user', 'happy', 'Shipped the new feature to production!', NOW()),
    ('user-sarah', 'sarah_connor', 'user', 'ecstatic', 'Great morning coffee & successful release!', NOW() - INTERVAL '3 hours'),
    ('user-admin', 'admin_alex', 'admin', 'happy', 'System running smoothly.', NOW() - INTERVAL '1 hour');
