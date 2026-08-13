'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { User, Designation } from '../types';
import { BreadcrumbItem } from '../components/users/UserBreadcrumbs';
import { useDebounce } from './useDebounce';
import { useSearchParams } from 'next/navigation';

export interface UseUserTreeDataReturn {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  designations: Designation[];
  setDesignations: React.Dispatch<React.SetStateAction<Designation[]>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: React.Dispatch<React.SetStateAction<BreadcrumbItem[]>>;
  currentParent: BreadcrumbItem;
  selectedUserForCards: User | null;
  setSelectedUserForCards: React.Dispatch<React.SetStateAction<User | null>>;
  loadData: () => Promise<void>;
  handleRowClick: (user: User) => void;
  handleBreadcrumbClick: (index: number) => void;
}

export function useUserTreeData(): UseUserTreeDataReturn {
  const { admin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [loading, setLoading] = useState(true);
  const [selectedUserForCards, setSelectedUserForCards] = useState<User | null>(null);

  const searchParams = useSearchParams();
  const queryParentId = searchParams ? searchParams.get('parentId') : null;
  const queryParentName = searchParams ? searchParams.get('parentName') : null;

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

  const loadData = useCallback(async () => {
    setLoading(true);

    let url = `/admin/users?page=1&limit=100`;

    if (debouncedSearch.trim()) {
      url += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
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

  return {
    users,
    setUsers,
    designations,
    setDesignations,
    searchTerm,
    setSearchTerm,
    loading,
    breadcrumbs,
    setBreadcrumbs,
    currentParent,
    selectedUserForCards,
    setSelectedUserForCards,
    loadData,
    handleRowClick,
    handleBreadcrumbClick,
  };
}
