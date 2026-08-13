'use client';

import { useState, useCallback } from 'react';
import { User, Designation } from '../types';
import { apiFetch } from '../lib/api';
import { toast } from 'sonner';

export interface UseDesignationBadgeReturn {
  selectedUserForBadge: User | null;
  setSelectedUserForBadge: React.Dispatch<React.SetStateAction<User | null>>;
  targetDesignation: string;
  setTargetDesignation: React.Dispatch<React.SetStateAction<string>>;
  targetSponsorId: string;
  setTargetSponsorId: React.Dispatch<React.SetStateAction<string>>;
  allBadgedLeaders: User[];
  savingBadge: boolean;
  openBadgeModal: (user: User) => void;
  handleAssignDesignation: (
    designations: Designation[],
    onSuccess?: (selectedUser: User, updatedUser: any, targetDesId: string, newDesObj: Designation | null) => void,
  ) => Promise<void>;
}

export function useDesignationBadge(): UseDesignationBadgeReturn {
  const [selectedUserForBadge, setSelectedUserForBadge] = useState<User | null>(null);
  const [targetDesignation, setTargetDesignation] = useState<string>('');
  const [targetSponsorId, setTargetSponsorId] = useState<string>('ROOT');
  const [allBadgedLeaders, setAllBadgedLeaders] = useState<User[]>([]);
  const [savingBadge, setSavingBadge] = useState(false);

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

  const handleAssignDesignation = useCallback(
    async (
      designations: Designation[],
      onSuccess?: (selectedUser: User, updatedUser: any, targetDesId: string, newDesObj: Designation | null) => void,
    ) => {
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

        toast.success(`Designation badge updated for ${selectedUserForBadge.full_name || selectedUserForBadge.phone}`);
        if (onSuccess) onSuccess(selectedUserForBadge, updatedUser, targetDesignation, newDesObj);
        setSelectedUserForBadge(null);
      } else {
        toast.error(res.error?.message || 'Designation assignment failed');
      }
      setSavingBadge(false);
    },
    [selectedUserForBadge, targetDesignation, targetSponsorId],
  );

  return {
    selectedUserForBadge,
    setSelectedUserForBadge,
    targetDesignation,
    setTargetDesignation,
    targetSponsorId,
    setTargetSponsorId,
    allBadgedLeaders,
    savingBadge,
    openBadgeModal,
    handleAssignDesignation,
  };
}
