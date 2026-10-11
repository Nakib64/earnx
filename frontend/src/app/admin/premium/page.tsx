'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { PremiumPackage } from '../../../types';
import {
  Crown,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  Tv,
  Save,
  BarChart3,
  Percent,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { AlertBanner } from '../../../components/common/AlertBanner';

export default function AdminPremiumPage() {
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PremiumPackage | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    original_price: '',
    discount_percent: '',
    price: '',
    daily_reward_amount: '',
    daily_ads_count: '30',
    direct_referral_commission: '500',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<PremiumPackage[]>('/premium/admin/packages', {
      isAdmin: true,
      skipCache: true,
      forceRefresh: true,
    });
    if (res.success && res.data) {
      setPackages(res.data);
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to fetch packages' });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleOpenCreate = () => {
    setEditingPkg(null);
    setFormData({
      title: '',
      description: '',
      original_price: '',
      discount_percent: '',
      price: '',
      daily_reward_amount: '',
      daily_ads_count: '30',
      direct_referral_commission: '500',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (pkg: PremiumPackage) => {
    setEditingPkg(pkg);
    setFormData({
      title: pkg.title,
      description: pkg.description || '',
      original_price: pkg.original_price ? String(pkg.original_price) : '',
      discount_percent: pkg.discount_percent ? String(pkg.discount_percent) : '',
      price: String(pkg.price),
      daily_reward_amount: String(pkg.daily_reward_amount),
      daily_ads_count: String(pkg.daily_ads_count),
      direct_referral_commission: pkg.direct_referral_commission !== undefined && pkg.direct_referral_commission !== null ? String(pkg.direct_referral_commission) : '0',
      is_active: pkg.is_active,
    });
    setModalOpen(true);
  };

  const handlePriceChange = (val: string) => {
    const orig = parseFloat(formData.original_price);
    const p = parseFloat(val);
    let disc = formData.discount_percent;
    if (!isNaN(orig) && !isNaN(p) && orig > p && orig > 0) {
      disc = String(Math.round(((orig - p) / orig) * 100));
    }
    setFormData({ ...formData, price: val, discount_percent: disc });
  };

  const handleOriginalPriceChange = (val: string) => {
    const orig = parseFloat(val);
    const p = parseFloat(formData.price);
    let disc = formData.discount_percent;
    if (!isNaN(orig) && !isNaN(p) && orig > p && orig > 0) {
      disc = String(Math.round(((orig - p) / orig) * 100));
    }
    setFormData({ ...formData, original_price: val, discount_percent: disc });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlertMsg(null);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
      discount_percent: formData.discount_percent ? parseInt(formData.discount_percent, 10) : 0,
      price: parseFloat(formData.price),
      daily_reward_amount: parseFloat(formData.daily_reward_amount),
      daily_ads_count: parseInt(formData.daily_ads_count, 10),
      direct_referral_commission: formData.direct_referral_commission ? parseFloat(formData.direct_referral_commission) : 0,
      is_active: formData.is_active,
    };

    let res;
    if (editingPkg) {
      res = await apiFetch(`/premium/admin/packages/${editingPkg.id}`, {
        method: 'PATCH',
        isAdmin: true,
        body: JSON.stringify(payload),
      });
    } else {
      res = await apiFetch('/premium/admin/packages', {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify(payload),
      });
    }

    if (res.success) {
      setAlertMsg({
        type: 'success',
        text: editingPkg ? 'Package updated successfully!' : 'Package created successfully!',
      });
      setModalOpen(false);
      fetchPackages();
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to save package' });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    const res = await apiFetch(`/premium/admin/packages/${id}`, {
      method: 'DELETE',
      isAdmin: true,
    });

    if (res.success) {
      setAlertMsg({ type: 'success', text: `Package "${title}" deleted successfully.` });
      fetchPackages();
    } else {
      setAlertMsg({ type: 'error', text: res.error?.message || 'Failed to delete package' });
    }
  };

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        {/* ── 1. PAGE HEADER (Sitting directly on background per Design System) ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            {/* Eyebrow Label */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
              VIP Membership &amp; Tier Configuration
            </div>

            {/* Prominent Main Heading */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Premium Membership Packages
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Configure VIP membership tiers, daily ad watch limits, reward payout rates, and promotional discounts.
            </p>

            {/* Operational Status Indicator */}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                Active Tier Matrix &bull;{' '}
                <strong className="text-slate-900 font-semibold">
                  {packages.length} Packages Configured ({packages.filter((p) => p.is_active).length} Active)
                </strong>
              </span>
            </div>
          </div>

          {/* Secondary Actions with Liquid Glassmorphism */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/ads-analytics"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#009F6B]" />
              <span>Ads Analytics</span>
            </Link>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>New Package</span>
            </button>

            <button
              onClick={fetchPackages}
              disabled={loading}
              className="p-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-slate-600 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              title="Refresh Packages"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Alert Notification */}
        {alertMsg && (
          <AlertBanner
            type={alertMsg.type}
            message={alertMsg.text}
            onClose={() => setAlertMsg(null)}
          />
        )}

        {/* ── 2. TOP 4 KPI SUMMARY CARDS (Matches User Dashboard Boxes) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Active Packages */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Packages</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                <Crown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {packages.filter((p) => p.is_active).length}
                <span className="text-xs font-medium text-slate-400 ml-1">/ {packages.length}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Available to members
              </span>
            </div>
          </div>

          {/* Card 2: Avg Package Price */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Average Price</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                ৳
                {packages.length > 0
                  ? (
                      packages.reduce((acc, p) => acc + Number(p.price || 0), 0) / packages.length
                    ).toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : '0'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Across membership tiers
              </span>
            </div>
          </div>

          {/* Card 3: Total Daily Reward Yield */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Combined Daily Pool</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-sky-700 tabular-nums">
                ৳
                {packages
                  .reduce((acc, p) => acc + Number(p.daily_reward_amount || 0), 0)
                  .toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Sum of tier yields
              </span>
            </div>
          </div>

          {/* Card 4: Avg Ads / Day */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Avg Ads / Day</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Tv className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-purple-700 tabular-nums">
                {packages.length > 0
                  ? Math.round(
                      packages.reduce((acc, p) => acc + Number(p.daily_ads_count || 0), 0) /
                        packages.length
                    )
                  : 30}{' '}
                Ads
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Default quota limit
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. PACKAGES GRID (Liquid Glassmorphism) ── */}
        {loading ? (
          <div className="py-24 flex flex-col justify-center items-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#009F6B]" />
            <p className="text-xs font-semibold text-slate-500">Loading VIP packages...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-12 text-center space-y-3">
            <Crown className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Packages Created</h3>
            <p className="text-xs text-slate-500">
              Click &quot;New Package&quot; to configure your first premium VIP membership tier.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold shadow-sm cursor-pointer inline-flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Package</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map((pkg) => {
              const rewardPerAd = (
                Number(pkg.daily_reward_amount) / (pkg.daily_ads_count || 1)
              ).toFixed(2);
              const hasDiscount =
                pkg.original_price && Number(pkg.original_price) > Number(pkg.price);

              return (
                <div
                  key={pkg.id}
                  className="bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_12px_32px_rgba(15,23,42,0.05)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-6 flex flex-col justify-between space-y-5 hover:bg-white/90 hover:shadow-lg transition-all relative overflow-hidden group"
                >
                  {/* Subtle Ambient Radial Mesh Sheen */}
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/[0.05] rounded-full blur-2xl pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{pkg.title}</h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                              pkg.is_active
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {pkg.is_active ? 'Active' : 'Inactive'}
                          </span>
                          {pkg.discount_percent && pkg.discount_percent > 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200/80">
                              {pkg.discount_percent}% OFF
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="w-10 h-10 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-center text-amber-500 shrink-0 shadow-2xs">
                        <Crown className="w-5 h-5 text-amber-500 fill-amber-400/20" />
                      </div>
                    </div>

                    {pkg.description && (
                      <p className="text-xs font-medium text-slate-500 leading-relaxed">{pkg.description}</p>
                    )}

                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100/90 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-500">Membership Price:</span>
                        <div className="text-right">
                          {hasDiscount && (
                            <span className="text-[11px] font-semibold text-slate-400 line-through mr-1.5">
                              ৳{Number(pkg.original_price).toLocaleString()}
                            </span>
                          )}
                          <strong className="text-slate-900 font-bold text-sm">
                            ৳{Number(pkg.price).toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-500">Daily Reward Pool:</span>
                        <strong className="text-[#009F6B] font-bold">
                          ৳{Number(pkg.daily_reward_amount).toLocaleString()}
                        </strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-500">Daily Ads Quota:</span>
                        <strong className="text-slate-900 font-bold">{pkg.daily_ads_count} Ads</strong>
                      </div>

                      <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/60">
                        <span className="font-medium text-slate-500">Reward Rate:</span>
                        <span className="text-[#009F6B] font-bold">৳{rewardPerAd} / ad</span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 px-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs">
                        <span className="font-bold text-amber-900 flex items-center gap-1">
                          <Crown className="w-3.5 h-3.5 text-amber-600" />
                          Direct Refer Commission:
                        </span>
                        <strong className="text-amber-800 font-bold text-sm">
                          ৳{Number(pkg.direct_referral_commission || 0).toLocaleString()}
                        </strong>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                        <span>Validity Period:</span>
                        <span className="font-semibold">{pkg.duration_days || 365} Days (1 Year)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 relative z-10">
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200/80 hover:bg-white font-bold text-xs text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Package</span>
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id, pkg.title)}
                      className="p-2.5 rounded-xl border border-rose-200/80 text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors shadow-2xs"
                      title="Delete Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── 4. PACKAGE CREATE / EDIT MODAL (Liquid Glassmorphism) ── */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-150">
            <div className="bg-white/95 backdrop-blur-2xl rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)] border border-slate-100 space-y-5 relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <span>{editingPkg ? 'Edit VIP Package' : 'Create VIP Package'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Package Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diamond VIP Package"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of perks..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-medium text-slate-900 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Original Price (৳)</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 10000"
                      value={formData.original_price}
                      onChange={(e) => handleOriginalPriceChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 65"
                      value={formData.discount_percent}
                      onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Discounted Price (৳)</label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      placeholder="e.g. 3500"
                      value={formData.price}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Daily Reward (৳)</label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      placeholder="e.g. 30"
                      value={formData.daily_reward_amount}
                      onChange={(e) => setFormData({ ...formData, daily_reward_amount: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Daily Ads Quota</label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="e.g. 30"
                      value={formData.daily_ads_count}
                      onChange={(e) => setFormData({ ...formData, daily_ads_count: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 flex flex-col justify-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 rounded text-[#009F6B] focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-700">Active Membership</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                      <span>Direct Referral Commission (৳)</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                      Direct Sponsor Reward
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    placeholder="e.g. 500, 800"
                    value={formData.direct_referral_commission}
                    onChange={(e) => setFormData({ ...formData, direct_referral_commission: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-amber-300 focus:border-amber-500 rounded-xl text-xs font-bold text-slate-900 outline-none transition-all shadow-2xs"
                  />
                  <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                    Fixed commission instantly credited to the direct sponsor whenever a member purchases this specific package.
                  </p>
                </div>

                {formData.daily_reward_amount && formData.daily_ads_count && (
                  <div className="p-3 bg-emerald-50/90 rounded-2xl border border-emerald-200/80 text-xs text-emerald-800 flex items-center justify-between font-bold">
                    <span>Calculated Per-Ad Rate:</span>
                    <span className="font-bold text-[#009F6B]">
                      ৳
                      {(
                        parseFloat(formData.daily_reward_amount) /
                        (parseInt(formData.daily_ads_count, 10) || 1)
                      ).toFixed(2)}{' '}
                      / ad
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5 transition-all"
                  >
                    {saving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{editingPkg ? 'Update Package' : 'Create Package'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
