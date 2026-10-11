'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { User, UserStatus, Designation } from '../types';
import { ColumnDef } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { BreadcrumbItem } from '../components/users/UserBreadcrumbs';
import { RowActionsMenu } from '../components/users/RowActionsMenu';
import { Award, Crown } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';

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
  updatingPremium: boolean;
  openBadgeModal: (user: User) => void;
  openStatusConfirmModal: (e: React.MouseEvent, user: User, newStatus: UserStatus) => void;
  handleTogglePremium: (targetUser: User, isPremium: boolean) => Promise<void>;
  loadData: () => Promise<void>;
}

export function useAdminUsersPage(): UseAdminUsersPageReturn {
  const [detailModalUser, setDetailModalUser] = useState<User | null>(null);
  const [updatingPremium, setUpdatingPremium] = useState(false);

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

  // Composed Handlers with Instant Optimistic State Updates
  const handleStatusChangeConfirm = useCallback(async () => {
    if (!statusConfirmTarget) return;
    const { user, newStatus } = statusConfirmTarget;
    const previousStatus = user.status;

    // Instant optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)),
    );
    if (selectedUserForCards?.id === user.id) {
      setSelectedUserForCards((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setStatusConfirmTarget(null);
    toast.success(`User ${user.full_name || user.phone} status updated to ${newStatus}`);

    try {
      const res = await apiFetch(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        isAdmin: true,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.success) {
        throw new Error(res.error?.message || 'Status update failed');
      }
    } catch (err: any) {
      // Rollback on error
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: previousStatus } : u)),
      );
      if (selectedUserForCards?.id === user.id) {
        setSelectedUserForCards((prev) => (prev ? { ...prev, status: previousStatus } : null));
      }
      toast.error(err.message || 'Failed to update user status');
    }
  }, [statusConfirmTarget, setUsers, selectedUserForCards, setSelectedUserForCards, setStatusConfirmTarget]);

  const handleAssignDesignation = useCallback(async () => {
    if (!selectedUserForBadge) return;
    const targetUser = selectedUserForBadge;
    const prevDesId = targetUser.designation_id;
    const prevDes = targetUser.designation;
    const newDesObj = designations.find((d) => d.id === targetDesignation) || null;

    // Instant optimistic update
    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetUser.id
          ? {
              ...u,
              designation_id: targetDesignation || null,
              designation: newDesObj,
            }
          : u,
      ),
    );
    if (selectedUserForCards?.id === targetUser.id) {
      setSelectedUserForCards((prev) =>
        prev
          ? {
              ...prev,
              designation_id: targetDesignation || null,
              designation: newDesObj,
            }
          : null,
      );
    }
    setSelectedUserForBadge(null);
    toast.success(`Designation badge updated for ${targetUser.full_name || targetUser.phone}`);

    try {
      const payload: any = { designation_id: targetDesignation || null };
      if (targetSponsorId === 'ROOT') {
        payload.referred_by_id = null;
      } else if (targetSponsorId && targetSponsorId !== 'CURRENT') {
        payload.referred_by_id = targetSponsorId;
      }

      const res = await apiFetch<User>(`/admin/users/${targetUser.id}/designation`, {
        method: 'PATCH',
        isAdmin: true,
        body: JSON.stringify(payload),
      });

      if (!res.success) {
        throw new Error(res.error?.message || 'Designation assignment failed');
      }
    } catch (err: any) {
      // Rollback on error
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? { ...u, designation_id: prevDesId, designation: prevDes }
            : u,
        ),
      );
      if (selectedUserForCards?.id === targetUser.id) {
        setSelectedUserForCards((prev) =>
          prev
            ? { ...prev, designation_id: prevDesId, designation: prevDes }
            : null,
        );
      }
      toast.error(err.message || 'Designation assignment failed');
    }
  }, [
    selectedUserForBadge,
    targetDesignation,
    targetSponsorId,
    designations,
    setUsers,
    selectedUserForCards,
    setSelectedUserForCards,
    setSelectedUserForBadge,
  ]);

  const handleBalanceAdjustSubmit = useCallback(
    async (user: User, rawAmount: number, type: 'ADD' | 'SUBTRACT', reason: string) => {
      const finalAmount = type === 'ADD' ? rawAmount : -rawAmount;
      const previousBal = Number(user.wallet_balance || 0);
      const newBal = previousBal + finalAmount;

      // Instant optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, wallet_balance: newBal } : u)),
      );
      if (selectedUserForCards?.id === user.id) {
        setSelectedUserForCards((prev) => (prev ? { ...prev, wallet_balance: newBal } : null));
      }
      setAdjustUser(null);
      toast.success(
        `${type === 'ADD' ? 'Added' : 'Subtracted'} ৳${rawAmount} ${
          type === 'ADD' ? 'to' : 'from'
        } ${user.full_name || user.phone}'s balance`,
      );

      try {
        const res = await apiFetch('/admin/wallet/adjust', {
          method: 'POST',
          isAdmin: true,
          body: JSON.stringify({
            user_id: user.id,
            amount: finalAmount,
            description: reason.trim() || 'Admin Direct Adjustment',
          }),
        });

        if (!res.success) {
          throw new Error(res.error?.message || 'Balance adjustment failed');
        }
      } catch (err: any) {
        // Rollback on error
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, wallet_balance: previousBal } : u)),
        );
        if (selectedUserForCards?.id === user.id) {
          setSelectedUserForCards((prev) => (prev ? { ...prev, wallet_balance: previousBal } : null));
        }
        toast.error(err.message || 'Balance adjustment failed');
      }
    },
    [setUsers, selectedUserForCards, setSelectedUserForCards, setAdjustUser],
  );

  const handleDeleteUserConfirm = useCallback(async () => {
    if (!deleteConfirmTarget) return;
    const targetUser = deleteConfirmTarget;

    // Instant optimistic removal
    setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
    if (selectedUserForCards?.id === targetUser.id) {
      setSelectedUserForCards(null);
    }
    setDeleteConfirmTarget(null);
    toast.success(`User ${targetUser.full_name || targetUser.phone} deleted successfully`);

    try {
      const res = await apiFetch(`/admin/users/${targetUser.id}`, {
        method: 'DELETE',
        isAdmin: true,
      });

      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to delete user');
      }
    } catch (err: any) {
      // Rollback on error
      setUsers((prev) => [...prev, targetUser]);
      toast.error(err.message || 'Failed to delete user');
    }
  }, [deleteConfirmTarget, setUsers, selectedUserForCards, setSelectedUserForCards, setDeleteConfirmTarget]);

  const handleTogglePremium = useCallback(
    async (targetUser: User, isPremium: boolean) => {
      if (updatingPremium) return;
      setUpdatingPremium(true);

      // Instant optimistic state flip
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_premium: isPremium } : u)),
      );
      if (selectedUserForCards?.id === targetUser.id) {
        setSelectedUserForCards((prev) => (prev ? { ...prev, is_premium: isPremium } : null));
      }
      toast.success(
        isPremium
          ? `User ${targetUser.full_name || targetUser.phone} is now a Premium Member!`
          : `Removed Premium status from ${targetUser.full_name || targetUser.phone}.`
      );

      try {
        const res = await apiFetch<any>(`/admin/users/${targetUser.id}/premium`, {
          method: 'PATCH',
          body: JSON.stringify({ is_premium: isPremium }),
          isAdmin: true,
        });

        if (!res.success) {
          throw new Error(res.error?.message || 'Failed to update Premium status.');
        }
      } catch (err: any) {
        // Rollback on error
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, is_premium: !isPremium } : u)),
        );
        if (selectedUserForCards?.id === targetUser.id) {
          setSelectedUserForCards((prev) => (prev ? { ...prev, is_premium: !isPremium } : null));
        }
        toast.error(err.message || 'Failed to update Premium status.');
      } finally {
        setUpdatingPremium(false);
      }
    },
    [updatingPremium, setUsers, selectedUserForCards, setSelectedUserForCards],
  );

  const userColumns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        key: 'member',
        header: 'Member',
        render: (u) => (
          <div>
            <div className="font-extrabold text-slate-900 text-[10px] sm:text-[11px] leading-tight truncate max-w-[100px] sm:max-w-[180px]">
              {u.full_name || u.phone}
            </div>
            <div className="text-[9px] text-slate-500  flex items-center space-x-1 mt-0.5">
              <span>{u.phone}</span>
              <span className="text-primary font-bold hidden sm:inline">• {u.referral_code}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'designation_status',
        header: 'Designation & Badge',
        render: (u) => {
          const starsCount = u.designation?.stars || 0;
          return (
            <div className="flex flex-col space-y-0.5">
              <div className="inline-flex items-center space-x-1 text-[9px] font-extrabold text-slate-800">
                <span className="truncate max-w-[80px] sm:max-w-[120px] font-bold text-slate-900">
                  {u.designation?.name || 'Unbadged'}
                </span>
              </div>
              {starsCount > 0 ? (
                <div className="flex items-center space-x-0.5 text-amber-500">
                  {Array.from({ length: Math.min(starsCount, 5) }).map((_, i) => (
                    <span key={i} className="text-[10px] leading-none">★</span>
                  ))}
                  {starsCount > 5 && (
                    <span className="text-[9px] font-extrabold text-amber-600  ml-0.5">
                      +{starsCount - 5}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-[8.5px] font-medium text-slate-400">No Stars</span>
              )}
            </div>
          );
        },
      },

      {
        key: 'wallet_actions',
        header: 'Wallet & Actions',
        align: 'right',
        render: (u) => (
          <div className="flex items-center justify-end space-x-1.5">
            <span className=" font-extrabold text-slate-900 text-[10px] sm:text-[11px]">
              ৳{Number(u.wallet_balance || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
    updatingPremium,
    openBadgeModal,
    openStatusConfirmModal,
    handleTogglePremium,
    loadData,
  };
}
