'use client';

import React from 'react';
import { User, UserStatus, Designation } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { AdjustWalletModal } from './AdjustWalletModal';
import { AssignDesignationModal } from './AssignDesignationModal';

interface AdminUsersModalsProps {
  deleteConfirmTarget: User | null;
  deletingUser: boolean;
  onDeleteConfirm: () => void;
  onDeleteClose: () => void;

  statusConfirmTarget: { user: User; newStatus: UserStatus } | null;
  updatingStatus: boolean;
  onStatusConfirm: () => void;
  onStatusClose: () => void;

  adjustUser: User | null;
  adjusting: boolean;
  onAdjustClose: () => void;
  onAdjustSubmit: (user: User, rawAmount: number, type: 'ADD' | 'SUBTRACT', reason: string) => Promise<void> | void;

  selectedUserForBadge: User | null;
  designations: Designation[];
  allBadgedLeaders: User[];
  targetDesignation: string;
  targetSponsorId: string;
  savingBadge: boolean;
  onBadgeClose: () => void;
  onTargetDesignationChange: (id: string) => void;
  onTargetSponsorIdChange: (sponsorId: string) => void;
  onBadgeSubmit: () => Promise<void> | void;
}

export function AdminUsersModals({
  deleteConfirmTarget,
  deletingUser,
  onDeleteConfirm,
  onDeleteClose,
  statusConfirmTarget,
  updatingStatus,
  onStatusConfirm,
  onStatusClose,
  adjustUser,
  adjusting,
  onAdjustClose,
  onAdjustSubmit,
  selectedUserForBadge,
  designations,
  allBadgedLeaders,
  targetDesignation,
  targetSponsorId,
  savingBadge,
  onBadgeClose,
  onTargetDesignationChange,
  onTargetSponsorIdChange,
  onBadgeSubmit,
}: AdminUsersModalsProps) {
  return (
    <>
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
          onConfirm={onDeleteConfirm}
          onClose={onDeleteClose}
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
          onConfirm={onStatusConfirm}
          onClose={onStatusClose}
        />
      )}

      {/* Inline Balance Adjustment Modal */}
      <AdjustWalletModal
        user={adjustUser}
        isOpen={!!adjustUser}
        adjusting={adjusting}
        onClose={onAdjustClose}
        onSubmit={onAdjustSubmit}
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
        onClose={onBadgeClose}
        onTargetDesignationChange={onTargetDesignationChange}
        onTargetSponsorIdChange={onTargetSponsorIdChange}
        onSubmit={onBadgeSubmit}
      />
    </>
  );
}
