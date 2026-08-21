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
  ChevronLeft,
  Phone,
  KeyRound,
  History,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface LoginHistoryItem {
  id: string;
  ip_address: string;
  user_agent: string;
  status: string;
  created_at: string;
}

function parseUserAgent(ua: string) {
  if (!ua || ua === 'Unknown Browser') return 'Web Browser';
  let browser = 'Browser';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Apple Safari';
  else if (ua.includes('Opera') || ua.includes('OPR/')) browser = 'Opera';

  let os = '';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return os ? `${browser} on ${os}` : browser;
}

export default function AdminSettingsPage() {
  const { admin, refreshAdminProfile } = useAuth();

  // Admin Profile State
  const [adminName, setAdminName] = useState(admin?.name || '');
  const [adminPhone, setAdminPhone] = useState(admin?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingAdminProfile, setSavingAdminProfile] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Login History State
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  useEffect(() => {
    if (admin) {
      setAdminName(admin.name || '');
      setAdminPhone(admin.phone || '');
    }
  }, [admin]);

  const fetchLoginHistory = async (page = 1) => {
    setHistoryLoading(true);
    const res = await apiFetch<any>(`/admin/auth/login-history?page=${page}&limit=10`, {
      isAdmin: true,
    });
    if (res.success && res.data) {
      setHistory(res.data.data || []);
      setHistoryTotalPages(res.data.meta?.totalPages || 1);
      setHistoryTotal(res.data.meta?.total || 0);
    }
    setHistoryLoading(false);
  };

  useEffect(() => {
    if (admin) {
      fetchLoginHistory(historyPage);
    }
  }, [admin, historyPage]);

  const handleUpdateAdminProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAdminProfile(true);
    setMessage(null);

    const bodyData: any = {
      name: adminName.trim(),
      phone: adminPhone.trim(),
    };
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

      {/* Top Banner — Dark Emerald & Gold Luxury Banner */}
      <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-3">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center shrink-0 shadow-md">
            <User className="w-6 h-6 text-[#f3ba2f]" />
          </div>
          <div className="space-y-1 flex-1">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Admin Profile & Security
            </h1>
            <p className="text-xs text-slate-300 font-semibold">
              Update administrator display name, login phone number, security password, and review login history.
            </p>
          </div>
        </div>

        {/* Link to Global Settings */}
        <div className="border-t border-[#053d29] pt-3">
          <Link
            href="/admin/settings/global"
            className="py-2.5 px-4 bg-[#023322] hover:bg-[#03442e] text-amber-200 font-black text-xs rounded-xl inline-flex items-center space-x-2 transition-all border border-[#d4af37]/35 shadow-md"
          >
            <Globe className="w-4 h-4 text-[#f3ba2f]" />
            <span>Manage Global System Settings</span>
            <ChevronRight className="w-4 h-4 text-[#f3ba2f]" />
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
              Admin Display Name <span className="text-rose-500">*</span>
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
              Admin Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="01700000000"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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

      {/* ── ADMIN LOGIN HISTORY AUDIT CARD ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Admin Login History</h2>
              <p className="text-[11px] font-medium text-slate-400">Security audit of all recent login events and client details</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono">
            {historyTotal} Events
          </span>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Browser / Device</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
              {historyLoading && history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-1.5 text-[#005A36]" />
                    <span>Loading login audit log...</span>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No login events recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {new Date(item.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true,
                      })}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold text-slate-800 text-[11px]">
                        {item.ip_address || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex items-center space-x-1.5 truncate max-w-[220px]" title={item.user_agent}>
                        <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{parseUserAgent(item.user_agent)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {historyTotalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-medium">
              Page {historyPage} of {historyTotalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                disabled={historyPage <= 1}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                disabled={historyPage >= historyTotalPages}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
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
