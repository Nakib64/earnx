'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { CommissionRule, CommissionType, PremiumPackage } from '../../../types';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import {
  Layers,
  DollarSign,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  RefreshCw,
  Award,
  Crown,
  TrendingUp,
  Sparkles,
  Edit2,
  CheckCircle2,
  ArrowRight,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCommissionsPage() {
  const { admin } = useAuth();
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form State (Levels 2 to 5 only; Level 1 is on PremiumPackage)
  const [level, setLevel] = useState(2);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  // Deletion Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    const [res, pkgRes] = await Promise.all([
      apiFetch<CommissionRule[]>('/admin/commissions/rules', { isAdmin: true, skipCache: true, forceRefresh: true }),
      apiFetch<PremiumPackage[]>('/premium/admin/packages', { isAdmin: true, skipCache: true, forceRefresh: true }),
    ]);
    if (res.success && res.data) {
      // Filter only PREMIUM commission rules for indirect uplines (Levels 2 to 5)
      const premiumRules = res.data.filter((r) => r.type === CommissionType.PREMIUM && Number(r.level) >= 2);
      setRules(premiumRules);
    }
    if (pkgRes.success && pkgRes.data) {
      setPackages(pkgRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (admin) fetchRules();
  }, [admin]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRules();
      toast.info('Refreshed commission rules matrix');
    } catch {
      toast.error('Failed to refresh rules');
    } finally {
      setRefreshing(false);
    }
  };

  // Sorted rules by level ascending
  const sortedRules = useMemo(() => {
    return [...rules].sort((a, b) => Number(a.level) - Number(b.level));
  }, [rules]);

  // Derived KPIs
  const totalPayout = useMemo(() => {
    return rules.reduce((acc, r) => acc + Number(r.amount || 0), 0);
  }, [rules]);

  const indirectPool = useMemo(() => {
    return rules
      .filter((r) => Number(r.level) >= 2)
      .reduce((acc, r) => acc + Number(r.amount || 0), 0);
  }, [rules]);

  // Direct sponsor commission summary from packages
  const directCommissionDisplay = useMemo(() => {
    if (!packages || packages.length === 0) return '৳0.00';
    const amounts = packages.map((pkg) => Number(pkg.direct_referral_commission || 0));
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    if (min === max) {
      return `৳${min.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `৳${min.toLocaleString()} - ৳${max.toLocaleString()}`;
  }, [packages]);

  const level1Amount = useMemo(() => {
    if (!packages || packages.length === 0) return 0;
    return Number(packages[0]?.direct_referral_commission || 0);
  }, [packages]);

  // Quick edit rule handler
  const handleEditRule = (r: CommissionRule) => {
    if (Number(r.level) < 2) return;
    setLevel(Number(r.level));
    setAmount(String(r.amount));
    toast.info(`Editing Level ${r.level} commission rule`);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();

    const levelNum = Number(level);
    if (levelNum < 2 || levelNum > 5) {
      toast.warning('Tree level depth must be between Level 2 and Level 5. Direct sponsor is configured on packages.');
      return;
    }

    setSaving(true);
    const res = await apiFetch('/admin/commissions/rules', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({
        type: CommissionType.PREMIUM,
        level: levelNum,
        amount: parseFloat(amount),
      }),
    });

    if (res.success) {
      toast.success(`Premium Level ${levelNum} commission rule saved!`);
      setAmount('');
      await fetchRules();
    } else {
      toast.error(res.error?.message || 'Failed to save commission rule');
    }
    setSaving(false);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    const res = await apiFetch(`/admin/commissions/rules/${deletingId}`, {
      method: 'DELETE',
      isAdmin: true,
    });
    if (res.success) {
      toast.success('Commission rule deleted successfully');
      setDeletingId(null);
      await fetchRules();
    } else {
      toast.error(res.error?.message || 'Failed to delete rule');
    }
    setDeleting(false);
  };

  const getLevelBadgeInfo = (lvl: number) => {
    switch (lvl) {
      case 1:
        return {
          title: 'Direct Sponsor',
          badgeClass: 'bg-emerald-50 text-[#009F6B] border-emerald-200/80',
          dotClass: 'bg-[#009F6B]',
        };
      case 2:
        return {
          title: '2nd Gen Upline',
          badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
          dotClass: 'bg-sky-500',
        };
      case 3:
        return {
          title: '3rd Gen Upline',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
          dotClass: 'bg-indigo-500',
        };
      case 4:
        return {
          title: '4th Gen Upline',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
          dotClass: 'bg-purple-500',
        };
      case 5:
        return {
          title: '5th Gen Upline',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dotClass: 'bg-amber-500',
        };
      default:
        return {
          title: `${lvl}th Gen Upline`,
          badgeClass: 'bg-slate-50 text-slate-700 border-slate-200/80',
          dotClass: 'bg-slate-400',
        };
    }
  };

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16 font-[family-name:var(--font-montserrat)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        
        {/* ── 1. PAGE HEADER (Sitting directly on background per Design System) ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl select-none">
            {/* Eyebrow Label */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Network Compensation &amp; Multi-Tier Distribution
            </div>

            {/* Prominent Main Heading */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Premium Commission Rules Matrix
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Define affiliate commission payout amounts for Premium Package upgrades distributed across up to 5 upline levels in the referral tree.
            </p>

            {/* Operational Status Indicator */}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                Live Compensation Matrix &bull;{' '}
                <strong className="text-slate-900 font-semibold">
                  {rules.length} / 4 Upline Tiers Configured (L2-L5)
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
              disabled={loading || refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              title="Refresh Commission Matrix"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading || refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── 2. SUMMARY KPI STATS CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 select-none">
          {/* Card 1: Active Levels */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Levels</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {rules.length} <span className="text-sm font-semibold text-slate-400">/ 4</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Upline tiers (L2 - L5)
              </span>
            </div>
          </div>

          {/* Card 2: Indirect Tree Pool */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Indirect Tree Pool</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#009F6B] tabular-nums">
                ৳{indirectPool.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Total sum of L2-L5 pool
              </span>
            </div>
          </div>

          {/* Card 3: Direct Sponsor Payout */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Direct Sponsor (L1)</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Crown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">
                {directCommissionDisplay}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                {packages.length > 0 ? `Across ${packages.length} VIP packages` : 'Immediate referrer bonus'}
              </span>
            </div>
          </div>

          {/* Card 4: Configured Packages */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Configured Packages</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-sky-600 tabular-nums">
                {packages.length}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                VIP packages active
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. DIRECT SPONSOR COMMISSIONS (CONFIGURED PER PACKAGE) ── */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/80 pb-3.5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>Direct Referral Commissions</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    Package-Specific
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Direct sponsor bonus (Level 1) is configured individually per VIP package. When a user buys a package, their direct referrer earns that package's direct commission.
                </p>
              </div>
            </div>

            <Link
              href="/admin/premium"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-bold text-amber-900 transition-all shadow-2xs self-start sm:self-center shrink-0 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-amber-700" />
              <span>Configure On Packages</span>
              <ArrowRight className="w-3 h-3 text-amber-700" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70 flex items-center justify-between hover:bg-amber-50/70 transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{pkg.title}</div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Price: ৳{Number(pkg.price).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                    Direct Refer
                  </div>
                  <div className="text-base font-bold text-amber-900 tabular-nums">
                    ৳{Number(pkg.direct_referral_commission || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. CONFIGURE COMMISSION LEVEL FORM ── */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] select-none">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-3.5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Configure Commission Level Payout
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Specify the cash reward credited to upline members when a direct downline member upgrades to Premium.
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-50 text-[#009F6B] border border-emerald-200/80 hidden sm:inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#009F6B]" />
              <span>Upsert Mode</span>
            </span>
          </div>

          <form onSubmit={handleSaveRule} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Tree Level Depth (Level 2 - 5) <span className="text-rose-500">*</span>
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs cursor-pointer"
              >
                {[2, 3, 4, 5].map((lvl) => {
                  const info = getLevelBadgeInfo(lvl);
                  const existingRule = rules.find((r) => Number(r.level) === lvl);
                  return (
                    <option key={lvl} value={lvl}>
                      Level {lvl} ({info.title}) {existingRule ? `• Current: ৳${Number(existingRule.amount).toFixed(2)}` : '• Not Set'}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Payout Amount (৳ BDT) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs select-none">৳</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="e.g. 100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 px-5 bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-emerald-100" />
              <span>{saving ? 'Saving Rule...' : 'Save Commission Rule'}</span>
            </button>
          </form>
        </div>

        {/* ── 4. RULES DISPLAY TABLE CARD ── */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] select-none">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Active Commission Rules</h2>
                <p className="text-xs text-slate-400 font-medium">Configured tree level compensation distribution schedule</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80">
              {rules.length} Defined
            </span>
          </div>

          {/* Styled Table Wrapper */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Commission Type</th>
                  <th className="px-4 py-3.5">Tree Level Depth</th>
                  <th className="px-4 py-3.5">Pool Share</th>
                  <th className="px-4 py-3.5 text-right">Reward Payout</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 bg-white/40 font-medium text-slate-700">
                {loading && rules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#009F6B]" />
                      <span className="text-xs font-semibold">Loading commission rules...</span>
                    </td>
                  </tr>
                ) : sortedRules.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 font-semibold">
                      No commission rules defined yet. Use the form above to configure Level 2 to Level 5.
                    </td>
                  </tr>
                ) : (
                  sortedRules.map((r) => {
                    const info = getLevelBadgeInfo(Number(r.level));
                    const sharePct = totalPayout > 0 ? ((Number(r.amount) / totalPayout) * 100).toFixed(0) : '0';
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-[11px] bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>PREMIUM UPGRADE</span>
                          </span>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${info.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${info.dotClass}`} />
                              <span>Level {r.level}</span>
                            </span>
                            <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                              ({info.title})
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#009F6B] rounded-full transition-all"
                                style={{ width: `${sharePct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                              {sharePct}%
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-right font-bold text-[#009F6B] text-sm tabular-nums">
                          ৳{Number(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleEditRule(r)}
                              className="p-1.5 text-slate-400 hover:text-[#009F6B] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Quick Edit Level"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingId(r.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 5. DELETE RULE CONFIRMATION MODAL ── */}
        <ConfirmModal
          isOpen={!!deletingId}
          title="Delete Commission Rule"
          message="Are you sure you want to delete this commission rule? Tree payout calculations for this level will safely revert to ৳0.00."
          confirmText="Delete Rule"
          variant="danger"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingId(null)}
        />
      </div>
    </div>
  );
}
