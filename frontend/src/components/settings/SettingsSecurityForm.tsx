'use client';

import React from 'react';
import { Lock, Save } from 'lucide-react';

interface SettingsSecurityFormProps {
  currentPassword: string;
  setCurrentPassword: (val: string) => void;
  newPassword: string;
  setNewPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  savingProfile: boolean;
}

export function SettingsSecurityForm({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  savingProfile,
}: SettingsSecurityFormProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
        <Lock className="w-5 h-5 text-[#03442e] shrink-0" />
        <span>Change Security Password (Optional)</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
            Current Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a]"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
            New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a]"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a]"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={savingProfile}
          className="bg-[#005A36] hover:bg-[#044D2F] text-white px-8 py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-amber-300" />
          <span>
            {savingProfile ? 'Saving Changes...' : 'Save Profile & Security Settings'}
          </span>
        </button>
      </div>
    </div>
  );
}
