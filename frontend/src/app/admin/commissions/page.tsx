'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { CommissionRule, CommissionType } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Plus, Trash2, Save } from 'lucide-react';

export default function AdminCommissionsPage() {
  const { admin } = useAuth();
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [type, setType] = useState<CommissionType>(CommissionType.ACTIVATION);
  const [level, setLevel] = useState(1);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    const res = await apiFetch<CommissionRule[]>('/admin/commissions/rules', { isAdmin: true });
    if (res.success && res.data) {
      setRules(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (admin) fetchRules();
  }, [admin]);

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await apiFetch('/admin/commissions/rules', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({
        type,
        level: Number(level),
        amount: parseFloat(amount),
      }),
    });

    if (res.success) {
      setAmount('');
      await fetchRules();
    } else {
      alert(res.error?.message || 'Failed to save rule');
    }
    setSaving(false);
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this commission rule?')) return;
    const res = await apiFetch(`/admin/commissions/rules/${id}`, {
      method: 'DELETE',
      isAdmin: true,
    });
    if (res.success) {
      await fetchRules();
    } else {
      alert(res.error?.message || 'Failed to delete rule');
    }
  };

  const columns: ColumnDef<CommissionRule>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (r) => <StatusBadge status={r.type} />,
    },
    {
      key: 'level',
      header: 'Level Depth',
      render: (r) => <span className="font-bold font-mono text-slate-900">Level {r.level}</span>,
    },
    {
      key: 'amount',
      header: 'Reward Payout',
      render: (r) => <span className="font-extrabold text-emerald-600 font-mono text-sm">৳{Number(r.amount).toFixed(2)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <button
          onClick={() => handleDeleteRule(r.id)}
          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100"
          title="Delete Rule"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Commission Rules Matrix</h1>
        <p className="text-xs text-slate-500 mt-1">
          Define multi-level tree commission payout amounts per depth level for Activation & Premium upgrades
        </p>
      </div>

      {/* Add / Edit Form */}
      <div className="glass-card rounded-2xl p-6 space-y-4 bg-white border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Plus className="w-4 h-4 text-sky-500" />
          <span>Add or Update Commission Rule</span>
        </h3>

        <form onSubmit={handleSaveRule} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Commission Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CommissionType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
            >
              <option value={CommissionType.ACTIVATION}>ACTIVATION</option>
              <option value={CommissionType.PREMIUM}>PREMIUM</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tree Level Depth (1, 2, 3...)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              required
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Payout Amount (৳)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="sky-gradient-btn py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Rule'}</span>
          </button>
        </form>
      </div>

      {/* Rules Display Table using DataTable */}
      <div className="glass-card rounded-2xl p-5 space-y-4 bg-white border border-slate-200">
        <h3 className="font-bold text-slate-900 text-sm">Active Rules Configured</h3>

        <DataTable<CommissionRule>
          data={rules}
          columns={columns}
          keyExtractor={(r) => r.id}
          loading={loading}
          emptyMessage="No commission rules defined yet."
        />
      </div>
    </div>
  );
}
