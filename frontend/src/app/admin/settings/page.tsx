'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  User,
  Save,
  Lock,
  ShieldCheck,
  Globe,
  ChevronRight,
  Phone,
  KeyRound,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { admin, refreshAdminProfile } = useAuth();

  // Admin Profile State
  const [adminName, setAdminName] = useState(admin?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingAdminProfile, setSavingAdminProfile] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (admin) setAdminName(admin.name || '');
  }, [admin]);

  const handleUpdateAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAdminProfile(true);
    setMessage(null);

    const bodyData: any = { name: adminName.trim() };
    if (newPassword) {
      bodyData.current_password = currentPassword;
      bodyData.new_password = newPassword;
    }

    const res = await apiFetch('/admin/auth/profile', {
      method: 'PATCH',
      isAdmin: true,
      body: JSON.stringify(bodyData),
    });

    if (res.success) {
      setMessage({ type: 'success', text: 'Admin profile updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      await refreshAdminProfile();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to update admin profile' });
    }
    setSavingAdminProfile(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Top Banner — Coins Page Theme */}
      <div className="bg-[#005A36] rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700/60 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-secondary" />
          </div>
          <div className="space-y-1 flex-1">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
              Admin Profile & Security
            </h1>
            <p className="text-xs text-emerald-100/80 font-medium">
              Update administrator display name, phone number details, and security password.
            </p>
          </div>
        </div>

        {/* Link to Global Settings */}
        <div className="border-t border-emerald-700/60 pt-3">
          <Link
            href="/admin/settings/global"
            className="py-2 px-4 bg-emerald-700/60 hover:bg-emerald-700/80 text-white font-extrabold text-xs rounded-xl inline-flex items-center space-x-2 transition-all border border-emerald-500/30"
          >
            <Globe className="w-4 h-4 text-secondary" />
            <span>Manage Global System Settings</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Admin Profile Settings Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Admin Account Details</h2>
        </div>

        <form onSubmit={handleUpdateAdminProfile} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Admin Display Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Admin Name..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Phone Number <span className="normal-case text-slate-400 font-medium">(System ID - Readonly)</span>
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                disabled
                value={admin?.phone || ''}
                className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <KeyRound className="w-4 h-4 text-primary" />
              <span>Change Admin Password</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Current Password <span className="normal-case text-slate-400 font-medium">(Required to change)</span>
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="Current password..."
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="New password (min. 6 characters)..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingAdminProfile}
            className="w-full py-3.5 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-black text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-emerald-900/10 mt-2"
          >
            <Save className="w-4 h-4 text-secondary" />
            <span>{savingAdminProfile ? 'Saving Profile...' : 'Save Admin Credentials'}</span>
          </button>
        </form>
      </div>

      {/* Global Settings Shortcut Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Global System Configurations</h3>
            <p className="text-[11px] font-medium text-slate-400">Configure weekly payout amounts, coin market rates & run payouts</p>
          </div>
        </div>
        <Link
          href="/admin/settings/global"
          className="py-2 px-3.5 bg-emerald-50 hover:bg-emerald-100 text-primary border border-emerald-200/80 font-extrabold text-xs rounded-xl flex items-center space-x-1 transition-colors shrink-0"
        >
          <span>Open</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
