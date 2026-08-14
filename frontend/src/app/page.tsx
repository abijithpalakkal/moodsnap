'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { LoginModal } from '../components/LoginModal';
import { MoodForm } from '../components/MoodForm';
import { Timeline } from '../components/Timeline';
import { StatsPanel } from '../components/StatsPanel';
import { AdminUsers } from '../components/AdminUsers';
import {
  User,
  MoodEntry,
  MoodStats,
  loginUser,
  getMoods,
  createMood,
  deleteMood,
  getStats,
  getUsers,
} from '../lib/api';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Restore user session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('moodsnap_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
      } catch (err) {
        console.error('Failed to parse saved user:', err);
      }
    }
    setAuthInitialized(true);
  }, []);

  // Fetch data whenever user logs in or switches
  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [timelineData, statsData] = await Promise.all([
        getMoods(currentUser.id, currentUser.role),
        getStats(currentUser.id, currentUser.role),
      ]);
      setEntries(timelineData);
      setStats(statsData);

      if (currentUser.role === 'admin') {
        const allUsers = await getUsers(currentUser.role);
        setUsersList(allUsers);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const handleLogin = async (username: string, role: 'user' | 'admin') => {
    const user = await loginUser(username, role);
    setCurrentUser(user);
    localStorage.setItem('moodsnap_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('moodsnap_user');
    setEntries([]);
    setStats(null);
    setUsersList([]);
  };

  const handleCreateMood = async (mood: string, note: string) => {
    if (!currentUser) return;
    await createMood(currentUser.id, currentUser.username, currentUser.role, mood, note);
    await fetchData();
  };

  const handleDeleteMood = async (id: string) => {
    if (!currentUser) return;
    await deleteMood(id, currentUser.role);
    await fetchData();
  };

  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      <Navbar currentUser={currentUser} onLogout={handleLogout} />

      {!currentUser ? (
        <LoginModal onLogin={handleLogin} />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in duration-500">
          
          {/* Header Greeting Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${
                currentUser.role === 'admin' 
                  ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {currentUser.role === 'admin' ? '🛠 Admin Control Dashboard' : '👤 User Personal Dashboard'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                Hello, <span className="gradient-text">{currentUser.username}</span>!
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                {currentUser.role === 'admin' 
                  ? 'You have global administrative access to monitor and manage all entries.' 
                  : 'Track your daily feelings and keep a visual log of your emotional wellness.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 rounded-xl glass-panel hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all flex items-center gap-2"
              >
                <span>{loading ? 'Syncing...' : 'Sync Data'}</span>
              </button>
            </div>
          </div>

          {/* Main Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Mood Logger & Timeline */}
            <div className="lg:col-span-7 space-y-8">
              {/* Mood Entry Form */}
              <MoodForm currentUser={currentUser} onSubmitMood={handleCreateMood} />

              {/* Timeline Feed */}
              <Timeline
                currentUser={currentUser}
                entries={entries}
                onDeleteMood={currentUser.role === 'admin' ? handleDeleteMood : undefined}
                onRefresh={fetchData}
                loading={loading}
              />
            </div>

            {/* Right Column: Analytics & Admin Tools */}
            <div className="lg:col-span-5 space-y-8">
              {/* Statistics Breakdown */}
              <StatsPanel stats={stats} role={currentUser.role} />

              {/* Admin Registered Users View */}
              {currentUser.role === 'admin' && (
                <AdminUsers users={usersList} loading={loading} />
              )}
            </div>

          </div>
        </main>
      )}

      <footer className="py-6 text-center text-xs text-gray-500 border-t border-white/5 mt-auto">
        MoodSnap &copy; 2026 — Built with Next.js, FastAPI & Supabase (PostgreSQL)
      </footer>
    </div>
  );
}
