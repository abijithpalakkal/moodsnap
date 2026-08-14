'use client';

import React from 'react';
import { MoodStats } from '../lib/api';
import { PieChart, Activity, Sparkles } from 'lucide-react';

interface StatsPanelProps {
  stats: MoodStats | null;
  role: 'user' | 'admin';
}

const EMOJI_LABELS: Record<string, { emoji: string; color: string; label: string }> = {
  happy: { emoji: '😊', color: 'bg-amber-500', label: 'Happy' },
  neutral: { emoji: '😐', color: 'bg-slate-400', label: 'Neutral' },
  sad: { emoji: '😢', color: 'bg-cyan-500', label: 'Sad' },
  angry: { emoji: '😡', color: 'bg-rose-500', label: 'Angry' },
  ecstatic: { emoji: '🤩', color: 'bg-purple-500', label: 'Ecstatic' },
  anxious: { emoji: '😰', color: 'bg-teal-500', label: 'Anxious' },
};

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, role }) => {
  const isGlobal = role === 'admin';
  const total = stats?.totalEntries || 0;
  const counts = stats?.counts || {};

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" />
            Mood Analytics
          </h3>
          <p className="text-xs text-gray-400">
            {isGlobal ? 'Global aggregates across all users' : 'Personal mood frequency breakdown'}
          </p>
        </div>

        <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
          isGlobal ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
        }`}>
          {isGlobal ? 'Global Scope' : 'Personal Scope'}
        </span>
      </div>

      {/* Total Entries Counter */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-medium">Total Entries Logged</span>
            <h4 className="text-2xl font-extrabold text-white">{total}</h4>
          </div>
        </div>
        <Sparkles className="w-6 h-6 text-indigo-400 opacity-60" />
      </div>

      {/* Mood Counters Breakdown */}
      <div className="space-y-4">
        {Object.entries(EMOJI_LABELS).map(([key, info]) => {
          const count = counts[key] || 0;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-gray-200">
                  <span className="text-lg">{info.emoji}</span>
                  <span className="capitalize">{info.label}</span>
                </span>
                <span className="text-gray-400">
                  {count} {count === 1 ? 'entry' : 'entries'} ({percentage}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full ${info.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
