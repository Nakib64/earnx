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
  ArrowLeft,
  Calendar,
  Lock,
  Unlock,
  Percent,
  Wallet,
  ShieldCheck,
  Sparkles,
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

  // Form state for creating plans (Time-basis packages with min_amount)
  const [formData, setFormData] = useState({
    title: '',
    min_amount: 1000,
    monthly_return_percent: 10,
    duration_months: 3,
    is_lifetime: false,
  });

  // Form state for assigning plan to user
  const [assignForm, setAssignForm] = useState({
    userId: '',
    planId: '',
    amount: 5000,
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
    if (
      scrollTop + clientHeight >= scrollHeight - 30 &&
      !loadingMoreModalUsers &&
      modalUserPage < modalUserTotalPages
    ) {
      fetchModalUsers(modalUserSearch, modalUserPage + 1, true);
    }
  };

  useEffect(() => {
    if (plans.length > 0 && !assignForm.planId) {
      const firstPlan = plans[0];
      setAssignForm((prev) => ({
        ...prev,
        planId: firstPlan.id,
        amount: Number(firstPlan.min_amount || firstPlan.amount || 1000),
      }));
    }
  }, [plans]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const minAmt = Number(formData.min_amount);
    const res = await apiFetch('/investments/admin/plans', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({
        title: formData.title.trim(),
        min_amount: minAmt,
        amount: minAmt,
        monthly_return_percent: Number(formData.monthly_return_percent),
        duration_months: formData.is_lifetime ? null : Number(formData.duration_months),
        is_lifetime: formData.is_lifetime,
      }),
    });
    if (res.success) {
      setMessage({ type: 'success', text: 'Time-basis investment plan created successfully!' });
      setShowModal(false);
      setFormData({
        title: '',
        min_amount: 1000,
        monthly_return_percent: 10,
        duration_months: 3,
        is_lifetime: false,
      });
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
      setMessage({ type: 'success', text: 'Investment package assigned to user successfully!' });
      setShowAssignModal(false);
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Failed to assign package' });
    }
    setSubmittingAssign(false);
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investment plan?')) return;
    const res = await apiFetch(`/investments/admin/plans/${id}`, { method: 'DELETE', isAdmin: true });
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
        text: `Processed monthly returns for ${res.data.processedCount} user investments! Credited directly to cash wallets.`,
      });
      fetchData();
    } else {
      setMessage({ type: 'error', text: res.error?.message || 'Payout processing failed' });
    }
    setTriggering(false);
  };

  const handlePayoutSingle = async (invId: string) => {
    if (!confirm('Process monthly interest dividend payout for this investment?')) return;
    setPayingOut(true);
    setMessage(null);
    const res = await apiFetch<{ processedCount: number }>('/investments/admin/payout-selected', {
      method: 'POST',
      isAdmin: true,
      body: JSON.stringify({ investment_ids: [invId] }),
    });
    if (res.success) {
      setMessage({ type: 'success', text: 'Monthly interest payout credited to member wallet successfully!' });
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

  // KPI Metrics Calculation
  const totalActiveCapital = userInvestments
    .filter((i) => i.status === RequestStatus.APPROVED)
    .reduce((sum, i) => sum + Number(i.amount || 0), 0);

  const activePortfoliosCount = userInvestments.filter((i) => i.status === RequestStatus.APPROVED).length;

  const duePayoutsCount = userInvestments.filter(
    (i) => i.status === RequestStatus.APPROVED && i.next_payout_at && new Date(i.next_payout_at) <= new Date(),
  ).length;

  const totalMonthlyCommitment = userInvestments
    .filter((i) => i.status === RequestStatus.APPROVED)
    .reduce((sum, i) => sum + Number(i.monthly_payout_amount || 0), 0);

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16 font-[family-name:var(--font-montserrat)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        
        {/* ── 1. PAGE HEADER (Sitting directly on background) ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl select-none">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Capital Assets &amp; Scheduled Dividends
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Investment Packages &amp; Returns
            </h1>
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Configure time-basis packages (3 mo, 6 mo, 1 yr), enforce capital locks, assign to users, and disburse monthly profits directly to member wallets.
            </p>
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Dashboard</span>
            </Link>

            <button
              onClick={handleTriggerPayouts}
              disabled={triggering}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
              title="Disburse due monthly dividend returns"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#009F6B] ${triggering ? 'animate-spin' : ''}`} />
              <span>{triggering ? 'Disbursing...' : 'Run Global Payouts'}</span>
            </button>

            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5 text-purple-600" />
              <span>Assign to User</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 text-emerald-100" />
              <span>Create Package</span>
            </button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {message && (
          <AlertBanner
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        )}

        {/* ── 2. SUMMARY KPI STATS CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 select-none">
          {/* Card 1: Active Invested Capital */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Invested Capital</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#009F6B] tabular-nums truncate block">
                ৳{totalActiveCapital.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Locked member principal
              </span>
            </div>
          </div>

          {/* Card 2: Active Portfolios */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Portfolios</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {activePortfoliosCount} Portfolios
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Approved & earning yield
              </span>
            </div>
          </div>

          {/* Card 3: Due Dividend Payouts */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Payouts Due Now</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">
                {duePayoutsCount} Due
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Eligible for monthly return
              </span>
            </div>
          </div>

          {/* Card 4: Monthly Dividend Commitment */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Monthly Payout Flow</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-sky-700 tabular-nums truncate block">
                ৳{totalMonthlyCommitment.toLocaleString()} / mo
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Direct to cash wallets
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. PENDING APPROVALS ALERT CARD (if any) ── */}
        {pendingCount > 0 && (
          <Link
            href="/admin/investments/actions"
            className="block bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shrink-0">
                  <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-950">
                    {pendingCount} Pending Investment Request{pendingCount > 1 ? 's' : ''} Awaiting Review
                  </div>
                  <div className="text-xs text-amber-800/80 font-medium">
                    Review and approve new subscriptions, upgrades, and matured capital withdrawal requests.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-900 group-hover:translate-x-0.5 transition-transform shrink-0">
                <span>Manage Requests</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        )}

        {/* ── 4. ACTIVE INVESTMENT PACKAGES SECTION ── */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Active Time-Basis Packages
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/80">
                    {plans.length} Configured
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Fixed-tenure investment packages configured for members (e.g. 3 Months at 10%/mo, 6 Months at 20%/mo).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#009F6B] border border-emerald-200 text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Package</span>
            </button>
          </div>

          {/* Package Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const minAmt = Number(plan.min_amount || plan.amount || 1000);
              const returnPct = Number(plan.monthly_return_percent);
              const duration = plan.is_lifetime ? 'Lifetime' : `${plan.duration_months || 3} Months`;
              const totalReturnPct = plan.is_lifetime ? 'Unlimited' : `${returnPct * (plan.duration_months || 1)}%`;

              return (
                <div
                  key={plan.id}
                  className="bg-white/90 border border-slate-200/80 hover:border-emerald-200 rounded-2xl p-5 space-y-4 shadow-2xs transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 truncate">
                        {plan.title}
                      </h3>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200/80">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Tenure: <strong>{duration}</strong></span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pricing & Return metrics */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Min. Investment
                      </span>
                      <span className="text-base font-bold text-slate-900 tabular-nums">
                        ৳{minAmt.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-0.5">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Monthly Interest
                      </span>
                      <span className="text-base font-bold text-[#009F6B] tabular-nums">
                        +{returnPct}% / mo
                      </span>
                    </div>
                  </div>

                  {/* Policy Highlights */}
                  <div className="space-y-1 text-[11px] font-medium text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Total Tenure Yield:</span>
                      <span className="font-bold text-slate-900">{totalReturnPct}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Capital Lock:</span>
                      <span className="font-bold text-amber-700">🔒 Enforced Until End</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Monthly Payout:</span>
                      <span className="font-bold text-[#009F6B]">Direct to Wallet</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {plans.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs font-medium">
                No investment packages created yet. Click &quot;Create Package&quot; to configure your first time-basis plan.
              </div>
            )}
          </div>
        </div>

        {/* ── 5. DIVIDEND PAYOUTS AUDIT & DISPATCH TABLE ── */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Dividend Payouts &amp; Member Portfolios
                </h2>
                <p className="text-xs text-slate-500 font-normal">
                  Real-time status of active member investments, tenure lock expiration, and scheduled monthly dividends.
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setPayoutFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  payoutFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Portfolios ({userInvestments.filter((i) => i.status === RequestStatus.APPROVED).length})
              </button>
              <button
                onClick={() => setPayoutFilter('DUE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  payoutFilter === 'DUE'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Due for Payout ({duePayoutsCount})</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search member by name, phone, or package title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Member Details</th>
                  <th className="px-4 py-3">Package &amp; Capital</th>
                  <th className="px-4 py-3">Monthly Return</th>
                  <th className="px-4 py-3">Tenure &amp; Payouts</th>
                  <th className="px-4 py-3">Lock Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredInvestments.map((inv) => {
                  const isLocked = Boolean(inv.ends_at && new Date() < new Date(inv.ends_at));
                  const isDue = Boolean(inv.next_payout_at && new Date(inv.next_payout_at) <= new Date());
                  const lockDateStr = inv.ends_at
                    ? new Date(inv.ends_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : null;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{inv.user?.full_name || 'Member'}</div>
                        <div className="text-[11px] text-slate-500 tabular-nums">{inv.user?.phone}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{inv.plan?.title || 'Custom Plan'}</div>
                        <div className="text-xs font-bold text-[#009F6B] tabular-nums">
                          ৳{Number(inv.amount).toLocaleString()} Capital
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#009F6B] tabular-nums">
                          +{Number(inv.monthly_return_percent)}% / mo
                        </div>
                        <div className="text-[11px] text-slate-500 tabular-nums">
                          ৳{Number(inv.monthly_payout_amount).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">
                          {inv.total_payouts_made} / {inv.max_payouts || 12} Months
                        </div>
                        {inv.next_payout_at && (
                          <div className={`text-[10px] font-semibold tabular-nums ${isDue ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                            {isDue ? '⚡ Due Now' : `Next: ${new Date(inv.next_payout_at).toLocaleDateString()}`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                            <Lock className="w-3 h-3 text-amber-600" />
                            <span>Locked ({lockDateStr})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            <Unlock className="w-3 h-3 text-emerald-600" />
                            <span>Matured</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => setViewInvestment(inv)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        {isDue && (
                          <button
                            onClick={() => handlePayoutSingle(inv.id)}
                            disabled={payingOut}
                            className="px-2.5 py-1.5 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold cursor-pointer transition-all inline-flex items-center gap-1 active:scale-[0.98]"
                          >
                            <span>Pay Dividend</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredInvestments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs font-medium">
                      {searchQuery
                        ? 'No active investments match your search criteria.'
                        : payoutFilter === 'DUE'
                        ? 'No dividend payouts are due at this moment.'
                        : 'No approved user investments recorded yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── CREATE PLAN MODAL ── */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleCreatePlan}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200/90 animate-in fade-in zoom-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Create Investment Package</h3>
                    <p className="text-xs text-slate-500 font-normal">Define tenure, monthly interest, and minimum investment</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Plan Title */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Package Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3 Months Growth Plan"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>

                {/* Minimum Investment Amount */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Minimum Investment Capital (BDT) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">৳</span>
                    <input
                      type="number"
                      required
                      min={100}
                      value={formData.min_amount}
                      onChange={(e) => setFormData({ ...formData, min_amount: Number(e.target.value) })}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Duration Months (Time-Basis) */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Package Duration (Months Lock) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[3, 6, 12].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setFormData({ ...formData, duration_months: m, is_lifetime: false })}
                        className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                          formData.duration_months === m && !formData.is_lifetime
                            ? 'border-[#009F6B] bg-[#009F6B] text-white font-bold shadow-2xs'
                            : 'border-slate-200 bg-slate-50/70 text-slate-700 font-semibold hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs">{m} Months</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly Return Percent */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Monthly Interest Return (% / month) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Percent className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      step="0.1"
                      required
                      min={0.1}
                      max={100}
                      value={formData.monthly_return_percent}
                      onChange={(e) => setFormData({ ...formData, monthly_return_percent: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Live Return Preview Card */}
                <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1.5 text-xs text-emerald-950">
                  <div className="flex items-center gap-1.5 font-bold text-[#009F6B]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Package Simulation Example:</span>
                  </div>
                  <p className="text-[11px] text-emerald-900 leading-relaxed font-normal">
                    A member investing <strong>৳10,000</strong> will receive{' '}
                    <strong>৳{(10000 * Number(formData.monthly_return_percent)) / 100} / month</strong> directly into their Cash Wallet for{' '}
                    <strong>{formData.duration_months} months</strong> (Total interest: ৳{
                      ((10000 * Number(formData.monthly_return_percent)) / 100) * Number(formData.duration_months)
                    }). Capital is locked until month {formData.duration_months} finishes.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                >
                  Publish Package
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── ASSIGN PACKAGE MODAL ── */}
        {showAssignModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form
              onSubmit={handleAssignPlanToUser}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200/90 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Assign Package to Member</h3>
                    <p className="text-xs text-slate-500 font-normal">Directly activate an investment portfolio for a user</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {selectedUserObj && (
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Selected Member</span>
                  <p className="font-bold text-slate-900 text-xs">{selectedUserObj.full_name || 'Anonymous'}</p>
                  <p className="text-[11px] text-slate-500 tabular-nums">{selectedUserObj.phone}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Search &amp; Select Member
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search name or phone..."
                    value={modalUserSearch}
                    onChange={handleModalSearchChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
                <div
                  onScroll={handleModalScroll}
                  className="max-h-40 overflow-y-auto space-y-1.5 rounded-2xl border border-slate-200/80 p-2 bg-slate-50/50"
                >
                  {modalUsers.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => {
                        setSelectedUserObj(u);
                        setAssignForm((prev) => ({ ...prev, userId: u.id }));
                      }}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        selectedUserObj?.id === u.id
                          ? 'bg-emerald-50 border-emerald-300 text-slate-900 font-bold shadow-2xs'
                          : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-slate-900">{u.full_name || 'Anonymous'}</p>
                        <p className="text-[11px] text-slate-500 tabular-nums">{u.phone}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#009F6B] bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {u.referral_code}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Select Investment Package
                </label>
                <select
                  required
                  value={assignForm.planId}
                  onChange={(e) => {
                    const p = plans.find((pl) => pl.id === e.target.value);
                    setAssignForm({
                      ...assignForm,
                      planId: e.target.value,
                      amount: p ? Number(p.min_amount || p.amount || 1000) : 5000,
                    });
                  }}
                  className="w-full py-2.5 px-3 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.duration_months || 3} Mo • +{Number(p.monthly_return_percent)}%/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Invested Capital Amount (BDT)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-xs">৳</span>
                  <input
                    type="number"
                    required
                    min={100}
                    value={assignForm.amount}
                    onChange={(e) => setAssignForm({ ...assignForm, amount: Number(e.target.value) })}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssign || !selectedUserObj}
                  className="py-2.5 px-4 bg-[#009F6B] hover:bg-[#008C5F] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                >
                  {submittingAssign ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── VIEW INVESTMENT DETAIL MODAL ── */}
        {viewInvestment && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200/90 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Portfolio Audit Details</h3>
                  <p className="text-xs text-slate-500 font-normal">Tenure lock, dividend cycle, and investor details</p>
                </div>
                <button
                  onClick={() => setViewInvestment(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Member Name:</span>
                    <span className="font-bold text-slate-900">{viewInvestment.user?.full_name || 'Member'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Member Phone:</span>
                    <span className="font-bold text-slate-900 tabular-nums">{viewInvestment.user?.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Package:</span>
                    <span className="font-bold text-[#009F6B]">{viewInvestment.plan?.title || 'Custom'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Invested Capital:</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      ৳{Number(viewInvestment.amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Monthly Interest:</span>
                    <span className="font-bold text-[#009F6B] tabular-nums">
                      +{Number(viewInvestment.monthly_return_percent)}% / mo (৳{Number(viewInvestment.monthly_payout_amount).toLocaleString()})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Payout Progress:</span>
                    <span className="font-bold text-slate-900">
                      {viewInvestment.total_payouts_made} / {viewInvestment.max_payouts || 12} Months
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Lock Expiration Date:</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {viewInvestment.ends_at ? new Date(viewInvestment.ends_at).toLocaleDateString() : 'Lifetime'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 space-y-0.5">
                  <p className="font-bold">🔒 Capital Lock Rule:</p>
                  <p>Invested capital is locked until tenure completes. Monthly dividends are added to the member&apos;s cash wallet directly.</p>
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setViewInvestment(null)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handlePayoutSingle(viewInvestment.id)}
                  disabled={payingOut}
                  className="flex-1 py-2.5 px-4 bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer transition-all active:scale-[0.98]"
                >
                  {payingOut ? 'Processing...' : 'Pay Dividend Now'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
