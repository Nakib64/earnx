'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { User, UserStatus, Designation } from '../types';
import { ColumnDef } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { BreadcrumbItem } from '../components/users/UserBreadcrumbs';
import { RowActionsMenu } from '../components/users/RowActionsMenu';
import { Award } from 'lucide-react';

import { useUserTreeData } from './useUserTreeData';
import { useUserStatusActions } from './useUserStatusActions';
import { useWalletAdjustment } from './useWalletAdjustment';
import { useDesignationBadge } from './useDesignationBadge';
import { useUserDeletion } from './useUserDeletion';

// Re-export sub-hooks for direct consumption if needed
export { useUserTreeData } from './useUserTreeData';
export { useUserStatusActions } from './useUserStatusActions';
export { useWalletAdjustment } from './useWalletAdjustment';
export { useDesignationBadge } from './useDesignationBadge';
export { useUserDeletion } from './useUserDeletion';

export interface UseAdminUsersPageReturn {
  users: User[];
  designations: Designation[];
  searchTerm: string;
  loading: boolean;
  breadcrumbs: BreadcrumbItem[];
  currentParent: BreadcrumbItem;
  statusConfirmTarget: { user: User; newStatus: UserStatus } | null;
  updatingStatus: boolean;
  adjustUser: User | null;
  adjusting: boolean;
  selectedUserForBadge: User | null;
  targetDesignation: string;
  targetSponsorId: string;
  allBadgedLeaders: User[];
  savingBadge: boolean;
  userColumns: ColumnDef<User>[];
  deleteConfirmTarget: User | null;
  deletingUser: boolean;
  detailModalUser: User | null;
  selectedUserForCards: User | null;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setTargetDesignation: React.Dispatch<React.SetStateAction<string>>;
  setTargetSponsorId: React.Dispatch<React.SetStateAction<string>>;
  setStatusConfirmTarget: React.Dispatch<React.SetStateAction<{ user: User; newStatus: UserStatus } | null>>;
  setAdjustUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSelectedUserForBadge: React.Dispatch<React.SetStateAction<User | null>>;
  setDeleteConfirmTarget: React.Dispatch<React.SetStateAction<User | null>>;
  setDetailModalUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSelectedUserForCards: React.Dispatch<React.SetStateAction<User | null>>;
  handleDeleteUserConfirm: () => Promise<void>;
  handleRowClick: (user: User) => void;
  handleBreadcrumbClick: (index: number) => void;
  handleStatusChangeConfirm: () => Promise<void>;
  handleBalanceAdjustSubmit: (user: User, rawAmount: number, type: 'ADD' | 'SUBTRACT', reason: string) => Promise<void>;
  handleAssignDesignation: () => Promise<void>;
  openBadgeModal: (user: User) => void;
  openStatusConfirmModal: (e: React.MouseEvent, user: User, newStatus: UserStatus) => void;
  loadData: () => Promise<void>;
}

export function useAdminUsersPage(): UseAdminUsersPageReturn {
  const [detailModalUser, setDetailModalUser] = useState<User | null>(null);

  // 1. Sub-hook: Tree Data, Breadcrumbs & Fetching
  const {
    users,
    setUsers,
    designations,
    searchTerm,
    setSearchTerm,
    loading,
    breadcrumbs,
    currentParent,
    selectedUserForCards,
    setSelectedUserForCards,
    loadData,
    handleRowClick,
    handleBreadcrumbClick,
  } = useUserTreeData();

  // 2. Sub-hook: User Status Manager
  const {
    statusConfirmTarget,
    setStatusConfirmTarget,
    updatingStatus,
    openStatusConfirmModal,
    handleStatusChangeConfirm: triggerStatusChange,
  } = useUserStatusActions();

  // 3. Sub-hook: Wallet Balance Adjustment
  const {
    adjustUser,
    setAdjustUser,
    adjusting,
    handleBalanceAdjustSubmit: triggerBalanceAdjust,
  } = useWalletAdjustment();

  // 4. Sub-hook: Designation & Badge Management
  const {
    selectedUserForBadge,
    setSelectedUserForBadge,
    targetDesignation,
    setTargetDesignation,
    targetSponsorId,
    setTargetSponsorId,
    allBadgedLeaders,
    savingBadge,
    openBadgeModal,
    handleAssignDesignation: triggerAssignDesignation,
  } = useDesignationBadge();

  // 5. Sub-hook: User Deletion
  const {
    deleteConfirmTarget,
    setDeleteConfirmTarget,
    deletingUser,
    handleDeleteUserConfirm: triggerDeleteUser,
  } = useUserDeletion();

  // Composed Handlers
  const handleStatusChangeConfirm = useCallback(async () => {
    await triggerStatusChange((user, newStatus) => {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)),
      );
      if (selectedUserForCards?.id === user.id) {
        setSelectedUserForCards((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    });
  }, [triggerStatusChange, setUsers, selectedUserForCards, setSelectedUserForCards]);

  const handleAssignDesignation = useCallback(async () => {
    await triggerAssignDesignation(designations, (selectedUser, updatedUser, targetDesId, newDesObj) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
              ...u,
              ...updatedUser,
              designation_id: targetDesId || null,
              designation: newDesObj || (updatedUser as any).designation || null,
            }
            : u,
        ),
      );
      if (selectedUserForCards?.id === selectedUser.id) {
        setSelectedUserForCards((prev) =>
          prev
            ? {
              ...prev,
              designation_id: targetDesId || null,
              designation: newDesObj || null,
            }
            : null,
        );
      }
    });
  }, [triggerAssignDesignation, designations, setUsers, selectedUserForCards, setSelectedUserForCards]);

  const handleBalanceAdjustSubmit = useCallback(
    async (user: User, rawAmount: number, type: 'ADD' | 'SUBTRACT', reason: string) => {
      await triggerBalanceAdjust(user, rawAmount, type, reason, (targetId, finalAmount) => {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === targetId) {
              const newBal = Number(u.wallet_balance || 0) + finalAmount;
              return { ...u, wallet_balance: newBal };
            }
            return u;
          }),
        );
        if (selectedUserForCards?.id === targetId) {
          setSelectedUserForCards((prev) =>
            prev
              ? { ...prev, wallet_balance: Number(prev.wallet_balance || 0) + finalAmount }
              : null,
          );
        }
      });
    },
    [triggerBalanceAdjust, setUsers, selectedUserForCards, setSelectedUserForCards],
  );

  const handleDeleteUserConfirm = useCallback(async () => {
    await triggerDeleteUser(async (deletedUser) => {
      if (selectedUserForCards?.id === deletedUser.id) {
        setSelectedUserForCards(null);
      }
      await loadData();
    });
  }, [triggerDeleteUser, selectedUserForCards, setSelectedUserForCards, loadData]);

  const userColumns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        key: 'member',
        header: 'Member & Ref',
        render: (u) => (
          <div>
            <div className="font-extrabold text-slate-900 text-[10px] sm:text-[11px] leading-tight truncate max-w-[130px] sm:max-w-[180px]">
              {u.full_name || u.phone}
            </div>
            <div className="text-[9px] text-slate-500 font-mono flex items-center space-x-1 mt-0.5">
              <span>{u.phone}</span>
              <span className="text-primary font-bold">• {u.referral_code}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'designation_status',
        header: 'Badge & Status',
        render: (u) => (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-none bg-yellow-50 text-[#854D0E] font-extrabold text-[8px] sm:text-[9px] border border-yellow-300 whitespace-nowrap">
              <Award className="w-2.5 h-2.5 mr-0.5 text-[#854D0E] shrink-0" />
              <span className="truncate max-w-[80px]">{u.designation?.name || 'Unbadged'}</span>
            </span>
            <StatusBadge status={u.status} />
          </div>
        ),
      },
      {
        key: 'wallet_actions',
        header: 'Wallet & Actions',
        align: 'right',
        render: (u) => (
          <div className="flex items-center justify-end space-x-2">
            <span className="font-mono font-extrabold text-slate-800 text-[11px]">
              ৳{Number(u.wallet_balance || 0).toFixed(2)}
            </span>
            <RowActionsMenu
              user={u}
              onSelectDetails={(user) => setSelectedUserForCards(user)}
              onAdjustBalance={(user) => setAdjustUser(user)}
              onAssignBadge={(user) => openBadgeModal(user)}
              onToggleStatus={(e, user, newStatus) => openStatusConfirmModal(e, user, newStatus)}
              onDeleteUser={(user) => setDeleteConfirmTarget(user)}
            />
          </div>
        ),
      },
    ],
    [openBadgeModal, openStatusConfirmModal, setSelectedUserForCards, setAdjustUser, setDeleteConfirmTarget],
  );

  return {
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
    detailModalUser,
    selectedUserForCards,
    setSearchTerm,
    setTargetDesignation,
    setTargetSponsorId,
    setStatusConfirmTarget,
    setAdjustUser,
    setSelectedUserForBadge,
    setDeleteConfirmTarget,
    setDetailModalUser,
    setSelectedUserForCards,
    handleDeleteUserConfirm,
    handleRowClick,
    handleBreadcrumbClick,
    handleStatusChangeConfirm,
    handleBalanceAdjustSubmit,
    handleAssignDesignation,
    openBadgeModal,
    openStatusConfirmModal,
    loadData,
  };
}
