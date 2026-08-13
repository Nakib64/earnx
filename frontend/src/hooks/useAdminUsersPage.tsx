'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { User, Designation, UserStatus } from '../types';
import { ColumnDef } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { BreadcrumbItem } from '../components/users/UserBreadcrumbs';
import { useDebounce } from './useDebounce';
import { RowActionsMenu } from '../components/users/RowActionsMenu';
import { Award } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

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
  const { admin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [loading, setLoading] = useState(true);

  // Status Change Confirmation Modal State
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<{
    user: User;
    newStatus: UserStatus;
  } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete User Confirmation Modal State
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  // User Detail & Transactions Modal State
  const [detailModalUser, setDetailModalUser] = useState<User | null>(null);

  // Selected User For Cards View Below Table State
  const [selectedUserForCards, setSelectedUserForCards] = useState<User | null>(null);

  const searchParams = useSearchParams();
  const queryParentId = searchParams ? searchParams.get('parentId') : null;
  const queryParentName = searchParams ? searchParams.get('parentName') : null;

  // Breadcrumb Trail state for In-Place Tree Navigation
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>(() => {
    if (queryParentId) {
      return [
        { id: null, name: 'Root Badged Leaders' },
        { id: queryParentId, name: queryParentName || 'User' },
      ];
    }
    return [{ id: null, name: 'Root Badged Leaders' }];
  });
  const currentParent = breadcrumbs[breadcrumbs.length - 1];

  useEffect(() => {
    if (queryParentId) {
      setBreadcrumbs([
        { id: null, name: 'Root Badged Leaders' },
        { id: queryParentId, name: queryParentName || 'User' },
      ]);
    }
  }, [queryParentId, queryParentName]);

  // Designation Badge Modal State
  const [selectedUserForBadge, setSelectedUserForBadge] = useState<User | null>(null);
  const [targetDesignation, setTargetDesignation] = useState<string>('');
  const [targetSponsorId, setTargetSponsorId] = useState<string>('ROOT');
  const [allBadgedLeaders, setAllBadgedLeaders] = useState<User[]>([]);
  const [savingBadge, setSavingBadge] = useState(false);

  // Inline Wallet Adjustment Modal State
  const [adjustUser, setAdjustUser] = useState<User | null>(null);
  const [adjusting, setAdjusting] = useState(false);

  // Load Users & Designations
  const loadData = useCallback(async () => {
    setLoading(true);

    let url = `/admin/users?page=1&limit=100`;

    if (debouncedSearch.trim()) {
      url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
      if (currentParent.id !== null) {
        url += `&referred_by_id=${currentParent.id}`;
      }
    } else if (currentParent.id !== null) {
      url += `&referred_by_id=${currentParent.id}`;
    } else {
      url += `&has_designation=true`;
    }

    const [usersRes, desRes] = await Promise.all([
      apiFetch<User[]>(url, { isAdmin: true }),
      apiFetch<Designation[]>('/admin/designations', { isAdmin: true }),
    ]);

    if (usersRes.success && usersRes.data) {
      const dataArr = (usersRes.data as any).data || (Array.isArray(usersRes.data) ? usersRes.data : []);
      setUsers(dataArr);
    }
    if (desRes.success && desRes.data) {
      setDesignations(desRes.data);
    }
    setLoading(false);
  }, [currentParent.id, debouncedSearch]);

  useEffect(() => {
    if (admin) loadData();
  }, [admin, loadData]);

  // Fetch badged leaders for sponsor dropdown
  const fetchAllBadgedLeaders = useCallback(async () => {
    const res = await apiFetch<User[]>('/admin/users?has_designation=true&limit=100', {
      isAdmin: true,
    });
    if (res.success && res.data) {
      setAllBadgedLeaders((res.data as any).data || (Array.isArray(res.data) ? res.data : []));
    }
  }, []);

  const openBadgeModal = useCallback(
    (user: User) => {
      setSelectedUserForBadge(user);
      setTargetDesignation(user.designation_id || '');
      setTargetSponsorId('ROOT');
      fetchAllBadgedLeaders();
    },
    [fetchAllBadgedLeaders],
  );

  const handleRowClick = useCallback((user: User) => {
    setSelectedUserForCards(user);
    setSearchTerm('');
    setBreadcrumbs((prev) => {
      const lastCrumb = prev[prev.length - 1];
      if (lastCrumb?.id === user.id) {
        return prev;
      }
      return [
        ...prev,
        { id: user.id, name: user.full_name || user.phone || 'User' },
      ];
    });
  }, []);

  const handleBreadcrumbClick = useCallback((index: number) => {
    setSearchTerm('');
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  }, []);

  const openStatusConfirmModal = useCallback(
    (e: React.MouseEvent, user: User, newStatus: UserStatus) => {
      e.stopPropagation();
      setStatusConfirmTarget({ user, newStatus });
    },
    [],
  );

  const handleStatusChangeConfirm = useCallback(async () => {
    if (!statusConfirmTarget) return;
    const { user, newStatus } = statusConfirmTarget;
    setUpdatingStatus(true);

    const res = await apiFetch(`/admin/users/${user.id}/status`, {
      method: 'PATCH',
      isAdmin: true,
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)),
      );
      if (selectedUserForCards?.id === user.id) {
        setSelectedUserForCards((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      toast.success(`User ${user.full_name || user.phone} status updated to ${newStatus}`);
      setStatusConfirmTarget(null);
    } else {
      toast.error(res.error?.message || 'Status update failed');
    }
    setUpdatingStatus(false);
  }, [statusConfirmTarget, selectedUserForCards]);

  const handleAssignDesignation = useCallback(async () => {
    if (!selectedUserForBadge) return;
    setSavingBadge(true);

    const payload: any = { designation_id: targetDesignation || null };

    if (targetSponsorId === 'ROOT') {
      payload.referred_by_id = null;
    } else if (targetSponsorId && targetSponsorId !== 'CURRENT') {
      payload.referred_by_id = targetSponsorId;
    }

    const res = await apiFetch<User>(`/admin/users/${selectedUserForBadge.id}/designation`, {
      method: 'PATCH',
      isAdmin: true,
      body: JSON.stringify(payload),
    });

    if (res.success) {
      const updatedUser = res.data || {};
      const newDesObj = designations.find((d) => d.id === targetDesignation) || null;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUserForBadge.id
            ? {
                ...u,
                ...updatedUser,
                designation_id: targetDesignation || null,
                designation: newDesObj || (updatedUser as any).designation || null,
              }
            : u,
        ),
      );
      if (selectedUserForCards?.id === selectedUserForBadge.id) {
        setSelectedUserForCards((prev) =>
          prev
            ? {
                ...prev,
                designation_id: targetDesignation || null,
                designation: newDesObj || null,
              }
            : null,
        );
      }
      toast.success(`Designation badge updated for ${selectedUserForBadge.full_name || selectedUserForBadge.phone}`);
      setSelectedUserForBadge(null);
    } else {
      toast.error(res.error?.message || 'Designation assignment failed');
    }
    setSavingBadge(false);
  }, [selectedUserForBadge, targetDesignation, targetSponsorId, designations, selectedUserForCards]);

  const handleBalanceAdjustSubmit = useCallback(
    async (user: User, rawAmount: number, type: 'ADD' | 'SUBTRACT', reason: string) => {
      setAdjusting(true);
      const finalAmount = type === 'ADD' ? rawAmount : -rawAmount;

      const res = await apiFetch('/admin/wallet/adjust', {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({
          user_id: user.id,
          amount: finalAmount,
          description: reason.trim() || 'Admin Direct Adjustment',
        }),
      });

      if (res.success) {
        const targetId = user.id;
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === targetId) {
              const newBal = Number(u.wallet_balance) + finalAmount;
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
        toast.success(
          `${type === 'ADD' ? 'Added' : 'Subtracted'} ৳${rawAmount} ${
            type === 'ADD' ? 'to' : 'from'
          } ${user.full_name || user.phone}'s balance`,
        );
        setAdjustUser(null);
      } else {
        toast.error(res.error?.message || 'Balance adjustment failed');
      }
      setAdjusting(false);
    },
    [selectedUserForCards],
  );

  const handleDeleteUserConfirm = async () => {
    if (!deleteConfirmTarget) return;
    setDeletingUser(true);
    const res = await apiFetch(`/admin/users/${deleteConfirmTarget.id}`, {
      method: 'DELETE',
      isAdmin: true,
    });
    if (res.success) {
      toast.success(`User ${deleteConfirmTarget.full_name || deleteConfirmTarget.phone} deleted successfully`);
      if (selectedUserForCards?.id === deleteConfirmTarget.id) {
        setSelectedUserForCards(null);
      }
      setDeleteConfirmTarget(null);
      await loadData();
    } else {
      toast.error(res.error?.message || 'Failed to delete user');
    }
    setDeletingUser(false);
  };

  const userColumns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        key: 'member',
        header: 'Member Name & Phone',
        render: (u) => (
          <div>
            <div className="font-extrabold text-slate-900 text-[10px] sm:text-xs leading-tight flex items-center space-x-1">
              <span className="truncate max-w-[110px] sm:max-w-none">{u.full_name || u.phone}</span>
            </div>
            <div className="text-[9px] text-slate-500 font-mono flex items-center space-x-1 mt-0.5">
              <span>{u.phone}</span>
              <span className="sm:hidden text-sky-600 font-bold">• {u.referral_code}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'designation',
        header: 'Designation',
        render: (u) => (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 font-extrabold text-[8px] sm:text-[10px] border border-purple-200 whitespace-nowrap">
            <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 text-purple-500 shrink-0" />
            <span className="truncate max-w-[70px] sm:max-w-none">{u.designation?.name || 'Unbadged'}</span>
          </span>
        ),
      },
      {
        key: 'referral_code',
        header: 'Ref Code',
        className: 'hidden sm:table-cell',
        render: (u) => <span className="font-mono font-bold text-sky-600 text-xs">{u.referral_code}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        className: 'hidden sm:table-cell',
        render: (u) => <StatusBadge status={u.status} />,
      },
      {
        key: 'wallet_balance',
        header: 'Wallet',
        className: 'hidden sm:table-cell',
        render: (u) => (
          <span className="font-mono font-extrabold text-slate-800 text-xs">
            ৳{Number(u.wallet_balance || 0).toFixed(2)}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Operations',
        align: 'right',
        render: (u) => (
          <RowActionsMenu
            user={u}
            onSelectDetails={(user) => setSelectedUserForCards(user)}
            onAdjustBalance={(user) => setAdjustUser(user)}
            onAssignBadge={(user) => openBadgeModal(user)}
            onToggleStatus={(e, user, newStatus) => openStatusConfirmModal(e, user, newStatus)}
            onDeleteUser={(user) => setDeleteConfirmTarget(user)}
          />
        ),
      },
    ],
    [openBadgeModal, openStatusConfirmModal],
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
