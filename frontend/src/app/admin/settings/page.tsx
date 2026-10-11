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
  ArrowLeft,
  Sparkles,
  Wallet,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { DepositGatewayConfig } from '../../../types';

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

  // Deposit Gateway Numbers State (Used by User Dashboard)
  const [gateways, setGateways] = useState<DepositGatewayConfig>({
    bkash_number: '01700000000',
    bkash_type: 'Personal (Send Money)',
    nagad_number: '01800000000',
    nagad_type: 'Personal (Send Money)',
    rocket_number: '01900000000',
    rocket_type: 'Personal (Send Money)',
    deposit_instruction: 'Send money to the designated number and paste the Transaction ID (TrxID) below.',
  });
  const [loadingGateways, setLoadingGateways] = useState(true);
  const [savingGateways, setSavingGateways] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Login History State
  const [history, setHistory] = useState<LoginHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (admin) {
      setAdminName(admin.name || '');
      setAdminPhone(admin.phone || '');
    }
  }, [admin]);

  const fetchGateways = async () => {
    setLoadingGateways(true);
    const res = await apiFetch<DepositGatewayConfig>('/deposits/gateways', { isAdmin: true });
    if (res.success && res.data) {
      setGateways(res.data);
    }
    setLoadingGateways(false);
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied ${key} number (${text})`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdateGateways = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGateways(true);
    const res = await apiFetch<DepositGatewayConfig>('/deposits/admin/gateways', {
      method: 'PATCH',
      isAdmin: true,
      body: JSON.stringify(gateways),
    });

    if (res.success) {
      toast.success('Deposit numbers & payment gateways updated successfully!');
      if (res.data) setGateways(res.data);
    } else {
      toast.error(res.error?.message || 'Failed to update deposit gateways');
    }
    setSavingGateways(false);
  };

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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshAdminProfile(),
        fetchLoginHistory(historyPage),
        fetchGateways(),
      ]);
      toast.info('Refreshed admin profile, deposit numbers, and login audit log');
    } catch {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

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
      toast.success('Admin profile credentials updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      await refreshAdminProfile();
    } else {
      const errMsg = res.error?.message || 'Failed to update admin profile';
      setMessage({ type: 'error', text: errMsg });
      toast.error(errMsg);
    }
    setSavingAdminProfile(false);
  };

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16 font-[family-name:var(--font-montserrat)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        
        {/* ── 1. PAGE HEADER (Sitting directly on background per Design System) ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl select-none">
            {/* Eyebrow Label */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Security Governance &amp; Profile Credentials
            </div>

            {/* Prominent Main Heading */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Admin Profile &amp; Security
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Update administrator identity keys, access phone credentials, change security passwords, and inspect client login audits.
            </p>

            {/* Operational Status Indicator */}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                Active Session Protected &bull;{' '}
                <strong className="text-slate-900 font-semibold">
                  {historyTotal} Total Login Events Audited
                </strong>
              </span>
            </div>
          </div>

          {/* Secondary Actions with Liquid Glassmorphism */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap select-none">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Dashboard</span>
            </Link>

         

            <button
              onClick={handleRefresh}
              disabled={refreshing || historyLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              title="Refresh Security Status"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${refreshing || historyLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Alert Notification */}
        {message && (
          <AlertBanner
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        )}

        {/* ── 2. SUMMARY KPI STATS CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 select-none">
          {/* Card 1: Admin Identity */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Administrator</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 truncate block">
                {admin?.name || 'Super Administrator'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Role: Primary System Admin
              </span>
            </div>
          </div>

          {/* Card 2: Auth Phone */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Login Phone</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <Phone className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#009F6B] tabular-nums truncate block">
                {admin?.phone || '—'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Verified access phone
              </span>
            </div>
          </div>

          {/* Card 3: Security Status */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Security Audit Log</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">
                {historyTotal} Events
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Logged session access attempts
              </span>
            </div>
          </div>

          {/* Card 4: Deposit Gateways */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Deposit Gateways</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-sky-700 tabular-nums">
                3 Channels
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                bKash &bull; Nagad &bull; Rocket
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. ADMIN PROFILE SETTINGS CARD ── */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] select-none">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Admin Account Credentials</h2>
                <p className="text-xs text-slate-500 font-normal">Update your public administrator name and registered login phone number.</p>
              </div>
            </div>

         
          </div>

          <form onSubmit={handleUpdateAdminProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Admin Display Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Admin Name..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Admin Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="01700000000"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>
            </div>

            {/* Change Password Sub-section */}
            <div className="border-t border-slate-100/80 pt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Change Security Password
                  </h3>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Leave blank if you do not want to change your existing password.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Current Password <span className="normal-case text-slate-400 font-normal">(Required to change)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      placeholder="Current password..."
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    New Password <span className="normal-case text-slate-400 font-normal">(Min. 6 chars)</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      placeholder="New password..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingAdminProfile}
              className="w-full py-3 bg-[#009F6B] hover:bg-[#008C5F] disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98] mt-2"
            >
              <Save className="w-4 h-4 text-emerald-100" />
              <span>{savingAdminProfile ? 'Saving Credentials...' : 'Save Admin Credentials'}</span>
            </button>
          </form>
        </div>

        {/* ── 4. OFFICIAL DEPOSIT NUMBERS & PAYMENT GATEWAYS CARD ── */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Official Deposit Numbers &amp; Gateways
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/80">
                    Live
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Configure official bKash, Nagad, and Rocket numbers and instructions used on member deposit dashboard.
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100/90 text-slate-700 border border-slate-200/80 hidden sm:inline-flex items-center gap-1.5 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
              <span>User Dashboard Active</span>
            </span>
          </div>

          <form onSubmit={handleUpdateGateways} className="space-y-5">
            {/* 3 Gateway Cards in a grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* bKash Card */}
              <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 shadow-2xs hover:border-pink-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-pink-50 border border-pink-200 text-pink-700">
                    bKash (বিকাশ)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(gateways.bkash_number, 'bKash')}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedKey === 'bKash' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    bKash Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={gateways.bkash_number}
                      onChange={(e) => setGateways({ ...gateways, bkash_number: e.target.value })}
                      placeholder="017XXXXXXXX"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={gateways.bkash_type}
                    onChange={(e) => setGateways({ ...gateways, bkash_type: e.target.value })}
                    placeholder="Personal (Send Money)"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Nagad Card */}
              <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 shadow-2xs hover:border-amber-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-amber-50 border border-amber-200 text-amber-700">
                    Nagad (নগদ)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(gateways.nagad_number, 'Nagad')}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedKey === 'Nagad' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Nagad Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={gateways.nagad_number}
                      onChange={(e) => setGateways({ ...gateways, nagad_number: e.target.value })}
                      placeholder="018XXXXXXXX"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={gateways.nagad_type}
                    onChange={(e) => setGateways({ ...gateways, nagad_type: e.target.value })}
                    placeholder="Personal (Send Money)"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Rocket Card */}
              <div className="bg-white/90 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 shadow-2xs hover:border-purple-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase bg-purple-50 border border-purple-200 text-purple-700">
                    Rocket (রকেট)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(gateways.rocket_number, 'Rocket')}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedKey === 'Rocket' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Rocket Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={gateways.rocket_number}
                      onChange={(e) => setGateways({ ...gateways, rocket_number: e.target.value })}
                      placeholder="019XXXXXXXX"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Account Type
                  </label>
                  <input
                    type="text"
                    value={gateways.rocket_type}
                    onChange={(e) => setGateways({ ...gateways, rocket_type: e.target.value })}
                    placeholder="Personal (Send Money)"
                    className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* Deposit Instructions Textarea */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Deposit Guidelines &amp; Member Instructions
              </label>
              <textarea
                rows={2}
                value={gateways.deposit_instruction || ''}
                onChange={(e) => setGateways({ ...gateways, deposit_instruction: e.target.value })}
                placeholder="Send money to the designated number and paste the Transaction ID (TrxID) below."
                className="w-full px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs resize-none"
              />
              <p className="text-[11px] text-slate-400 font-normal">
                This notice will be displayed to members on the deposit page before submitting their transaction ID.
              </p>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={savingGateways || loadingGateways}
              className="w-full py-3 bg-[#009F6B] hover:bg-[#008C5F] disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
            >
              <Save className="w-4 h-4 text-emerald-100" />
              <span>{savingGateways ? 'Updating Deposit Gateways...' : 'Save Deposit Numbers'}</span>
            </button>
          </form>
        </div>

        {/* ── 5. ADMIN LOGIN HISTORY AUDIT CARD ── */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] select-none">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Admin Login History Audit</h2>
                <p className="text-xs text-slate-500 font-normal">Security audit of all recent administrative sign-in attempts and client details.</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80">
              {historyTotal} Events Logged
            </span>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date &amp; Time</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Browser / Device</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 bg-white/40 font-medium text-slate-700">
                {historyLoading && history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#009F6B]" />
                      <span className="text-xs font-semibold">Loading login audit log...</span>
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-xs text-slate-400 font-semibold">
                      No administrative login events recorded yet.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
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
                      <td className="px-4 py-3.5">
                        <span className="bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-lg font-bold text-slate-800 text-[11px]">
                          {item.ip_address || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="flex items-center space-x-1.5 truncate max-w-[240px]" title={item.user_agent}>
                          <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate font-medium">{parseUserAgent(item.user_agent)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {item.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#009F6B] border border-emerald-200/80">
                            <CheckCircle2 className="w-3 h-3" />
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/80">
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

          {/* Pagination Controls */}
          {historyTotalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-medium">
                Page <strong className="text-slate-900">{historyPage}</strong> of <strong className="text-slate-900">{historyTotalPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage <= 1}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1 cursor-pointer transition-all shadow-2xs active:scale-[0.98]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                  disabled={historyPage >= historyTotalPages}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1 cursor-pointer transition-all shadow-2xs active:scale-[0.98]"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

     

      </div>
    </div>
  );
}
