'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { InvestmentPlan, UserInvestment } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  TrendingUp,
  Plus,
  Trash2,
  RefreshCw,
  Users,
} from 'lucide-react';

export default function AdminInvestmentsPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    min_amount: 10000,
    max_amount: 50000,
    monthly_return_percent: 5,
    duration_months: 12,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [plansRes, invRes] = await Promise.all([
      apiFetch<InvestmentPlan[]>('/investments/admin/plans', { isAdmin: true }),
      apiFetch<UserInvestment[]>('/investments/admin/all', { isAdmin: true }),
    ]);
    if (plansRes.success && plansRes.data) setPlans(plansRes.data);
    if (invRes.success && invRes.data) setUserInvestments(invRes.data);
    setLoading(false);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const res = await apiFetch('/investments/admin/plans', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify(formData),
    });

    if (res.success) {
      setMessage({ type: 'success', text: 'Investment plan created successfully!' });
      setShowModal(false);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to create plan' });
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investment plan?')) return;
    const res = await apiFetch(`/investments/admin/plans/${id}`, {
      method: 'DELETE',
      isAdmin: true,
    });
    if (res.success) {
      fetchData();
    } else {
      alert(res.error?.message || 'Failed to delete plan');
    }
  };

  const handleTriggerPayouts = async () => {
    setTriggering(true);
    setMessage(null);
    const res = await apiFetch<{ processedCount: number }>('/investments/admin/trigger-payouts', {
      method: 'POST',
      isAdmin: true,
    });

    if (res.success && res.data) {
      setMessage({
        type: 'success',
        text: `Processed monthly investment return payouts for ${res.data.processedCount} user investments!`,
      });
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to process payouts' });
    }
    setTriggering(false);
  };

  const userInvestmentColumns: ColumnDef<UserInvestment>[] = [
    {
      key: 'user',
      header: 'User',
      render: (inv) => (
        <span className="font-semibold text-slate-900">
          {inv.user?.full_name || inv.user?.phone || 'User'}
        </span>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (inv) => <span>{inv.plan?.title || 'Investment Plan'}</span>,
    },
    {
      key: 'amount',
      header: 'Invested Amount',
      render: (inv) => <span className="font-bold text-sky-600">৳{Number(inv.amount).toLocaleString()}</span>,
    },
    {
      key: 'monthly_return_percent',
      header: 'Return Rate',
      render: (inv) => <span className="font-medium text-emerald-600">{Number(inv.monthly_return_percent)}% / mo</span>,
    },
    {
      key: 'monthly_payout_amount',
      header: 'Monthly Payout',
      render: (inv) => <span className="font-bold text-slate-900">৳{Number(inv.monthly_payout_amount).toLocaleString()}</span>,
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (inv) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          {inv.total_payouts_made} / {inv.max_payouts} payouts
        </span>
      ),
    },
    {
      key: 'next_payout_at',
      header: 'Next Payout',
      align: 'right',
      render: (inv) => (
        <span className="text-slate-500">
          {inv.next_payout_at ? new Date(inv.next_payout_at).toLocaleDateString() : 'Finished'}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-6 h-6 text-sky-600" />
            <span>Investment Plans & Returns</span>
          </h1>
          <p className="text-xs text-slate-500">Configure dividend packages and process monthly returns.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleTriggerPayouts}
            disabled={triggering}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${triggering ? 'animate-spin' : ''}`} />
            <span>{triggering ? 'Processing...' : 'Run Monthly Return Payouts'}</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Investment Plan</span>
          </button>
        </div>
      </div>

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Existing Plans */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">Active Investment Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{plan.title}</h3>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {Number(plan.monthly_return_percent)}% Monthly Return
                  </span>
                </div>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="text-rose-500 hover:text-rose-700 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p>Range: ৳{Number(plan.min_amount).toLocaleString()} - ৳{Number(plan.max_amount).toLocaleString()}</p>
                <p>Duration: {plan.duration_months} Months</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Investments Table using DataTable */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
          <Users className="w-5 h-5 text-sky-600" />
          <span>User Active Investments</span>
        </h2>

        <DataTable<UserInvestment>
          data={userInvestments}
          columns={userInvestmentColumns}
          keyExtractor={(inv) => inv.id}
          loading={loading}
          emptyMessage="No user investments recorded yet."
        />
      </div>

      {/* Add Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePlan}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Create Investment Plan</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Plan Title (e.g. Silver 10K Plan)</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Min Amount (৳)</label>
                  <input
                    type="number"
                    required
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label>Max Amount (৳)</label>
                  <input
                    type="number"
                    required
                    value={formData.max_amount}
                    onChange={(e) => setFormData({ ...formData, max_amount: Number(e.target.value) })}
                    className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label>Monthly Return (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.monthly_return_percent}
                    onChange={(e) =>
                      setFormData({ ...formData, monthly_return_percent: Number(e.target.value) })
                    }
                    className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label>Duration (Months)</label>
                  <input
                    type="number"
                    required
                    value={formData.duration_months}
                    onChange={(e) =>
                      setFormData({ ...formData, duration_months: Number(e.target.value) })
                    }
                    className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md"
              >
                Save Plan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
