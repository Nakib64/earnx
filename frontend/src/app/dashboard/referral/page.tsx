'use client';

import React, { Suspense } from 'react';
import { Search, X } from 'lucide-react';
import { UserBreadcrumbs } from '../../../components/users/UserBreadcrumbs';
import { useReferralOrchestrator } from '../../../hooks/orchestrators';
import {
  ReferralHeaderCard,
  ReferralTreeTable,
} from '../../../components/referral';

function ReferralContent() {
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
      userPhoto,
      designationStars,
      displayMembers,
    },
    actions: {
      setSearchTerm,
      handleImageUpload,
      handleRowClick,
      handleBreadcrumbClick,
    },
  } = useReferralOrchestrator();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Profile Header Card */}
      <ReferralHeaderCard
        user={user}
        userPhoto={userPhoto}
        designationStars={designationStars}
        onImageUpload={handleImageUpload}
      />

      {/* Breadcrumb Trail Card */}
      {(allMembers.length > 0 || breadcrumbs.length > 1) && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm">
          <UserBreadcrumbs breadcrumbs={breadcrumbs} onBreadcrumbClick={handleBreadcrumbClick} />
        </div>
      )}

      {/* Search Bar Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="text"
          id="referral-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search member by name, phone, or user id..."
          className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200/90 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
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

      {/* Main Referral Tree Table */}
      <ReferralTreeTable
        displayMembers={displayMembers}
        treeByParent={treeByParent}
        loading={loading}
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
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm">Loading referral tree...</div>}>
      <ReferralContent />
    </Suspense>
  );
}
