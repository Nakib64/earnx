'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { MarketplaceNotification } from '../types';

export function useMarketplaceNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<MarketplaceNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);

    try {
      const res = await apiFetch<any>('/marketplace/notifications?limit=35', {
        skipCache: true,
        forceRefresh: true,
      });

      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(Number(res.data.unread_count || 0));
      }
    } catch {
      // Non-blocking silent fail
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  // Initial load and periodic polling every 25 seconds
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    intervalRef.current = setInterval(() => {
      fetchNotifications(true);
    }, 25000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!user || unreadCount === 0) return;

    // Optimistic UI update
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    try {
      await apiFetch('/marketplace/notifications/mark-all-read', {
        method: 'POST',
        skipCache: true,
      });
    } catch {
      // Re-sync on failure
      fetchNotifications(true);
    }
  }, [user, unreadCount, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await apiFetch(`/marketplace/notifications/${notificationId}/read`, {
        method: 'PATCH',
        skipCache: true,
      });
    } catch {
      fetchNotifications(true);
    }
  }, [user, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    isOpen,
    setIsOpen,
    fetchNotifications,
    markAllAsRead,
    markAsRead,
  };
}
