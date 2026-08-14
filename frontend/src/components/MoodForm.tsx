'use client';

import React, { useState } from 'react';
import { User } from '../lib/api';
import { Send, Smile } from 'lucide-react';

interface MoodFormProps {
  currentUser: User;
  onSubmitMood: (mood: string, note: string) => Promise<void>;
}

const MOOD_OPTIONS = [
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'from-amber-400 to-yellow-500', border: 'border-amber-500' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', color: 'from-blue-400 to-slate-400', border: 'border-slate-400' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'from-cyan-500 to-blue-600', border: 'border-cyan-500' },
  { id: 'angry', emoji: '😡', label: 'Angry', color: 'from-rose-500 to-red-600', border: 'border-rose-500' },
  { id: 'ecstatic', emoji: '🤩', label: 'Ecstatic', color: 'from-purple-400 to-pink-500', border: 'border-purple-500' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'from-teal-400 to-emerald-600', border: 'border-teal-500' },
];

export const MoodForm: React.FC<MoodFormProps> = ({ currentUser, onSubmitMood }) => {
  const [selectedMood, setSelectedMood] = useState('happy');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitMood(selectedMood, note);
      setNote('');
      setSuccessMsg('Mood logged successfully! ✨');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit mood');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Smile className="w-5 h-5 text-indigo-400" />
          How are you feeling right now?
        </h3>
        {successMsg && (
          <span className="text-xs text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full font-medium border border-emerald-500/30 animate-pulse">
            {successMsg}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Emoji Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {MOOD_OPTIONS.map((m) => {
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMood(m.id)}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all duration-200 ${
                  isSelected
                    ? `bg-white/15 ${m.border} scale-105 shadow-lg ring-2 ring-indigo-500/50`
                    : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100 hover:bg-white/10'
                }`}
              >
                <span className="text-3xl filter drop-shadow-md select-none transform transition-transform hover:scale-125">
                  {m.emoji}
                </span>
                <span className="text-[11px] font-semibold text-gray-300 capitalize">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Optional Note */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
            Add Optional Note
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What's causing this feeling? (Optional)"
            className="w-full px-4 py-3 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-4 rounded-xl gradient-bg font-semibold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Log Mood Entry</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
