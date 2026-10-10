'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '../../lib/api';
import { LeaderboardEntry } from '../../types';
import { useDebounce } from '../useDebounce';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface PaginatedResponse {
  data: LeaderboardEntry[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

let cachedTop3: LeaderboardEntry[] = [];
let cachedLeaderboard: LeaderboardEntry[] = [];

export function useLeaderboardOrchestrator() {
  const [top3Entries, setTop3Entries] = useState<LeaderboardEntry[]>(() => cachedTop3);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => cachedLeaderboard);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(() => cachedLeaderboard.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const observerTarget = useRef<HTMLDivElement | null>(null);

  const fetchTop3 = useCallback(async () => {
    const res = await apiFetch<LeaderboardEntry[]>('/leaderboard');
    if (res.success && res.data) {
      const topSlice = res.data.slice(0, 3);
      cachedTop3 = topSlice;
      setTop3Entries(topSlice);
    }
  }, []);

  const fetchPage = useCallback(
    async (pageNum: number, search: string, append = false) => {
      if (pageNum === 1) {
        if (cachedLeaderboard.length === 0 || search) {
          setLoadingInitial(true);
        }
      } else {
        setLoadingMore(true);
      }

      const res = await apiFetch<PaginatedResponse>(
        `/leaderboard?page=${pageNum}&limit=20&search=${encodeURIComponent(search)}`
      );

      if (res.success && res.data) {
        const newEntries = res.data.data;
        if (pageNum === 1 && !search) {
          cachedLeaderboard = newEntries;
        }
        setLeaderboard((prev) => (append ? [...prev, ...newEntries] : newEntries));
        setHasMore(res.data.hasMore);
        setPage(res.data.page);
      } else if (res.success && Array.isArray(res.data)) {
        const raw = res.data as unknown as LeaderboardEntry[];
        if (pageNum === 1 && !search) {
          cachedLeaderboard = raw;
        }
        setLeaderboard(raw);
        setHasMore(false);
      }

      setLoadingInitial(false);
      setLoadingMore(false);
    },
    []
  );

  useEffect(() => {
    fetchTop3();
  }, [fetchTop3]);

  useEffect(() => {
    fetchPage(1, debouncedSearch, false);
  }, [debouncedSearch, fetchPage]);

  useEffect(() => {
    if (!observerTarget.current || !hasMore || loadingMore || loadingInitial) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchPage(page + 1, debouncedSearch, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasMore, loadingMore, loadingInitial, page, debouncedSearch, fetchPage]);

  const getPhotoUrl = (url?: string | null) => {
    if (!url) return `https://api.dicebear.com/7.x/avataaars/svg?seed=user`;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const top1 = top3Entries.find((item) => item.rank === 1);
  const top2 = top3Entries.find((item) => item.rank === 2);
  const top3 = top3Entries.find((item) => item.rank === 3);

  const refresh = useCallback(() => {
    fetchTop3();
    fetchPage(1, debouncedSearch, false);
  }, [fetchTop3, fetchPage, debouncedSearch]);

  return {
    state: {
      top3Entries,
      leaderboard,
      page,
      hasMore,
      loadingInitial,
      loadingMore,
      searchQuery,
      debouncedSearch,
      observerTarget,
    },
    computed: {
      top1,
      top2,
      top3,
    },
    actions: {
      setSearchQuery,
      getPhotoUrl,
      fetchTop3,
      fetchPage,
      refresh,
    },
  };
}
