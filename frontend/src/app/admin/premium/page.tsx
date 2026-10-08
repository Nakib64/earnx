'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../lib/api';
import { PremiumPackage } from '../../../types';
import {
  Crown,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Search,
  DollarSign,
  Tv,
  Save,
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
    price: '',
    daily_reward_amount: '',
    daily_ads_count: '6',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<PremiumPackage[]>('/premium/admin/packages', { isAdmin: true });
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
      price: '',
      daily_reward_amount: '',
      daily_ads_count: '6',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (pkg: PremiumPackage) => {
    setEditingPkg(pkg);
    setFormData({
      title: pkg.title,
      description: pkg.description || '',
      price: String(pkg.price),
      daily_reward_amount: String(pkg.daily_reward_amount),
      daily_ads_count: String(pkg.daily_ads_count),
      is_active: pkg.is_active,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlertMsg(null);

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      price: parseFloat(formData.price),
      daily_reward_amount: parseFloat(formData.daily_reward_amount),
      daily_ads_count: parseInt(formData.daily_ads_count, 10),
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Premium Package Management
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Configure membership tiers, daily watch ad counts, and reward payouts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005A36] hover:bg-[#044D2F] text-white text-xs font-black transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Package</span>
          </button>
          <button
            onClick={fetchPackages}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {alertMsg && (
        <AlertBanner
          type={alertMsg.type}
          message={alertMsg.text}
          onClose={() => setAlertMsg(null)}
        />
      )}

      {/* Packages Grid */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <RefreshCw className="w-8 h-8 animate-spin text-[#005A36]" />
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Crown className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-800">No Packages Created</h3>
          <p className="text-xs text-slate-500">
            Click &quot;New Package&quot; to configure your first premium VIP membership tier.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-[#005A36] text-white text-xs font-black shadow-md cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Package</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{pkg.title}</h3>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase mt-1 ${
                        pkg.is_active
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {pkg.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-black">
                    ৳
                  </div>
                </div>

                {pkg.description && (
                  <p className="text-xs font-medium text-slate-500">{pkg.description}</p>
                )}

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-500">Membership Fee:</span>
                    <strong className="text-slate-900 font-black">
                      ৳{Number(pkg.price).toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-500">Daily Reward:</span>
                    <strong className="text-emerald-700 font-black">
                      ৳{Number(pkg.daily_reward_amount).toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-500">Daily Ads Count:</span>
                    <strong className="text-slate-900 font-black">{pkg.daily_ads_count} Ads</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(pkg)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(pkg.id, pkg.title)}
                  className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Delete Package"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Package Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                {editingPkg ? 'Edit Premium Package' : 'Create Premium Package'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Package Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold VIP Package"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[#005A36]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of perks..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">Price (৳ BDT)</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 1000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">Daily Reward (৳ BDT)</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 50"
                    value={formData.daily_reward_amount}
                    onChange={(e) => setFormData({ ...formData, daily_reward_amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-700">Daily Ads to Watch</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 6"
                    value={formData.daily_ads_count}
                    onChange={(e) => setFormData({ ...formData, daily_ads_count: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 rounded text-[#005A36] focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Active Status</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#005A36] hover:bg-[#044D2F] text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
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
  );
}
