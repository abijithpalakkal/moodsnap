'use client';

import React, { useState } from 'react';
import { User } from '../lib/api';
import { UserCheck, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  onLogin: (username: string, role: 'user' | 'admin') => Promise<void>;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a valid username');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onLogin(username.trim(), role);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check server status.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoName: string, demoRole: 'user' | 'admin') => {
    setUsername(demoName);
    setRole(demoRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Glow decoration */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome to MoodSnap</h2>
          <p className="text-sm text-gray-400 mt-1">Select your persona to access role-based features</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. john_doe"
              className="w-full px-4 py-3 rounded-xl glass-input text-sm focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
              Select Role (RBAC)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                  role === 'user'
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <span>User Role</span>
                <span className="text-[10px] font-normal text-gray-400">Personal Entries</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                  role === 'admin'
                    ? 'bg-red-600/30 border-red-500 text-white shadow-lg shadow-red-500/20'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-red-400" />
                <span>Admin Role</span>
                <span className="text-[10px] font-normal text-gray-400">Global Control</span>
              </button>
            </div>
          </div>

          {/* Role Specs Notice */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-400 space-y-1">
            {role === 'user' ? (
              <p className="text-emerald-300"> <b>User Scope:</b> Can post moods, view own 10 timeline entries & personal stats.</p>
            ) : (
              <p className="text-red-300"> <b>Admin Scope:</b> Can view all users' entries, global stats, delete entries & list users.</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl gradient-bg font-semibold text-white shadow-lg shadow-indigo-500/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Login Presets */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-3">Quick Demo Profiles:</p>
          <div className="flex justify-center gap-2 flex-wrap">
            <button
              onClick={() => handleQuickLogin('john_doe', 'user')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30"
            >
              👤 John (User)
            </button>
            <button
              onClick={() => handleQuickLogin('sarah_connor', 'user')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30"
            >
              👤 Sarah (User)
            </button>
            <button
              onClick={() => handleQuickLogin('admin_alex', 'admin')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
            >
              🛠 Alex (Admin)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
