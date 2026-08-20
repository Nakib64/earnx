'use client';

import React, { Suspense } from 'react';
import { UserBreadcrumbs } from '../../../components/users/UserBreadcrumbs';
import { UserDetailCards } from '../../../components/users/UserDetailCards';
import { AdminUsersBanner } from '../../../components/users/AdminUsersBanner';
import { AdminUsersSummaryCards } from '../../../components/users/AdminUsersSummaryCards';
import { AdminUsersTableSection } from '../../../components/users/AdminUsersTableSection';
import { AdminUsersModals } from '../../../components/users/AdminUsersModals';
import { useAdminUsersPage } from '../../../hooks/useAdminUsersPage';

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
    handleTogglePremium,
    updatingPremium,
    loadData,
  } = useAdminUsersPage();

  const totalMembers = users.length;
  const badgedLeadersCount = users.filter((u) => !!u.designation).length;
  const premiumAccountsCount = users.filter((u) => u.is_premium).length;
  const totalNetworkBalance = users.reduce((acc, u) => acc + Number(u.wallet_balance || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Luxury Banner */}
      <AdminUsersBanner
        totalMembers={totalMembers}
        onRefresh={loadData}
      />

      {/* Summary Metric Cards */}
      <AdminUsersSummaryCards
        totalMembers={totalMembers}
        badgedLeadersCount={badgedLeadersCount}
        premiumAccountsCount={premiumAccountsCount}
        totalNetworkBalance={totalNetworkBalance}
      />

      {/* Breadcrumb Trail for In-Place Tree Exploration */}
      <UserBreadcrumbs
        breadcrumbs={breadcrumbs}
        onBreadcrumbClick={handleBreadcrumbClick}
      />

      {/* Main Table Card Section */}
      <AdminUsersTableSection
        users={users}
        userColumns={userColumns}
        loading={loading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRowClick={handleRowClick}
        currentParentName={currentParent.name}
        isRootParent={currentParent.id === null}
      />

      {/* Selected Member Details & Transaction History Cards */}
      <UserDetailCards
        user={selectedUserForCards}
        onAdjustBalance={(user) => setAdjustUser(user)}
        onAssignBadge={(user) => openBadgeModal(user)}
        onToggleStatus={(e, user, newStatus) => openStatusConfirmModal(e, user, newStatus)}
        onTogglePremium={(user, isPremium) => handleTogglePremium(user, isPremium)}
        updatingPremium={updatingPremium}
        onDeleteUser={(user) => setDeleteConfirmTarget(user)}
      />

      {/* Action Modals Container */}
      <AdminUsersModals
        deleteConfirmTarget={deleteConfirmTarget}
        deletingUser={deletingUser}
        onDeleteConfirm={handleDeleteUserConfirm}
        onDeleteClose={() => setDeleteConfirmTarget(null)}
        statusConfirmTarget={statusConfirmTarget}
        updatingStatus={updatingStatus}
        onStatusConfirm={handleStatusChangeConfirm}
        onStatusClose={() => setStatusConfirmTarget(null)}
        adjustUser={adjustUser}
        adjusting={adjusting}
        onAdjustClose={() => setAdjustUser(null)}
        onAdjustSubmit={handleBalanceAdjustSubmit}
        selectedUserForBadge={selectedUserForBadge}
        designations={designations}
        allBadgedLeaders={allBadgedLeaders}
        targetDesignation={targetDesignation}
        targetSponsorId={targetSponsorId}
        savingBadge={savingBadge}
        onBadgeClose={() => setSelectedUserForBadge(null)}
        onTargetDesignationChange={setTargetDesignation}
        onTargetSponsorIdChange={setTargetSponsorId}
        onBadgeSubmit={handleAssignDesignation}
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
