'use client';

import React from 'react';
import { X, Search, Check } from 'lucide-react';

interface AssignUsersModalProps {
  selectedDesignation: {
    id: string;
    name: string;
    max_level: number;
  } | null;
  allUsers: any[];
  userSearch: string;
  loadingUsers: boolean;
  onClose: () => void;
  onSearchChange: (val: string) => void;
  onToggleUserDesignation: (userId: string, currentDesId: string | null) => void;
}

export default function AssignUsersModal({
  selectedDesignation,
  allUsers,
  userSearch,
  loadingUsers,
  onClose,
  onSearchChange,
  onToggleUserDesignation,
}: AssignUsersModalProps) {
  if (!selectedDesignation) return null;

  const filteredUsers = allUsers.filter(
    (u) =>
      u.phone.includes(userSearch) ||
      (u.full_name && u.full_name.toLowerCase().includes(userSearch.toLowerCase())) ||
      u.referral_code.toLowerCase().includes(userSearch.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Setup Users for ({selectedDesignation.name})
            </h3>
            <p className="text-xs text-slate-500">
              Click to assign or unassign members to unlock Level {selectedDesignation.max_level} earning depth
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search filter */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search user by phone or name..."
            value={userSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-80">
          {loadingUsers ? (
            <div className="text-center py-6 text-xs text-slate-400">Loading user database...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">No matching users found</div>
          ) : (
            filteredUsers.map((u) => {
              const isAssigned = u.designation_id === selectedDesignation.id;
              return (
                <div
                  key={u.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isAssigned
                      ? 'bg-purple-50/80 border-purple-200'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900">{u.full_name || u.phone}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Phone: {u.phone} | Code: {u.referral_code}
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleUserDesignation(u.id, u.designation_id)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-colors ${
                      isAssigned
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {isAssigned ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Assigned</span>
                      </>
                    ) : (
                      <span>Assign User</span>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
