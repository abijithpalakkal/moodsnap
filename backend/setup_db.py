import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("SUPABASE_DB_URL", "postgresql://postgres:owjMrZwqZYEhpecz@db.fwouzdqdabwhyasotgpx.supabase.co:5432/postgres")

def init_db():
    print(f"Connecting directly to Supabase PostgreSQL at db.fwouzdqdabwhyasotgpx.supabase.co...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    sql = """
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS moods (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'admin')),
        mood VARCHAR(50) NOT NULL,
        note TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id);
    CREATE INDEX IF NOT EXISTS idx_moods_created_at ON moods(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

    INSERT INTO users (username, password_hash, role) VALUES 
        ('admin', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'admin'),
        ('john_doe', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'user')
    ON CONFLICT (username) DO NOTHING;
    """

    cur.execute(sql)
    conn.commit()
    cur.close()
    conn.close()
    print(" TABLES AND SEED DATA CREATED DIRECTLY IN SUPABASE POSTGRESQL!")

if __name__ == "__main__":
    init_db()
