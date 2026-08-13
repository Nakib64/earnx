'use client';

import { useState, useCallback } from 'react';
import { User } from '../types';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';

export interface UseUserDeletionReturn {
  deleteConfirmTarget: User | null;
  setDeleteConfirmTarget: React.Dispatch<React.SetStateAction<User | null>>;
  deletingUser: boolean;
  handleDeleteUserConfirm: (onSuccess?: (deletedUser: User) => void) => Promise<void>;
}

export function useUserDeletion(): UseUserDeletionReturn {
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const handleDeleteUserConfirm = useCallback(
    async (onSuccess?: (deletedUser: User) => void) => {
      if (!deleteConfirmTarget) return;
      const targetUser = deleteConfirmTarget;
      setDeletingUser(true);

      const res = await apiFetch(`/admin/users/${targetUser.id}`, {
        method: 'DELETE',
        isAdmin: true,
      });

      if (res.success) {
        toast.success(`User ${targetUser.full_name || targetUser.phone} deleted successfully`);
        if (onSuccess) onSuccess(targetUser);
        setDeleteConfirmTarget(null);
      } else {
        toast.error(res.error?.message || 'Failed to delete user');
      }
      setDeletingUser(false);
    },
    [deleteConfirmTarget],
  );

  return {
    deleteConfirmTarget,
    setDeleteConfirmTarget,
    deletingUser,
    handleDeleteUserConfirm,
  };
}
