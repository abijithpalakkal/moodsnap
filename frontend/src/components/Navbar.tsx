'use client';

import React from 'react';
import { User } from '../lib/api';
import { LogOut, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onSwitchRole?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              MoodSnap <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">v1.0</span>
            </h1>
            <p className="text-xs text-gray-400">Role-Based Mood Analytics</p>
          </div>
        </div>

        {/* User Info & Controls */}
        {currentUser && (
          <div className="flex items-center space-x-4">
            {/* Active User Badge */}
            <div className="flex items-center space-x-3 glass-panel px-3 py-1.5 rounded-full">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                currentUser.role === 'admin' ? 'gradient-bg-admin' : 'gradient-bg'
              }`}>
                {currentUser.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-white leading-tight">{currentUser.username}</p>
                <div className="flex items-center gap-1">
                  {currentUser.role === 'admin' ? (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-red-400 flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-0.5">
                      <UserCheck className="w-3 h-3" /> User
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-xs font-bold px-4 py-2 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-white transition-all border border-red-500/40 shadow-lg shadow-red-500/10 cursor-pointer"
              title="Sign Out of Account"
            >
              <LogOut className="w-4 h-4 text-red-400" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
