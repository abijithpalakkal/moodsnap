'use client';

import React, { useState } from 'react';
import { UserCheck, ShieldCheck, Sparkles, ArrowRight, UserPlus, LogIn, Lock, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  onLogin: (username: string, password: string, role: 'user' | 'admin') => Promise<void>;
  onSignUp: (username: string, password: string) => Promise<void>;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onSignUp }) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a valid username.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    if (tab === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        await onLogin(username.trim(), password, role);
      } else {
        await onSignUp(username.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (name: string, pass: string, demoRole: 'user' | 'admin') => {
    setTab('login');
    setUsername(name);
    setPassword(pass);
    setRole(demoRole);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Ambient Glow */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">MoodSnap Access</h2>
          <p className="text-xs text-gray-400 mt-1">Role-Based Emotion Tracking & Monitoring</p>
        </div>

        {/* Tab Selector: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 mb-6 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('signup'); setError(''); }}
            className={`py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              tab === 'signup'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error / RBAC Permission Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs text-center font-medium flex items-center justify-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. john_doe"
              className="w-full px-4 py-3 rounded-xl glass-input text-sm"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl glass-input text-sm pl-10"
                required
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Confirm Password for Sign Up */}
          {tab === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm pl-10"
                  required
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Role Selection for Sign In */}
          {tab === 'login' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Select Login Persona
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    role === 'user'
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md ring-1 ring-indigo-500'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <span>User Role</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    role === 'admin'
                      ? 'bg-red-600/30 border-red-500 text-white shadow-md ring-1 ring-red-500'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <span>Admin Role</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              tab === 'signup' ? 'bg-emerald-600 hover:bg-emerald-500' : 'gradient-bg hover:opacity-95'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{tab === 'signup' ? 'Create Account' : 'Authenticate'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Credentials Demo Presets */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-2 font-medium">Default Accounts (Seed Data):</p>
          <div className="flex justify-center gap-2 flex-wrap text-xs">
            <button
              onClick={() => handleQuickFill('john_doe', 'password123', 'user')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30"
            >
              👤 john_doe / password123
            </button>
            <button
              onClick={() => handleQuickFill('admin', 'adminpassword', 'admin')}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
            >
              🛠 admin / adminpassword
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
