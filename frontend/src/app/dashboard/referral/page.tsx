'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { Search, X, Users, GitBranch, Copy, Check, Crown, Share2 } from 'lucide-react';
import { UserBreadcrumbs } from '../../../components/users/UserBreadcrumbs';
import { useReferralOrchestrator } from '../../../hooks/orchestrators';
import { useDesignSystem } from '../../../context/DesignSystemContext';
import { GlassCard } from '../../../components/design-system/GlassCard';
import {
  ReferralTreeTable,
  ReferralSkeleton,
} from '../../../components/referral';

function ReferralContent() {
  const { isLoading: forceSkeletonLoading } = useDesignSystem();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    state: {
      searchTerm,
      debouncedSearch,
      breadcrumbs,
      currentParent,
      loading,
      treeByParent,
      allMembers,
    },
    computed: {
      user,
      displayMembers,
    },
    actions: {
      setSearchTerm,
      handleRowClick,
      handleBreadcrumbClick,
    },
  } = useReferralOrchestrator();

  if (forceSkeletonLoading || (loading && allMembers.length === 0)) {
    return <ReferralSkeleton />;
  }

  const referralCode = user?.referral_code || '—';
  const directReferralsCount = user?.id ? (treeByParent.get(user.id)?.length || 0) : 0;
  const totalTeamCount = allMembers.length;
  const isPremium = Boolean(user?.is_premium);

  const handleCopyCode = () => {
    if (referralCode && referralCode !== '—') {
      navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyInviteLink = () => {
    if (typeof window !== 'undefined' && referralCode && referralCode !== '—') {
      const link = `${window.location.origin}/register?ref=${referralCode}`;
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto animate-fade-in select-none">
      {/* 1. Compact, Clearly Structured Page Header (sitting directly on background) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
            Affiliate &amp; Network
          </div>

          <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900  leading-tight">
            Affiliate Team &amp; Referral Tree
          </h1>

          <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
            Monitor direct sponsored referrals, explore multi-tier downline structure, and track network growth.
          </p>

          <div className="pt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <span className={`w-2 h-2 rounded-full ${isPremium ? 'bg-[#009F6B]' : 'bg-slate-400'}`} />
              Status:{' '}
              <strong className="text-slate-900 font-semibold">
                {isPremium ? 'VIP Partner' : 'Standard Member'}
              </strong>
            </span>
          </div>
        </div>

        {/* Secondary Actions with Liquid Glassmorphism */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={handleCopyInviteLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#009F6B]" />
                <span className="text-[#009F6B] font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Invite Link</span>
              </>
            )}
          </button>

          <Link
            href="/dashboard/premium"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Membership</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI Summary Cards (Max 2 Content Rule: Top Label + Icon, Bottom Value) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Box 1: Direct Referrals */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Direct Referrals</span>
            <Users className="w-4 h-4 text-[#009F6B]" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {loading && allMembers.length === 0 ? '...' : directReferralsCount}
          </span>
        </div>

        {/* Box 2: Total Team Size */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Downline Network</span>
            <GitBranch className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl sm:text-3xl font-bold text-purple-700 tabular-nums">
            {loading && allMembers.length === 0 ? '...' : totalTeamCount}
          </span>
        </div>

        {/* Box 3: Referral Code with 1-Tap Copy */}
        <div
          onClick={handleCopyCode}
          className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all cursor-pointer group"
          title="Click to copy referral code"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Referral Code</span>
            {copiedCode ? (
              <Check className="w-4 h-4 text-[#009F6B]" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400 group-hover:text-[#009F6B] transition-colors" />
            )}
          </div>
          <span className="text-xl sm:text-2xl font-bold text-[#009F6B] tracking-wide">
            {copiedCode ? 'Copied!' : referralCode}
          </span>
        </div>

        {/* Box 4: Account Tier */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Commission Tier</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">
            {isPremium ? 'Level 5 VIP' : 'Level 1 Free'}
          </span>
        </div>
      </div>

      {/* 3. Breadcrumb Trail (if drilled down) */}
      {(allMembers.length > 0 || breadcrumbs.length > 1) && (
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl p-4">
          <UserBreadcrumbs breadcrumbs={breadcrumbs} onBreadcrumbClick={handleBreadcrumbClick} />
        </div>
      )}

      {/* 4. Search Bar Input (Liquid Glass) */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          id="referral-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search member by name, phone, or referral code..."
          className="w-full pl-11 pr-10 py-3 bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/20 transition-all placeholder:text-slate-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 5. Main Referral Tree Table in Liquid Glass Container */}
      <ReferralTreeTable
        displayMembers={displayMembers}
        treeByParent={treeByParent}
        loading={loading && allMembers.length === 0}
        searchTerm={debouncedSearch}
        currentParentName={currentParent?.name || 'Member'}
        isDrilledDown={breadcrumbs.length > 1}
        onRowClick={handleRowClick}
      />
    </div>
  );
}

export default function ReferralPage() {
  return (
    <Suspense fallback={<ReferralSkeleton />}>
      <ReferralContent />
    </Suspense>
  );
}
