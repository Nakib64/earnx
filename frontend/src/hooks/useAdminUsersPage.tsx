'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { User, Designation, UserStatus } from '../types';
import { ColumnDef } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { BreadcrumbItem } from '../components/users/UserBreadcrumbs';
import { useDebounce } from './useDebounce';
import { Award, ChevronRight, DollarSign, Users, Trash2 } from 'lucide-react';
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
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setTargetDesignation: React.Dispatch<React.SetStateAction<string>>;
  setTargetSponsorId: React.Dispatch<React.SetStateAction<string>>;
  setStatusConfirmTarget: React.Dispatch<React.SetStateAction<{ user: User; newStatus: UserStatus } | null>>;
  setAdjustUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSelectedUserForBadge: React.Dispatch<React.SetStateAction<User | null>>;
  setDeleteConfirmTarget: React.Dispatch<React.SetStateAction<User | null>>;
  setDetailModalUser: React.Dispatch<React.SetStateAction<User | null>>;
  handleDeleteUserConfirm: () => Promise<void>;
  handleRowClick: (user: User) => void;
  handleBreadcrumbClick: (index: number) => void;
  handleStatusChangeConfirm: () => Promise<void>;
  handleBalanceAdjustSubmit: (user: User, rawAmount: number, type: 'ADD' | 'SUBTRACT', reason: string) => Promise<void>;
  handleAssignDesignation: () => Promise<void>;
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
    } else if (currentParent.id === null) {
      url += `&has_designation=true`;
    } else {
      url += `&referred_by_id=${currentParent.id}`;
    }

    const [usersRes, desRes] = await Promise.all([
      apiFetch<User[]>(url, { isAdmin: true }),
      apiFetch<Designation[]>('/admin/designations', { isAdmin: true }),
    ]);

    if (usersRes.success && usersRes.data) {
      const userList = Array.isArray(usersRes.data)
        ? usersRes.data
        : (usersRes.data as any).data || [];
      setUsers(userList);
    } else {
      setUsers([]);
      if (usersRes.error) {
        toast.error(usersRes.error.message);
      }
    }

    if (desRes.success && desRes.data) {
      const desList = Array.isArray(desRes.data)
        ? desRes.data
        : (desRes.data as any).data || [];
      setDesignations(desList);
    }

    setLoading(false);
  }, [debouncedSearch, currentParent.id]);

  useEffect(() => {
    if (admin) {
      loadData();
    }
  }, [admin, loadData]);

  // Fetch badged leaders for sponsor dropdown
  const fetchAllBadgedLeaders = useCallback(async () => {
    const res = await apiFetch<User[]>('/admin/users?page=1&limit=200&has_designation=true', {
      isAdmin: true,
    });
    if (res.success && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
      setAllBadgedLeaders(list);
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
    setBreadcrumbs((prev) => [
      ...prev,
      { id: user.id, name: user.full_name || user.phone || 'User' },
    ]);
  }, []);

  const handleBreadcrumbClick = useCallback((index: number) => {
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
      toast.success(`User ${user.full_name || user.phone} status updated to ${newStatus}`);
      setStatusConfirmTarget(null);
    } else {
      toast.error(res.error?.message || 'Status update failed');
    }
    setUpdatingStatus(false);
  }, [statusConfirmTarget]);

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
      toast.success(`Designation badge updated for ${selectedUserForBadge.full_name || selectedUserForBadge.phone}`);
      setSelectedUserForBadge(null);
    } else {
      toast.error(res.error?.message || 'Designation assignment failed');
    }
    setSavingBadge(false);
  }, [selectedUserForBadge, targetDesignation, targetSponsorId, designations]);

  const handleBalanceAdjustSubmit = useCallback(
    async (user: User, rawAmount: number, type: 'ADD' | 'SUBTRACT', reason: string) => {
      const finalAmount = type === 'ADD' ? rawAmount : -rawAmount;

      setAdjusting(true);
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
    [],
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
          <div className="flex items-center justify-end space-x-1 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDetailModalUser(u);
              }}
              className="p-1 sm:px-2 sm:py-1 bg-sky-100 text-sky-800 hover:bg-sky-200 rounded-md font-bold text-[9px] sm:text-[11px] flex items-center space-x-0.5 transition-colors"
              title="View details & downlines"
            >
              <Users className="w-3 h-3 text-sky-600" />
              <span className="hidden sm:inline">Details</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setAdjustUser(u);
              }}
              className="p-1 sm:px-2 sm:py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-md font-bold text-[9px] sm:text-[11px] flex items-center space-x-0.5 transition-colors"
              title="Adjust balance"
            >
              <DollarSign className="w-3 h-3 text-emerald-600" />
              <span className="hidden sm:inline">Adjust</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                openBadgeModal(u);
              }}
              className="px-1.5 sm:px-2 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-md font-bold text-[8px] sm:text-[11px] transition-colors"
              title="Badge"
            >
              Badge
            </button>

            {u.status === UserStatus.DISABLED && (
              <button
                onClick={(e) => openStatusConfirmModal(e, u, UserStatus.ACTIVE)}
                className="px-1.5 sm:px-2 py-1 bg-emerald-500 text-white rounded-md font-bold text-[8px] sm:text-[11px] hover:bg-emerald-600 transition-colors"
              >
                Activate
              </button>
            )}

            {u.status === UserStatus.ACTIVE && (
              <button
                onClick={(e) => openStatusConfirmModal(e, u, UserStatus.BLOCKED)}
                className="px-1.5 sm:px-2 py-1 bg-rose-100 text-rose-800 rounded-md font-bold text-[8px] sm:text-[11px] hover:bg-rose-200 transition-colors"
              >
                Block
              </button>
            )}

            {u.status === UserStatus.BLOCKED && (
              <button
                onClick={(e) => openStatusConfirmModal(e, u, UserStatus.ACTIVE)}
                className="px-1.5 sm:px-2 py-1 bg-sky-100 text-sky-800 rounded-md font-bold text-[8px] sm:text-[11px] hover:bg-sky-200 rounded-md transition-colors"
              >
                Unblock
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirmTarget(u);
              }}
              className="p-1 sm:px-2 sm:py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-md font-bold text-[8px] sm:text-[11px] transition-colors"
              title="Delete user profile"
            >
              <Trash2 className="w-3 h-3 text-red-600 sm:hidden" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
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
    setSearchTerm,
    setTargetDesignation,
    setTargetSponsorId,
    setStatusConfirmTarget,
    setAdjustUser,
    setSelectedUserForBadge,
    setDeleteConfirmTarget,
    setDetailModalUser,
    handleDeleteUserConfirm,
    handleRowClick,
    handleBreadcrumbClick,
    handleStatusChangeConfirm,
    handleBalanceAdjustSubmit,
    handleAssignDesignation,
    loadData,
  };
}
