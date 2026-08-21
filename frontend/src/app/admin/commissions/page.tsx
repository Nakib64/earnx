'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { CommissionRule, CommissionType } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { Plus, Trash2, Save, Layers, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCommissionsPage() {
  const { admin } = useAuth();
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [type, setType] = useState<CommissionType>(CommissionType.PREMIUM);
  const [level, setLevel] = useState(1);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  // Deletion Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    const res = await apiFetch<CommissionRule[]>('/admin/commissions/rules', { isAdmin: true });
    if (res.success && res.data) {
      // Filter only PREMIUM commission rules
      const premiumRules = res.data.filter((r) => r.type === CommissionType.PREMIUM);
      setRules(premiumRules);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (admin) fetchRules();
  }, [admin]);

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();

    const levelNum = Number(level);
    if (levelNum < 1 || levelNum > 5) {
      toast.warning('Tree level depth must be between Level 1 and Level 5');
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

  const columns: ColumnDef<CommissionRule>[] = [
    {
      key: 'type',
      header: 'Commission Type',
      render: (r) => (
        <span className="font-bold text-xs bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full">
          PREMIUM UPGRADE
        </span>
      ),
    },
    {
      key: 'level',
      header: 'Tree Level Depth',
      render: (r) => (
        <span className="font-black font-mono text-slate-900 text-xs">
          Level {r.level} (Upline Tier {r.level})
        </span>
      ),
    },
    {
      key: 'amount_actions',
      header: 'Reward Payout',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end space-x-2">
          <span className="font-black text-[#01281a] font-mono text-xs">
            ৳{Number(r.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <button
            onClick={() => setDeletingId(r.id)}
            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Delete Rule"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Banner — Dark Emerald & Gold Luxury Banner */}
      <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-3">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center shrink-0 shadow-md">
            <Layers className="w-6 h-6 text-[#f3ba2f]" />
          </div>
          <div className="space-y-1 flex-1">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Premium Commission Rules Matrix
            </h1>
            <p className="text-xs text-slate-300 font-semibold">
              Define commission rewards for Premium Package upgrades distributed across up to 5 Upper Levels in the referral tree.
            </p>
          </div>
          <span className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-[#03442e] text-amber-200 border border-[#d4af37]/40 font-mono shrink-0 hidden sm:inline-flex">
            {rules.length} Rules Defined
          </span>
        </div>
      </div>

      {/* Add / Edit Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="w-9 h-9 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
            <Plus className="w-4 h-4" />
          </div>
          <h3 className="font-black text-slate-900 text-base">
            Configure Premium Commission Level
          </h3>
        </div>

        <form onSubmit={handleSaveRule} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Tree Level Depth (Level 1 - 5) <span className="text-rose-500">*</span>
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a]"
            >
              {[1, 2, 3, 4, 5].map((lvl) => (
                <option key={lvl} value={lvl}>
                  Level {lvl} Upline
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
              Payout Amount (৳) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="e.g. 100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Rule...' : 'Save Commission Rule'}</span>
          </button>
        </form>
      </div>

      {/* Rules Display Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="w-9 h-9 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <h3 className="font-black text-slate-900 text-base">Active Rules Configured</h3>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <DataTable<CommissionRule>
            data={rules}
            columns={columns}
            keyExtractor={(r) => r.id}
            loading={loading}
            emptyMessage="No commission rules defined yet."
          />
        </div>
      </div>

      {/* Delete Rule Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        title="Delete Commission Rule"
        message="Are you sure you want to delete this commission rule? Tree payout calculations for this level will revert to ৳0."
        confirmText="Delete Rule"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingId(null)}
      />
    </div>
  );
}
