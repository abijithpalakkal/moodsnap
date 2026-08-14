'use client';

import React from 'react';
import { MoodEntry, User } from '../lib/api';
import { Trash2, Clock, ShieldCheck, UserCheck, Inbox } from 'lucide-react';

interface TimelineProps {
  currentUser: User;
  entries: MoodEntry[];
  onDeleteMood?: (id: string) => Promise<void>;
  onRefresh: () => void;
  loading: boolean;
}

const EMOJI_MAP: Record<string, string> = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  angry: '😡',
  ecstatic: '🤩',
  anxious: '😰',
};

const COLOR_MAP: Record<string, string> = {
  happy: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
  neutral: 'border-slate-500/40 text-slate-300 bg-slate-500/10',
  sad: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10',
  angry: 'border-rose-500/40 text-rose-300 bg-rose-500/10',
  ecstatic: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
  anxious: 'border-teal-500/40 text-teal-300 bg-teal-500/10',
};

export const Timeline: React.FC<TimelineProps> = ({
  currentUser,
  entries,
  onDeleteMood,
  onRefresh,
  loading,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            {isAdmin ? 'Global Mood Timeline (All Users)' : 'Personal Timeline (Last 10 Entries)'}
          </h3>
          <p className="text-xs text-gray-400">
            {isAdmin ? 'Admin View: Full system entries feed' : 'User View: Filtered to your recent entries'}
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Feed'}
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
          <Inbox className="w-10 h-10 mx-auto text-gray-500 mb-2" />
          <p className="text-sm font-medium text-gray-400">No mood entries logged yet.</p>
          <p className="text-xs text-gray-500 mt-1">Select an emoji above to record your first mood!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const moodEmoji = EMOJI_MAP[entry.mood.toLowerCase()] || '😊';
            const colorClass = COLOR_MAP[entry.mood.toLowerCase()] || 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10';

            return (
              <div
                key={entry.id}
                className="glass-panel p-4 rounded-2xl border border-white/10 flex items-start justify-between gap-4 glass-panel-hover"
              >
                <div className="flex items-start gap-4">
                  {/* Emoji Badge */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border ${colorClass} shadow-md`}>
                    {moodEmoji}
                  </div>

                  {/* Entry Details */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white capitalize">{entry.mood}</span>
                      
                      {/* User Badge */}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                        entry.role === 'admin' 
                          ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}>
                        {entry.role === 'admin' ? <ShieldCheck className="w-2.5 h-2.5" /> : <UserCheck className="w-2.5 h-2.5" />}
                        {entry.username || 'User'}
                      </span>
                    </div>

                    {entry.note ? (
                      <p className="text-xs text-gray-300 mt-1 italic font-normal">"{entry.note}"</p>
                    ) : (
                      <p className="text-[11px] text-gray-500 mt-1">No note provided</p>
                    )}

                    <span className="text-[10px] text-gray-400 mt-2 block">
                      {formatDate(entry.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Admin Delete Action */}
                {isAdmin && onDeleteMood && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete this mood entry from '${entry.username}'?`)) {
                        onDeleteMood(entry.id);
                      }
                    }}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/20 transition-all border border-transparent hover:border-red-500/30"
                    title="Delete Entry (Admin Only)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
