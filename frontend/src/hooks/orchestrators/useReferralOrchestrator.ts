'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { BreadcrumbItem } from '../../components/users/UserBreadcrumbs';
import { useDebounce } from '../useDebounce';

export interface TreeMember {
  id: string;
  phone: string;
  full_name: string | null;
  referral_code: string;
  status?: string;
  is_premium?: boolean;
  created_at?: string;
  referred_by_id?: string | null;
  designation?: { name: string; stars?: number } | null;
}

export function useReferralOrchestrator() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [treeByParent, setTreeByParent] = useState<Map<string, TreeMember[]>>(new Map());
  const [allMembers, setAllMembers] = useState<TreeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: 'My Direct Referrals' },
  ]);

  useEffect(() => {
    if (user?.avatar_url) {
      setAvatarUrl(user.avatar_url);
    }
  }, [user?.avatar_url]);

  const userPhoto = avatarUrl || user?.avatar_url || '';
  const designationStars = user?.designation?.stars || 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Image file size should be less than 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result === 'string') {
        const newUrl = reader.result;
        setAvatarUrl(newUrl);
        await apiFetch('/auth/profile', {
          method: 'PATCH',
          body: JSON.stringify({ avatar_url: newUrl }),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchTree = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const res = await apiFetch<any>('/users/tree?depth=10');
    if (res.success && res.data?.tree) {
      const tree: Record<string, TreeMember[]> = res.data.tree;
      const byParent = new Map<string, TreeMember[]>();
      const flat: TreeMember[] = [];

      Object.values(tree).forEach((level: TreeMember[]) => {
        level.forEach((member) => {
          if (member.is_premium) {
            flat.push(member);
            const pid = member.referred_by_id ?? user.id;
            if (!byParent.has(pid)) byParent.set(pid, []);
            byParent.get(pid)!.push(member);
          }
        });
      });

      if (!byParent.has(user.id) && tree[1]?.length) {
        byParent.set(user.id, tree[1].filter((m) => m.is_premium));
      }

      setTreeByParent(byParent);
      setAllMembers(flat);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  useEffect(() => {
    if (user) {
      setBreadcrumbs([{ id: user.id, name: 'My Direct Referrals' }]);
    }
  }, [user?.id]);

  const currentParent = breadcrumbs[breadcrumbs.length - 1];

  const handleRowClick = useCallback((member: TreeMember) => {
    setBreadcrumbs((prev) => [
      ...prev,
      { id: member.id, name: member.full_name || member.phone || 'Member' },
    ]);
    setSearchTerm('');
  }, []);

  const handleBreadcrumbClick = useCallback((index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setSearchTerm('');
  }, []);

  const displayMembers = useMemo<TreeMember[]>(() => {
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      return allMembers.filter(
        (m) =>
          m.full_name?.toLowerCase().includes(q) ||
          m.phone?.toLowerCase().includes(q) ||
          m.referral_code?.toLowerCase().includes(q)
      );
    }
    return treeByParent.get(currentParent.id ?? (user?.id ?? '')) ?? [];
  }, [debouncedSearch, allMembers, treeByParent, currentParent.id, user?.id]);

  return {
    state: {
      avatarUrl,
      searchTerm,
      debouncedSearch,
      breadcrumbs,
      currentParent,
      loading,
      treeByParent,
      allMembers,
    },
    computed: {
      user,
      userPhoto,
      designationStars,
      displayMembers,
    },
    actions: {
      setSearchTerm,
      handleImageUpload,
      handleRowClick,
      handleBreadcrumbClick,
      fetchTree,
    },
  };
}
