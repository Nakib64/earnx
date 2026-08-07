'use client';

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api';
import { InvestmentPlan, UserInvestment, RequestStatus } from '../../../types';
import { DataTable, ColumnDef } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  TrendingUp,
  Plus,
  Trash2,
  RefreshCw,
  Users,
  CheckCircle,
  XCircle,
  UserPlus,
  Search,
  CheckSquare,
  Square,
  DollarSign,
} from 'lucide-react';

interface SimpleUser {
  id: string;
  full_name: string | null;
  phone: string;
  referral_code: string;
}

export default function AdminInvestmentsPage() {
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [allUsers, setAllUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state for creating plans
  const [formData, setFormData] = useState({
    title: '',
    min_amount: 10000,
    max_amount: 50000,
    monthly_return_percent: 5,
    duration_months: 12,
    is_lifetime: false,
  });

  // Form state for assigning plan to user
  const [assignForm, setAssignForm] = useState({
    userId: '',
    planId: '',
    amount: 10000,
  });
  const [submittingAssign, setSubmittingAssign] = useState(false);

  // Multi-select & Targeted Payout State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvestmentIds, setSelectedInvestmentIds] = useState<string[]>([]);
  const [submittingTargetedPayout, setSubmittingTargetedPayout] = useState(false);

  useEffect(() => {
    fetchData();
    fetchUsers();
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

  const fetchUsers = async () => {
    const res = await apiFetch<any>('/admin/users?page=1&limit=200', { isAdmin: true });
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : res.data.data || [];
      setAllUsers(list);
      if (list.length > 0) setAssignForm((prev) => ({ ...prev, userId: list[0].id }));
    }
  };

  useEffect(() => {
    if (plans.length > 0 && !assignForm.planId) {
      const firstPlan = plans[0];
      setAssignForm((prev) => ({
        ...prev,
        planId: firstPlan.id,
        amount: Number(firstPlan.min_amount),
      }));
    }
  }, [plans]);

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

  const handleAssignPlanToUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.userId || !assignForm.planId) return;

    setSubmittingAssign(true);
    setMessage(null);

    const res = await apiFetch('/investments/admin/create-for-user', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({
        userId: assignForm.userId,
        planId: assignForm.planId,
        amount: assignForm.amount,
      }),
    });

    if (res.success) {
      setMessage({ type: 'success', text: 'Investment package successfully assigned to user!' });
      setShowAssignModal(false);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to assign package' });
    }
    setSubmittingAssign(false);
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

  const handleApproveInvestment = async (id: string) => {
    setMessage(null);
    const res = await apiFetch(`/investments/admin/investments/${id}/approve`, {
      method: 'POST',
      isAdmin: true,
    });
    if (res.success) {
      setMessage({ type: 'success', text: 'User investment approved successfully!' });
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to approve investment' });
    }
  };

  const handleRejectInvestment = async (id: string) => {
    if (!confirm('Are you sure you want to reject this user investment request?')) return;
    setMessage(null);
    const res = await apiFetch(`/investments/admin/investments/${id}/reject`, {
      method: 'POST',
      isAdmin: true,
    });
    if (res.success) {
      setMessage({ type: 'success', text: 'User investment rejected.' });
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to reject investment' });
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user investment record?')) return;
    const res = await apiFetch(`/investments/admin/investments/${id}`, {
      method: 'DELETE',
      isAdmin: true,
    });
    if (res.success) {
      fetchData();
    } else {
      alert(res.error?.message || 'Failed to delete user investment');
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

  // Targeted Payout Handler
  const handlePayoutSelected = async () => {
    if (selectedInvestmentIds.length === 0) return;
    if (!confirm(`Are you sure you want to process monthly dividend payouts for ${selectedInvestmentIds.length} selected investment(s)?`)) return;

    setSubmittingTargetedPayout(true);
    setMessage(null);

    const res = await apiFetch<{ processedCount: number }>('/investments/admin/payout-selected', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({ investment_ids: selectedInvestmentIds }),
    });

    if (res.success && res.data) {
      setMessage({
        type: 'success',
        text: `Successfully processed monthly dividend payouts for ${res.data.processedCount} selected investment(s)!`,
      });
      setSelectedInvestmentIds([]);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to process targeted payouts' });
    }
    setSubmittingTargetedPayout(false);
  };

  // Filter investments for search & selection
  const filteredInvestments = userInvestments.filter((inv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const userName = (inv.user?.full_name || '').toLowerCase();
    const userPhone = (inv.user?.phone || '').toLowerCase();
    const planTitle = (inv.plan?.title || '').toLowerCase();
    return userName.includes(q) || userPhone.includes(q) || planTitle.includes(q);
  });

  const allSelected = filteredInvestments.length > 0 && selectedInvestmentIds.length === filteredInvestments.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedInvestmentIds([]);
    } else {
      setSelectedInvestmentIds(filteredInvestments.map((inv) => inv.id));
    }
  };

  const handleToggleInvestment = (id: string) => {
    if (selectedInvestmentIds.includes(id)) {
      setSelectedInvestmentIds(selectedInvestmentIds.filter((invId) => invId !== id));
    } else {
      setSelectedInvestmentIds([...selectedInvestmentIds, id]);
    }
  };

  const userInvestmentColumns: ColumnDef<UserInvestment>[] = [
    {
      key: 'user',
      header: 'User',
      render: (inv) => (
        <div>
          <p className="font-semibold text-slate-900">{inv.user?.full_name || 'User'}</p>
          <p className="text-xs text-slate-500">{inv.user?.phone}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (inv) => (
        <div>
          <span className="font-medium text-slate-900">{inv.plan?.title || 'Custom Plan'}</span>
          {inv.is_lifetime || inv.plan?.is_lifetime ? (
            <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              Lifetime
            </span>
          ) : null}
        </div>
      ),
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
          {inv.is_lifetime || inv.plan?.is_lifetime
            ? `${inv.total_payouts_made} payouts (Lifetime)`
            : `${inv.total_payouts_made} / ${inv.max_payouts || 12} payouts`}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (inv) => (
        <div className="flex items-center justify-end space-x-2">
          {inv.status === RequestStatus.PENDING && (
            <>
              <button
                onClick={() => handleApproveInvestment(inv.id)}
                title="Approve Investment"
                className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-bold text-xs flex items-center space-x-1 border border-emerald-200"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleRejectInvestment(inv.id)}
                title="Reject Investment"
                className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg font-bold text-xs flex items-center space-x-1 border border-amber-200"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </>
          )}
          <button
            onClick={() => handleDeleteInvestment(inv.id)}
            title="Delete Record"
            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
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
          <p className="text-xs text-slate-500">Configure dividend packages, assign packages to users, and process monthly returns.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTriggerPayouts}
            disabled={triggering}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${triggering ? 'animate-spin' : ''}`} />
            <span>{triggering ? 'Processing...' : 'Run Global Payouts'}</span>
          </button>

          <button
            onClick={() => setShowAssignModal(true)}
            className="py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Assign Package to User</span>
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
                <p>
                  Duration:{' '}
                  {plan.is_lifetime ? (
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                      Lifetime
                    </span>
                  ) : (
                    `${plan.duration_months} Months`
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Targeted / Specific Investment Dividend Payout Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Targeted / Specific User Dividend Payouts</span>
            </h2>
            <p className="text-xs text-slate-500">
              Search active user investments, select specific investments via checkboxes, and process immediate dividend payouts to their wallets.
            </p>
          </div>

          {selectedInvestmentIds.length > 0 && (
            <button
              onClick={handlePayoutSelected}
              disabled={submittingTargetedPayout}
              className="py-2.5 px-5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center space-x-2 shadow-md shadow-purple-600/20"
            >
              <DollarSign className="w-4 h-4" />
              <span>
                {submittingTargetedPayout
                  ? 'Processing Payouts...'
                  : `Payout Dividends to Selected (${selectedInvestmentIds.length})`}
              </span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search investment by user name, phone, or plan title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900"
          />
        </div>

        {/* Table of User Investments with Checkboxes */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 w-10 text-center">
                  <button onClick={handleToggleSelectAll} type="button" className="text-slate-500 hover:text-slate-800">
                    {allSelected ? <CheckSquare className="w-4 h-4 text-purple-600" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="p-3">User</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Invested Amount</th>
                <th className="p-3">Monthly Payout</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Loading investments...
                  </td>
                </tr>
              ) : filteredInvestments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    No user investments found matching your query.
                  </td>
                </tr>
              ) : (
                filteredInvestments.map((inv) => {
                  const isSelected = selectedInvestmentIds.includes(inv.id);
                  return (
                    <tr
                      key={inv.id}
                      onClick={() => handleToggleInvestment(inv.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-purple-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleToggleInvestment(inv.id)} type="button">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{inv.user?.full_name || 'User'}</p>
                        <p className="text-slate-500 text-[11px]">{inv.user?.phone}</p>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-900">{inv.plan?.title || 'Investment Plan'}</span>
                        {inv.is_lifetime || inv.plan?.is_lifetime ? (
                          <span className="ml-1.5 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                            Lifetime
                          </span>
                        ) : null}
                      </td>
                      <td className="p-3 font-bold text-sky-600">৳{Number(inv.amount).toLocaleString()}</td>
                      <td className="p-3 font-bold text-slate-900">৳{Number(inv.monthly_payout_amount).toLocaleString()}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                          {inv.is_lifetime || inv.plan?.is_lifetime
                            ? `${inv.total_payouts_made} payouts (Lifetime)`
                            : `${inv.total_payouts_made} / ${inv.max_payouts || 12} payouts`}
                        </span>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Investments & Approvals Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
          <Users className="w-5 h-5 text-sky-600" />
          <span>All User Investments & Actions</span>
        </h2>

        <DataTable<UserInvestment>
          data={userInvestments}
          columns={userInvestmentColumns}
          keyExtractor={(inv) => inv.id}
          loading={loading}
          emptyMessage="No user investments recorded yet."
        />
      </div>

      {/* Manually Assign Package to User Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAssignPlanToUser}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Assign Package to User</h3>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label>Select User</label>
                <select
                  required
                  value={assignForm.userId}
                  onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                  className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 bg-white"
                >
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || 'User'} ({u.phone}) - {u.referral_code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Select Investment Plan</label>
                <select
                  required
                  value={assignForm.planId}
                  onChange={(e) => {
                    const pId = e.target.value;
                    const p = plans.find((pl) => pl.id === pId);
                    setAssignForm({
                      ...assignForm,
                      planId: pId,
                      amount: p ? Number(p.min_amount) : 10000,
                    });
                  }}
                  className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 bg-white"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({Number(p.monthly_return_percent)}% / mo - {p.is_lifetime ? 'Lifetime' : `${p.duration_months} Mos`})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Investment Amount (৳)</label>
                <input
                  type="number"
                  required
                  value={assignForm.amount}
                  onChange={(e) => setAssignForm({ ...assignForm, amount: Number(e.target.value) })}
                  className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 bg-white"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAssign}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow-md disabled:opacity-50"
              >
                {submittingAssign ? 'Assigning...' : 'Assign Package'}
              </button>
            </div>
          </form>
        </div>
      )}

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

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_lifetime"
                    checked={formData.is_lifetime}
                    onChange={(e) =>
                      setFormData({ ...formData, is_lifetime: e.target.checked })
                    }
                    className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                  />
                  <label htmlFor="is_lifetime" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Lifetime Package (Unlimited Monthly Returns)
                  </label>
                </div>

                {!formData.is_lifetime && (
                  <div>
                    <label className="text-slate-600">Duration (Months)</label>
                    <input
                      type="number"
                      required={!formData.is_lifetime}
                      value={formData.duration_months}
                      onChange={(e) =>
                        setFormData({ ...formData, duration_months: Number(e.target.value) })
                      }
                      className="w-full mt-1 p-2.5 border border-slate-300 rounded-xl font-medium text-slate-900 bg-white"
                    />
                  </div>
                )}
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
