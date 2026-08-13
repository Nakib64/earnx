'use client';

import { useState, useCallback } from 'react';
import { User, UserStatus } from '../types';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';

export interface UseUserStatusActionsReturn {
  statusConfirmTarget: { user: User; newStatus: UserStatus } | null;
  setStatusConfirmTarget: React.Dispatch<
    React.SetStateAction<{ user: User; newStatus: UserStatus } | null>
  >;
  updatingStatus: boolean;
  openStatusConfirmModal: (e: React.MouseEvent, user: User, newStatus: UserStatus) => void;
  handleStatusChangeConfirm: (
    onSuccess?: (user: User, newStatus: UserStatus) => void,
  ) => Promise<void>;
}

export function useUserStatusActions(): UseUserStatusActionsReturn {
  const [statusConfirmTarget, setStatusConfirmTarget] = useState<{
    user: User;
    newStatus: UserStatus;
  } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const openStatusConfirmModal = useCallback(
    (e: React.MouseEvent, user: User, newStatus: UserStatus) => {
      e.stopPropagation();
      setStatusConfirmTarget({ user, newStatus });
    },
    [],
  );

  const handleStatusChangeConfirm = useCallback(
    async (onSuccess?: (user: User, newStatus: UserStatus) => void) => {
      if (!statusConfirmTarget) return;
      const { user, newStatus } = statusConfirmTarget;
      setUpdatingStatus(true);

      const res = await apiFetch(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        isAdmin: true,
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        toast.success(`User ${user.full_name || user.phone} status updated to ${newStatus}`);
        if (onSuccess) onSuccess(user, newStatus);
        setStatusConfirmTarget(null);
      } else {
        toast.error(res.error?.message || 'Status update failed');
      }
      setUpdatingStatus(false);
    },
    [statusConfirmTarget],
  );

  return {
    statusConfirmTarget,
    setStatusConfirmTarget,
    updatingStatus,
    openStatusConfirmModal,
    handleStatusChangeConfirm,
  };
}
