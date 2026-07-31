'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';
import {
  getMaxLevelFromDesignations,
  getTotalAssignedUsersFromDesignations,
  filterUsersByQuery,
} from '../lib/utils';

export interface DesignationItem {
  id: string;
  name: string;
  stars: number;
  max_level: number;
  _count?: {
    users: number;
  };
}

export function useDesignations(isAdmin = true) {
  const [designations, setDesignations] = useState<DesignationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [stars, setStars] = useState<number>(1);
  const [maxLevel, setMaxLevel] = useState<number>(1);

  // User Assignment Modal state
  const [selectedDesignation, setSelectedDesignation] = useState<DesignationItem | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState<string>('');
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  const fetchDesignations = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<DesignationItem[]>('/admin/designations', { isAdmin });
    if (res.success && res.data) {
      setDesignations(res.data);
    }
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    fetchDesignations();
  }, [fetchDesignations]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setStars(1);
    setMaxLevel(1);
  };

  const handleEditClick = (des: DesignationItem) => {
    setEditingId(des.id);
    setName(des.name);
    setStars(des.stars || 1);
    setMaxLevel(des.max_level || 1);
  };

  const saveDesignation = async () => {
    setSaving(true);
    const res = editingId
      ? await apiFetch(`/admin/designations/${editingId}`, {
          method: 'PATCH',
          isAdmin,
          body: JSON.stringify({
            name,
            stars: Number(stars),
            max_level: Number(maxLevel),
          }),
        })
      : await apiFetch('/admin/designations', {
          method: 'POST',
          isAdmin,
          body: JSON.stringify({
            name,
            stars: Number(stars),
            max_level: Number(maxLevel),
          }),
        });

    if (res.success) {
      resetForm();
      await fetchDesignations();
    } else {
      setSaving(false);
      throw new Error(res.error?.message || 'Failed to save designation');
    }
    setSaving(false);
  };

  const deleteDesignation = async (id: string) => {
    const res = await apiFetch(`/admin/designations/${id}`, { method: 'DELETE', isAdmin });
    if (res.success) {
      await fetchDesignations();
    } else {
      throw new Error(res.error?.message || 'Failed to delete designation');
    }
  };

  const openAssignModal = async (des: DesignationItem) => {
    setSelectedDesignation(des);
    setLoadingUsers(true);
    const res = await apiFetch<any>('/admin/users?limit=100', { isAdmin });
    if (res.success && res.data) {
      setAllUsers(res.data.data || res.data || []);
    }
    setLoadingUsers(false);
  };

  const closeAssignModal = () => {
    setSelectedDesignation(null);
    setUserSearch('');
  };

  const toggleUserDesignation = async (userId: string, currentDesId: string | null) => {
    if (!selectedDesignation) return;
    const newDesId = currentDesId === selectedDesignation.id ? null : selectedDesignation.id;
    const res = await apiFetch(`/admin/users/${userId}/designation`, {
      method: 'PATCH',
      isAdmin,
      body: JSON.stringify({ designation_id: newDesId }),
    });

    if (res.success) {
      await openAssignModal(selectedDesignation);
      await fetchDesignations();
    } else {
      throw new Error(res.error?.message || 'Failed to update user designation');
    }
  };

  const filteredUsers = filterUsersByQuery(allUsers, userSearch);
  const maxDepthLevel = getMaxLevelFromDesignations(designations);
  const totalAssignedMembers = getTotalAssignedUsersFromDesignations(designations);

  return {
    designations,
    loading,
    saving,
    editingId,
    name,
    stars,
    maxLevel,
    selectedDesignation,
    allUsers,
    filteredUsers,
    userSearch,
    loadingUsers,
    maxDepthLevel,
    totalAssignedMembers,
    setName,
    setStars,
    setMaxLevel,
    setUserSearch,
    resetForm,
    handleEditClick,
    saveDesignation,
    deleteDesignation,
    openAssignModal,
    closeAssignModal,
    toggleUserDesignation,
    refreshDesignations: fetchDesignations,
  };
}
