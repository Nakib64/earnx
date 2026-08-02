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
import { Search, RefreshCw } from 'lucide-react';
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

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Badged Leaders & Referral Network
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Displaying referral tree network. Click any member row to explore their downlines in-place. Select Details to view profile & transaction history cards below.
          </p>
        </div>

        <button
          onClick={() => {
            loadData();
            toast.info('Refreshed user data');
          }}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors self-start flex items-center space-x-1.5 text-xs font-bold"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Breadcrumb Trail for In-Place Tree Exploration */}
      <UserBreadcrumbs breadcrumbs={breadcrumbs} onBreadcrumbClick={handleBreadcrumbClick} />

      {/* Summary Metrics Bar (Shown Before Table) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Members</div>
          <div className="text-base sm:text-xl font-extrabold text-slate-900 mt-0.5">{users.length}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Badged Leaders</div>
          <div className="text-base sm:text-xl font-extrabold text-purple-600 mt-0.5">
            {users.filter((u) => !!u.designation).length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Active Accounts</div>
          <div className="text-base sm:text-xl font-extrabold text-emerald-600 mt-0.5">
            {users.filter((u) => u.status === 'ACTIVE').length}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Network Balance</div>
          <div className="text-base sm:text-xl font-extrabold text-sky-600 font-mono mt-0.5 truncate">
            ৳{users.reduce((acc, u) => acc + Number(u.wallet_balance || 0), 0).toFixed(0)}
          </div>
        </div>
      </div>

      {/* Debounced Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by phone, name, or referral code across whole database..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {/* Main Table displaying Badged Leaders or Downlines */}
      <div className="glass-card rounded-2xl p-3 sm:p-5 bg-white border border-slate-200 w-full">
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

      {/* Selected Member Details & Transaction History Cards (Shown AFTER / BELOW the Table) */}
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
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-sm">Loading users...</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
