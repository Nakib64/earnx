'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Heart,
  MessageSquare,
  CornerDownRight,
  CheckCheck,
  Check,
  X,
  Inbox,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useMarketplaceNotifications } from '../../hooks/useMarketplaceNotifications';
import { MarketplaceNotification } from '../../types';

interface MarketplaceNotificationDropdownProps {
  onSelectPost?: (postId: string) => void;
  className?: string;
}

export function MarketplaceNotificationDropdown({
  onSelectPost,
  className = '',
}: MarketplaceNotificationDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    notifications,
    unreadCount,
    loading,
    isOpen,
    setIsOpen,
    markAllAsRead,
    markAsRead,
  } = useMarketplaceNotifications();

  const [mounted, setMounted] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MARKETPLACE_LIKE':
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 shadow-2xs">
            <Heart className="w-4 h-4 fill-rose-500" />
          </div>
        );
      case 'MARKETPLACE_REPLY':
        return (
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0 shadow-2xs">
            <CornerDownRight className="w-4 h-4" />
          </div>
        );
      case 'MARKETPLACE_COMMENT':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0 shadow-2xs">
            <MessageSquare className="w-4 h-4" />
          </div>
        );
    }
  };

  const handleNotificationClick = (n: MarketplaceNotification) => {
    if (!n.is_read) {
      markAsRead(n.id);
    }

    setIsOpen(false);

    if (n.entity_id) {
      if (onSelectPost) {
        onSelectPost(n.entity_id);
      } else {
        if (pathname?.startsWith('/dashboard/marketplace')) {
          const el = document.getElementById(`post-${n.entity_id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-2', 'ring-[#009F6B]', 'transition-all');
            setTimeout(() => el.classList.remove('ring-2', 'ring-[#009F6B]'), 2500);
          }
        } else {
          router.push(`/dashboard/marketplace#post-${n.entity_id}`);
        }
      }
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filterTab === 'unread') {
      return notifications.filter((n) => !n.is_read);
    }
    return notifications;
  }, [notifications, filterTab]);

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden font-[family-name:var(--font-montserrat)] select-none">
          {/* Frosted Atmospheric Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-none">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-white/95 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.2)] flex flex-col border-l border-white/80 pointer-events-auto"
            >
              {/* ── DRAWER HEADER ── */}
              <div className="p-5 sm:p-6 border-b border-slate-100 bg-white/80 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#009F6B] shrink-0 shadow-2xs">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Activity &amp; Updates
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {unreadCount > 0 ? (
                        <span className="text-[#009F6B] font-bold">
                          {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
                        </span>
                      ) : (
                        'You are all caught up'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Close notifications"
                    aria-label="Close notifications"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* ── FILTER TABS & BATCH ACTION BAR ── */}
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-200/60 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFilterTab('all')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      filterTab === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTab('unread')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      filterTab === 'unread'
                        ? 'bg-[#009F6B] text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Unread</span>
                    {unreadCount > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          filterTab === 'unread' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#009F6B] hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                    title="Mark all notifications as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* ── NOTIFICATIONS SCROLLABLE LIST ── */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 no-scrollbar divide-y-0">
                {loading && notifications.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-9 h-9 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                    <span className="text-xs font-semibold text-slate-400">Loading your updates...</span>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-3 py-12 px-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400">
                      <Inbox className="w-7 h-7 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        {filterTab === 'unread' ? 'No Unread Notifications' : 'No Activity Yet'}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                        {filterTab === 'unread'
                          ? 'You have caught up with all likes, comments, and replies!'
                          : "When members like your posts, comment, or reply, you'll receive notifications right here."}
                      </p>
                    </div>

                    {filterTab === 'unread' && notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setFilterTab('all')}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <span>View All Notifications</span>
                      </button>
                    )}
                  </div>
                ) : (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer group flex items-start space-x-3.5 ${
                        !item.is_read
                          ? 'bg-emerald-50/40 hover:bg-emerald-50/70 border-emerald-200/80 shadow-2xs'
                          : 'bg-white/70 hover:bg-slate-50 border-slate-100 hover:border-slate-200/80'
                      }`}
                    >
                      {/* Icon */}
                      {getNotificationIcon(item.type)}

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            {item.type === 'MARKETPLACE_LIKE'
                              ? 'New Reaction'
                              : item.type === 'MARKETPLACE_REPLY'
                              ? 'New Reply'
                              : 'New Comment'}
                          </span>
                          {!item.is_read && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#009F6B] shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#009F6B] animate-pulse" />
                              <span>New</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug mt-0.5 line-clamp-2 group-hover:text-slate-900">
                          {item.message}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatTimeAgo(item.created_at)}</span>
                          </span>

                          <span className="text-[11px] font-bold text-[#009F6B] opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-0.5">
                            <span>View post</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ── DRAWER FOOTER ── */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-white/90 shrink-0 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/dashboard/marketplace');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-4 h-4 text-[#009F6B]" />
                  <span>Go to Community Marketplace Feed</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>

                <p className="text-[10px] text-center text-slate-400 font-medium">
                  Click any update to instantly open and highlight the post
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* ── BELL TRIGGER BUTTON (Same line and sizing as shopping cart) ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 sm:p-2.5 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-white text-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
        title="Notifications"
        aria-label="Open notifications drawer"
      >
        <Bell className="w-5 h-5 text-slate-700" />

        {/* Unread Indicator Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#009F6B] text-white text-[10px] font-black flex items-center justify-center shadow-xs animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── PORTAL MOUNTED DRAWER ── */}
      {mounted && typeof document !== 'undefined'
        ? createPortal(drawerContent, document.body)
        : null}
    </div>
  );
}

// Named alias export
export const MarketplaceNotificationDrawer = MarketplaceNotificationDropdown;
