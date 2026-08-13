'use client';

import React, { Suspense } from 'react';
import { UserStatus, User } from '../../../types';
import { DataTable } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { UserBreadcrumbs } from '../../../components/users/UserBreadcrumbs';
import { AdjustWalletModal } from '../../../components/users/AdjustWalletModal';
import { AssignDesignationModal } from '../../../components/users/AssignDesignationModal';
import { UserDetailCards } from '../../../components/users/UserDetailCards';
import { useAdminUsersPage } from '../../../hooks/useAdminUsersPage';
import { Search, RefreshCw, Users, Award, ShieldCheck, Wallet } from 'lucide-react';
import { toast } from 'sonner';

function AdminUsersContent() {
  const {
    users,
    designations,
    searchTerm,
    loading,
    breadcrumbs,
    currentParent,
    statusConfirmTarget,
    updatingStatus,
    adjustUser,
    adjusting,
    selectedUserForBadge,
    targetDesignation,
    targetSponsorId,
    allBadgedLeaders,
    savingBadge,
    userColumns,
    deleteConfirmTarget,
    deletingUser,
    selectedUserForCards,
    setSearchTerm,
    setTargetDesignation,
    setTargetSponsorId,
    setStatusConfirmTarget,
    setAdjustUser,
    setSelectedUserForBadge,
    setDeleteConfirmTarget,
    handleDeleteUserConfirm,
    handleRowClick,
    handleBreadcrumbClick,
    handleStatusChangeConfirm,
    handleBalanceAdjustSubmit,
    handleAssignDesignation,
    openBadgeModal,
    openStatusConfirmModal,
    loadData,
  } = useAdminUsersPage();

  const totalMembers = users.length;
  const badgedLeadersCount = users.filter((u) => !!u.designation).length;
  const activeAccountsCount = users.filter((u) => u.status === 'ACTIVE').length;
  const totalNetworkBalance = users.reduce((acc, u) => acc + Number(u.wallet_balance || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

      {/* Top Banner — Coins Page Theme */}
      <div className="bg-[#005A36] rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700/60 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-secondary" />
          </div>
          <div className="space-y-1 flex-1">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
              Badged Leaders & Referral Network
            </h1>
            <p className="text-xs text-emerald-100/80 font-medium">
              Explore referral tree networks, assign leader badges, adjust balances, and manage account statuses.
            </p>
          </div>
          <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-emerald-700/50 text-secondary border border-emerald-500/30 font-mono shrink-0 hidden sm:inline-flex">
            {totalMembers} Members
          </span>
        </div>

        {/* Action Controls */}
        <div className="border-t border-emerald-700/60 pt-3 flex items-center justify-between">
          <button
            onClick={() => {
              loadData();
              toast.info('Refreshed user data');
            }}
            className="py-2 px-4 bg-secondary hover:bg-[#B89628] text-slate-950 font-black text-xs rounded-xl flex items-center space-x-2 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Network Data</span>
          </button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-widest">Total Members</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{totalMembers}</div>
        </div>

        <div className="bg-[#F2FBF6] border border-emerald-100/90 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#005A36]">Badged Leaders</span>
            <Award className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-primary font-mono">{badgedLeadersCount}</div>
        </div>

        <div className="bg-[#FFF8F3] border border-amber-100/90 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#854D0E]">Active Accounts</span>
            <ShieldCheck className="w-4 h-4 text-[#854D0E]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#854D0E] font-mono">{activeAccountsCount}</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-widest">Network Balance</span>
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono truncate">
            ৳{totalNetworkBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Breadcrumb Trail for In-Place Tree Exploration */}
      <UserBreadcrumbs breadcrumbs={breadcrumbs} onBreadcrumbClick={handleBreadcrumbClick} />

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Referral Network Table</h2>
              <p className="text-[11px] font-medium text-slate-400">
                Click any row to explore their downlines in-place or select Action details.
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by phone, name, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
            />
          </div>
        </div>

        {/* Table wrapper */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <DataTable<User>
            data={users}
            columns={userColumns}
            keyExtractor={(u) => u.id}
            loading={loading}
            onRowClick={handleRowClick}
            emptyMessage={
              searchTerm.trim()
                ? `No members found matching "${searchTerm.trim()}" across the database.`
                : currentParent.id === null
                ? 'No badged leaders found. Assign a badge to users to display them here.'
                : `No direct referral downlines found under ${currentParent.name}.`
            }
          />
        </div>
      </div>

      {/* Selected Member Details & Transaction History Cards */}
      <UserDetailCards
        user={selectedUserForCards}
        onAdjustBalance={(user) => setAdjustUser(user)}
        onAssignBadge={(user) => openBadgeModal(user)}
        onToggleStatus={(e, user, newStatus) => openStatusConfirmModal(e, user, newStatus)}
        onDeleteUser={(user) => setDeleteConfirmTarget(user)}
      />

      {/* Delete User Confirmation Modal */}
      {deleteConfirmTarget && (
        <ConfirmModal
          isOpen={!!deleteConfirmTarget}
          title="Delete User Profile"
          message={`Are you sure you want to permanently delete user ${
            deleteConfirmTarget.full_name || deleteConfirmTarget.phone
          }? All associated data will be removed.`}
          confirmText="Yes, Delete User"
          variant="danger"
          loading={deletingUser}
          onConfirm={handleDeleteUserConfirm}
          onClose={() => setDeleteConfirmTarget(null)}
        />
      )}

      {/* Account Status Change Confirmation Modal */}
      {statusConfirmTarget && (
        <ConfirmModal
          isOpen={!!statusConfirmTarget}
          title="Confirm Account Status Change"
          message={`Are you sure you want to change the status of ${
            statusConfirmTarget.user.full_name || statusConfirmTarget.user.phone
          } to "${statusConfirmTarget.newStatus}"?`}
          confirmText={`Yes, ${statusConfirmTarget.newStatus}`}
          variant={statusConfirmTarget.newStatus === UserStatus.BLOCKED ? 'danger' : 'primary'}
          loading={updatingStatus}
          onConfirm={handleStatusChangeConfirm}
          onClose={() => setStatusConfirmTarget(null)}
        />
      )}

      {/* Inline Balance Adjustment Modal */}
      <AdjustWalletModal
        user={adjustUser}
        isOpen={!!adjustUser}
        adjusting={adjusting}
        onClose={() => setAdjustUser(null)}
        onSubmit={handleBalanceAdjustSubmit}
      />

      {/* Assign Designation Badge & Hierarchy Sponsor Modal */}
      <AssignDesignationModal
        user={selectedUserForBadge}
        designations={designations}
        allBadgedLeaders={allBadgedLeaders}
        targetDesignation={targetDesignation}
        targetSponsorId={targetSponsorId}
        savingBadge={savingBadge}
        isOpen={!!selectedUserForBadge}
        onClose={() => setSelectedUserForBadge(null)}
        onTargetDesignationChange={setTargetDesignation}
        onTargetSponsorIdChange={setTargetSponsorId}
        onSubmit={handleAssignDesignation}
      />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm font-bold">Loading users...</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
