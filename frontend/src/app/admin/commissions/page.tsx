'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { Layers, Plus, Trash2, Save, Check } from 'lucide-react';

export default function AdminCommissionsPage() {
  const { admin } = useAuth();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [type, setType] = useState<'ACTIVATION' | 'PREMIUM'>('ACTIVATION');
  const [level, setLevel] = useState(1);
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRules = async () => {
    try {
      const data = await apiFetch('/admin/commissions/rules', { isAdmin: true });
      setRules(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (admin) fetchRules();
  }, [admin]);

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/admin/commissions/rules', {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({
          type,
          level: Number(level),
          amount: parseFloat(amount),
        }),
      });
      setAmount('');
      await fetchRules();
    } catch (e: any) {
      alert(e.message || 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this commission rule?')) return;
    try {
      await apiFetch(`/admin/commissions/rules/${id}`, { method: 'DELETE', isAdmin: true });
      await fetchRules();
    } catch (e: any) {
      alert(e.message || 'Failed to delete rule');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Commission Rules Matrix</h1>
        <p className="text-xs text-slate-500 mt-1">
          Define multi-level tree commission payout amounts per depth level for Activation & Premium upgrades
        </p>
      </div>

      {/* Add / Edit Form */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
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
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
            >
              <option value="ACTIVATION">ACTIVATION</option>
              <option value="PREMIUM">PREMIUM</option>
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
              Payout Amount ($)
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

      {/* Rules Display Table */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Active Rules Configured</h3>

        {loading ? (
          <div className="text-xs text-slate-400 py-4 text-center">Loading rules...</div>
        ) : rules.length === 0 ? (
          <div className="text-xs text-slate-400 py-4 text-center">No commission rules defined yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-2">Type</th>
                  <th className="pb-3 px-2">Level Depth</th>
                  <th className="pb-3 px-2">Reward Payout</th>
                  <th className="pb-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-2 font-bold">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                          r.type === 'ACTIVATION'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-bold font-mono text-slate-900">
                      Level {r.level}
                    </td>
                    <td className="py-3 px-2 font-extrabold text-emerald-600 font-mono text-sm">
                      ${Number(r.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDeleteRule(r.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
