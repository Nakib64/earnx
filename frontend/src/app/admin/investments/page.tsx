'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { InvestmentPlan, UserInvestment, RequestStatus } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  TrendingUp,
  Plus,
  Trash2,
  RefreshCw,
  Users,
  UserPlus,
  Search,
  DollarSign,
  ChevronRight,
  X,
  Eye,
  Clock,
  CheckCircle2,
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
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // View Detail Modal
  const [viewInvestment, setViewInvestment] = useState<UserInvestment | null>(null);
  const [payingOut, setPayingOut] = useState(false);

  // Form state for creating plans
  const [formData, setFormData] = useState({
    title: '',
    amount: 10000,
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

  // Modal User Search
  const [modalUserSearch, setModalUserSearch] = useState('');
  const [modalUsers, setModalUsers] = useState<SimpleUser[]>([]);
  const [modalUserPage, setModalUserPage] = useState(1);
  const [modalUserTotalPages, setModalUserTotalPages] = useState(1);
  const [loadingModalUsers, setLoadingModalUsers] = useState(false);
  const [loadingMoreModalUsers, setLoadingMoreModalUsers] = useState(false);
  const [selectedUserObj, setSelectedUserObj] = useState<SimpleUser | null>(null);

  // Payout table
  const [searchQuery, setSearchQuery] = useState('');
  const [payoutFilter, setPayoutFilter] = useState<'ALL' | 'DUE'>('ALL');

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

  const fetchModalUsers = async (query = '', page = 1, append = false) => {
    if (page === 1) setLoadingModalUsers(true);
    else setLoadingMoreModalUsers(true);

    const res = await apiFetch<any>(
      `/admin/users?page=${page}&limit=15&search=${encodeURIComponent(query)}`,
      { isAdmin: true },
    );

    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : res.data.data || [];
      const totalP = res.data.meta?.totalPages || 1;

      if (append) {
        setModalUsers((prev) => [...prev, ...list]);
      } else {
        setModalUsers(list);
        if (list.length > 0 && !selectedUserObj) {
          setSelectedUserObj(list[0]);
          setAssignForm((prev) => ({ ...prev, userId: list[0].id }));
        }
      }
      setModalUserPage(page);
      setModalUserTotalPages(totalP);
    }
    setLoadingModalUsers(false);
    setLoadingMoreModalUsers(false);
  };

  useEffect(() => {
    if (showAssignModal) fetchModalUsers(modalUserSearch, 1, false);
  }, [showAssignModal]);

  const handleModalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setModalUserSearch(q);
    fetchModalUsers(q, 1, false);
  };

  const handleModalScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 30 && !loadingMoreModalUsers && modalUserPage < modalUserTotalPages) {
      fetchModalUsers(modalUserSearch, modalUserPage + 1, true);
    }
  };

  useEffect(() => {
    if (plans.length > 0 && !assignForm.planId) {
      const firstPlan = plans[0];
      setAssignForm((prev) => ({ ...prev, planId: firstPlan.id, amount: Number(firstPlan.min_amount) }));
    }
  }, [plans]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const res = await apiFetch('/investments/admin/plans', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({ ...formData, min_amount: formData.amount, max_amount: formData.amount }),
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
      body: JSON.stringify({ userId: assignForm.userId, planId: assignForm.planId, amount: assignForm.amount }),
    });
    if (res.success) {
      setMessage({ type: 'success', text: 'Investment package assigned to user!' });
      setShowAssignModal(false);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to assign package' });
    }
    setSubmittingAssign(false);
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Delete this investment plan?')) return;
    const res = await apiFetch(`/investments/admin/plans/${id}`, { method: 'DELETE', isAdmin: true });
    if (res.success) fetchData();
    else alert(res.error?.message || 'Failed to delete plan');
  };

  const handleTriggerPayouts = async () => {
    setTriggering(true);
    setMessage(null);
    const res = await apiFetch<{ processedCount: number }>('/investments/admin/trigger-payouts', { method: 'POST', isAdmin: true });
    if (res.success && res.data) {
      setMessage({ type: 'success', text: `Processed payouts for ${res.data.processedCount} investments!` });
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to process payouts' });
    }
    setTriggering(false);
  };

  const handlePayoutSingle = async (invId: string) => {
    if (!confirm('Process monthly dividend payout for this investment?')) return;
    setPayingOut(true);
    setMessage(null);
    const res = await apiFetch<{ processedCount: number }>('/investments/admin/payout-selected', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({ investment_ids: [invId] }),
    });
    if (res.success) {
      setMessage({ type: 'success', text: 'Payout processed successfully!' });
      setViewInvestment(null);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to process payout' });
    }
    setPayingOut(false);
  };

  const filteredInvestments = userInvestments.filter((inv) => {
    if (inv.status !== RequestStatus.APPROVED) return false;
    if (payoutFilter === 'DUE') {
      if (!inv.next_payout_at) return false;
      if (new Date(inv.next_payout_at) > new Date()) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (inv.user?.full_name || '').toLowerCase().includes(q) ||
      (inv.user?.phone || '').toLowerCase().includes(q) ||
      (inv.plan?.title || '').toLowerCase().includes(q)
    );
  });

  const pendingCount = userInvestments.filter((i) => i.status === RequestStatus.PENDING).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

      {message && <AlertBanner type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Dark Emerald & Gold Luxury Header Banner */}
      <div className="bg-gradient-to-r from-[#01281a] via-[#011f15] to-[#00170f] border border-[#d4af37]/35 rounded-2xl p-5 sm:p-6 text-white shadow-xl space-y-3">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#023322] border border-[#d4af37]/50 flex items-center justify-center shrink-0 shadow-md">
            <TrendingUp className="w-6 h-6 text-[#f3ba2f]" />
          </div>
          <div className="space-y-1 flex-1">
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">Investment Plans & Returns</h1>
            <p className="text-xs text-slate-300 font-semibold">Configure dividend packages, assign to users, and process returns.</p>
          </div>
          <span className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-[#03442e] text-amber-200 border border-[#d4af37]/40 font-mono shrink-0 hidden sm:inline-flex">
            {plans.length} Plans
          </span>
        </div>

        <div className="border-t border-[#053d29] pt-3 flex flex-wrap gap-2">
          <button
            onClick={handleTriggerPayouts}
            disabled={triggering}
            className="py-2.5 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${triggering ? 'animate-spin' : ''}`} />
            <span>{triggering ? 'Processing...' : 'Run Global Payouts'}</span>
          </button>
          <button onClick={() => setShowAssignModal(true)} className="py-2.5 px-4 bg-[#023322] hover:bg-[#03442e] text-amber-200 font-extrabold text-xs rounded-xl flex items-center space-x-2 transition-all border border-[#d4af37]/35 cursor-pointer">
            <UserPlus className="w-4 h-4" />
            <span>Assign Package</span>
          </button>
          <button onClick={() => setShowModal(true)} className="py-2.5 px-4 bg-[#023322] hover:bg-[#03442e] text-amber-200 font-extrabold text-xs rounded-xl flex items-center space-x-2 transition-all border border-[#d4af37]/35 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Add Plan</span>
          </button>
        </div>
      </div>

      {/* Pending Approvals Link Card */}
      {pendingCount > 0 && (
        <Link
          href="/admin/investments/actions"
          className="bg-gradient-to-br from-[#2a1a03] to-[#140b01] border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg text-white hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/50 flex items-center justify-center text-[#f3ba2f] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black text-amber-200">{pendingCount} Pending Approval{pendingCount > 1 ? 's' : ''}</div>
              <div className="text-xs font-semibold text-slate-300">New investments, upgrades & withdrawals awaiting review</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#f3ba2f] shrink-0" />
        </Link>
      )}

      {/* Active Plans Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900">Active Investment Plans</h2>
        </div>

        <div className="space-y-3">
          {plans.map((plan) => (
            <div key={plan.id} className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between transition-all group">
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-black text-slate-800">{plan.title}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-black text-[#01281a] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">{Number(plan.monthly_return_percent)}% /mo</span>
                    <span className="text-[10px] font-black text-slate-600 font-mono">৳{Number(plan.amount || plan.min_amount).toLocaleString()}</span>
                    {plan.is_lifetime ? (
                      <span className="text-[10px] font-extrabold text-[#854D0E] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">Lifetime</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500">{plan.duration_months} Months</span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => handleDeletePlan(plan.id)} className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-all shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {plans.length === 0 && <p className="text-center text-slate-400 text-xs py-6">No investment plans created yet.</p>}
        </div>
      </div>

      {/* Dividend Payouts Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Dividend Payouts</h2>
              <p className="text-[11px] font-medium text-slate-400">Active approved investments</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setPayoutFilter('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${payoutFilter === 'ALL' ? 'bg-[#005A36] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              All ({userInvestments.filter((i) => i.status === RequestStatus.APPROVED).length})
            </button>
            <button
              onClick={() => setPayoutFilter('DUE')}
              className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all ${payoutFilter === 'DUE' ? 'bg-amber-100 text-[#854D0E] border border-amber-300 shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Due Now ({userInvestments.filter((i) => i.status === RequestStatus.APPROVED && i.next_payout_at && new Date(i.next_payout_at) <= new Date()).length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by user name, phone, or plan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
          />
        </div>

        {/* Minimal Clean Table (compact, no x-scroll) */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[9px]">
              <tr>
                <th className="px-2.5 py-2">User</th>
                <th className="px-2.5 py-2">Plan</th>
                <th className="px-2.5 py-2 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
              {loading ? (
                <tr><td colSpan={3} className="p-4 text-center text-slate-400 text-xs">Loading investments...</td></tr>
              ) : filteredInvestments.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-slate-400 text-xs">No investments found.</td></tr>
              ) : (
                filteredInvestments.map((inv) => {
                  const isDue = inv.next_payout_at && new Date(inv.next_payout_at) <= new Date();
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-2.5 py-2">
                        <p className="font-extrabold text-slate-900 text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-[150px]">{inv.user?.full_name || inv.user?.phone || 'User'}</p>
                        <p className="text-slate-500 font-mono text-[9px]">{inv.user?.phone}</p>
                      </td>
                      <td className="px-2.5 py-2">
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="font-extrabold text-slate-900 text-[10px] sm:text-xs">{inv.plan?.title || 'Plan'}</span>
                          {isDue && (
                            <span className="text-[7.5px] font-extrabold text-[#854D0E] bg-amber-50 px-1 py-0.5 rounded border border-amber-200">DUE</span>
                          )}
                          {(inv.is_lifetime || inv.plan?.is_lifetime) && (
                            <span className="text-[7.5px] font-extrabold text-primary bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">∞</span>
                          )}
                        </div>
                      </td>
                      <td className="px-2.5 py-2 text-right">
                        <button
                          onClick={() => setViewInvestment(inv)}
                          className="py-1 px-2.5 bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-[9px] sm:text-[10px] rounded-lg shadow-xs transition-all inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3 h-3 text-secondary" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Link to Actions */}
      <Link
        href="/admin/investments/actions"
        className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-800">All User Investments & Actions</div>
            <div className="text-[11px] font-medium text-slate-400">Approve, reject, and manage records</div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
      </Link>

      {/* Detail Modal */}
      {viewInvestment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-xl border border-slate-200/90 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Investment Details</h3>
              </div>
              <button onClick={() => setViewInvestment(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Investor</span>
              <p className="font-extrabold text-slate-900 text-sm">{viewInvestment.user?.full_name || 'Anonymous'}</p>
              <p className="text-[11px] text-slate-500 font-mono">{viewInvestment.user?.phone}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-sans">Plan</p>
                <p className="text-sm font-black text-slate-900 mt-0.5 font-sans">{viewInvestment.plan?.title || 'Investment'}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-sans">Invested</p>
                <p className="text-sm font-black text-primary font-mono mt-0.5">৳{Number(viewInvestment.amount).toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-sans">Monthly Return</p>
                <p className="text-sm font-black text-slate-900 mt-0.5 font-sans">{Number(viewInvestment.monthly_return_percent)}%</p>
                <p className="text-[10px] font-extrabold text-primary font-mono">৳{Number(viewInvestment.monthly_payout_amount).toLocaleString()}/mo</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-sans">Payouts Made</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{viewInvestment.total_payouts_made}</p>
              </div>
            </div>

            {viewInvestment.next_payout_at && (
              <button
                onClick={() => handlePayoutSingle(viewInvestment.id)}
                disabled={payingOut}
                className="w-full py-3.5 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-black text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-emerald-900/10"
              >
                <DollarSign className="w-4 h-4 text-secondary" />
                <span>{payingOut ? 'Processing...' : `Process Payout — ৳${Number(viewInvestment.monthly_payout_amount).toLocaleString()}`}</span>
              </button>
            )}

            <button onClick={() => setViewInvestment(null)} className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Assign Package Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAssignPlanToUser} className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-xl border border-slate-200/90 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Assign Package</h3>
              </div>
              <button type="button" onClick={() => setShowAssignModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {selectedUserObj && (
              <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Selected User</span>
                <p className="font-extrabold text-slate-900 text-xs">{selectedUserObj.full_name || 'Anonymous'}</p>
                <p className="text-[11px] text-slate-500 font-mono">{selectedUserObj.phone}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Search & Select User</label>
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" />
                <input type="text" placeholder="Search..." value={modalUserSearch} onChange={handleModalSearchChange}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-xs" />
              </div>
              <div onScroll={handleModalScroll} className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200 p-2 bg-slate-50/50">
                {modalUsers.map((u) => (
                  <div key={u.id} onClick={() => { setSelectedUserObj(u); setAssignForm((prev) => ({ ...prev, userId: u.id })); }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${selectedUserObj?.id === u.id ? 'bg-emerald-50 border-primary/30 text-slate-900 font-bold shadow-sm' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                    <div>
                      <p className="font-extrabold text-slate-900">{u.full_name || 'Anonymous'}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{u.phone}</p>
                    </div>
                    <span className="font-mono text-[11px] font-extrabold text-primary bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">{u.referral_code}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Investment Plan</label>
              <select required value={assignForm.planId} onChange={(e) => { const p = plans.find((pl) => pl.id === e.target.value); setAssignForm({ ...assignForm, planId: e.target.value, amount: p ? Number(p.min_amount) : 10000 }); }}
                className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-xs">
                {plans.map((p) => <option key={p.id} value={p.id}>{p.title} (৳{Number(p.amount || p.min_amount).toLocaleString()})</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Amount (৳)</label>
              <div className="relative">
                <DollarSign className="w-5 h-5 text-primary absolute left-3.5 top-3" />
                <input type="number" required value={assignForm.amount} onChange={(e) => setAssignForm({ ...assignForm, amount: Number(e.target.value) })}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button type="button" onClick={() => setShowAssignModal(false)} className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200">Cancel</button>
              <button type="submit" disabled={submittingAssign || !selectedUserObj} className="py-2.5 px-4 bg-[#005A36] hover:bg-[#044D2F] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-sm">{submittingAssign ? 'Assigning...' : 'Assign'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Create Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreatePlan} className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-xl border border-slate-200/90">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0"><Plus className="w-4 h-4" /></div>
                <h3 className="text-base font-black text-slate-900">Create Investment Plan</h3>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Plan Title</label>
                <input type="text" required placeholder="e.g. Silver 10K Plan" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Package Amount (৳)</label>
                <div className="relative">
                  <DollarSign className="w-5 h-5 text-primary absolute left-3.5 top-3" />
                  <input type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Monthly Return (%)</label>
                <div className="relative">
                  <TrendingUp className="w-5 h-5 text-primary absolute left-3.5 top-3" />
                  <input type="number" step="0.1" required value={formData.monthly_return_percent} onChange={(e) => setFormData({ ...formData, monthly_return_percent: Number(e.target.value) })}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="is_lifetime" checked={formData.is_lifetime} onChange={(e) => setFormData({ ...formData, is_lifetime: e.target.checked })} className="w-4 h-4 accent-[#005A36]" />
                  <label htmlFor="is_lifetime" className="text-xs font-extrabold text-slate-800 cursor-pointer">Lifetime Package (Unlimited Returns)</label>
                </div>
                {!formData.is_lifetime && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 font-bold">Duration (Months)</label>
                    <input type="number" required={!formData.is_lifetime} value={formData.duration_months} onChange={(e) => setFormData({ ...formData, duration_months: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button type="button" onClick={() => setShowModal(false)} className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl border border-slate-200">Cancel</button>
              <button type="submit" className="py-2.5 px-4 bg-[#005A36] hover:bg-[#044D2F] text-white font-extrabold text-xs rounded-xl shadow-sm">Save Plan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
