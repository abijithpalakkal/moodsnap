'use client';

import React from 'react';
import { User } from '../lib/api';
import { Users, ShieldCheck, UserCheck } from 'lucide-react';

interface AdminUsersProps {
  users: User[];
  loading: boolean;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ users, loading }) => {
  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-red-400" />
            Registered System Users
          </h3>
          <p className="text-xs text-gray-400">Admin Control: Directory of all system accounts</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-red-500/20 text-red-300 border border-red-500/30">
          {users.length} Users
        </span>
      </div>

      {loading ? (
        <div className="text-center py-6 text-xs text-gray-400">Loading user registry...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-6 text-xs text-gray-500">No users found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-3 rounded-2xl glass-panel border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white ${
                  u.role === 'admin' ? 'gradient-bg-admin' : 'gradient-bg'
                }`}>
                  {u.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{u.username}</p>
                  <p className="text-[10px] text-gray-400 font-mono">ID: {u.id.substring(0, 8)}...</p>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                u.role === 'admin'
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                {u.role.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
