'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

  const requestIdRef = useRef(0);

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
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setUsers([]); // Clear stale table data immediately while fetching new level

    let url = `/admin/users?page=1&limit=100`;

    const activeSearch = searchTerm.trim() ? debouncedSearch.trim() : '';

    if (activeSearch) {
      url += `&search=${encodeURIComponent(activeSearch)}`;
    } else if (currentParent.id !== null) {
      url += `&referred_by_id=${currentParent.id}`;
    } else {
      url += `&has_designation=true`;
    }

    try {
      const fetchDesignations = designations.length === 0;
      const [usersRes, desRes] = await Promise.all([
        apiFetch<User[]>(url, { isAdmin: true }),
        fetchDesignations
          ? apiFetch<Designation[]>('/admin/designations', { isAdmin: true })
          : Promise.resolve({ success: true, data: null, message: '' }),
      ]);

      // If a newer request was dispatched while this request was in flight, ignore this response!
      if (currentRequestId !== requestIdRef.current) return;

      if (usersRes.success && usersRes.data) {
        const dataArr = (usersRes.data as any).data || (Array.isArray(usersRes.data) ? usersRes.data : []);
        setUsers(dataArr);
      } else {
        setUsers([]);
      }
      if (fetchDesignations && desRes.success && desRes.data) {
        setDesignations(desRes.data);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [currentParent.id, debouncedSearch, searchTerm === '']);

  useEffect(() => {
    if (admin) loadData();
  }, [admin, loadData]);

  // Show loading skeleton while user is actively typing search term before debounce fires
  const isDebouncing = searchTerm.trim() !== '' && searchTerm.trim() !== debouncedSearch.trim();
  const effectiveLoading = loading || isDebouncing;

  const handleRowClick = useCallback((user: User) => {
    requestIdRef.current++; // Invalidate any pending in-flight requests immediately
    setSelectedUserForCards(user);
    setSearchTerm('');
    setUsers([]); // Clear stale table rows immediately on row click
    setLoading(true);
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
    requestIdRef.current++; // Invalidate any pending in-flight requests immediately
    setSearchTerm('');
    setUsers([]); // Clear stale table rows immediately on breadcrumb navigation
    setLoading(true);
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  }, []);

  return {
    users,
    setUsers,
    designations,
    setDesignations,
    searchTerm,
    setSearchTerm,
    loading: effectiveLoading,
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

