'use client';

import React, { Suspense } from 'react';
import { UserStatus, User } from '../../../types';
import { DataTable } from '../../../components/common/DataTable';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { UserBreadcrumbs } from '../../../components/users/UserBreadcrumbs';
import { AdjustWalletModal } from '../../../components/users/AdjustWalletModal';
import { AssignDesignationModal } from '../../../components/users/AssignDesignationModal';
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
    setSearchTerm,
    setTargetDesignation,
    setTargetSponsorId,
    setStatusConfirmTarget,
    setAdjustUser,
    setSelectedUserForBadge,
    handleRowClick,
    handleBreadcrumbClick,
    handleStatusChangeConfirm,
    handleBalanceAdjustSubmit,
    handleAssignDesignation,
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
            Displaying badged leaders. Click any row to explore that member's referral downlines in-place.
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
