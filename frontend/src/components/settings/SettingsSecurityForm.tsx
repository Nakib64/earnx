'use client';

import React from 'react';
import { Lock, Save, RefreshCw } from 'lucide-react';
import { GlassButton } from '../design-system/GlassButton';

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
    <div className="space-y-4 pt-4 border-t border-slate-200/60">
      <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
        <Lock className="w-5 h-5 text-emerald-700 shrink-0" />
        <span>Change Security Password (Optional)</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
            Current Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-white/80 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
            New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-white/80 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-white/80 border border-slate-200/90 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <GlassButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={savingProfile}
          className="gap-2 px-8 shadow-lg shadow-emerald-950/15"
        >
          {savingProfile ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-emerald-200" />
              <span>Save Profile &amp; Security Settings</span>
            </>
          )}
        </GlassButton>
      </div>
    </div>
  );
}
