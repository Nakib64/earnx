'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { useDebounce } from '../../../hooks/useDebounce';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Trash2,
  Heart,
  MessageCircle,
  Eye,
  AlertTriangle,
  X,
  User,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Crown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';

interface MarketplaceAuthor {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  referral_code?: string;
  is_premium?: boolean;
  created_at?: string;
  designation?: {
    name?: string;
    stars?: number;
  } | null;
}

interface AdminCommentReply {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  created_at: string;
  user?: MarketplaceAuthor;
}

interface AdminComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string | null;
  content: string;
  created_at: string;
  user?: MarketplaceAuthor;
  replies?: AdminCommentReply[];
}

interface AdminPost {
  id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  updated_at?: string;
  user?: MarketplaceAuthor;
  likes_count: number;
  comments_count: number;
  comments: AdminComment[];
}

interface MarketplaceStats {
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  todayPosts: number;
  activeAuthors: number;
}

export default function AdminMarketplacePage() {
  const { admin } = useAuth();

  // Feed & Stats Data
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [stats, setStats] = useState<MarketplaceStats>({
    totalPosts: 0,
    totalComments: 0,
    totalLikes: 0,
    todayPosts: 0,
    activeAuthors: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);
  const [filterType, setFilterType] = useState<'ALL' | 'MEDIA' | 'COMMENTS'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Comments toggles
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Action Modals State
  const [postToDelete, setPostToDelete] = useState<AdminPost | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<{ id: string; postId: string; isReply?: boolean } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // URL helper for images
  const getMediaUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const origin = apiBase.replace(/\/api\/?$/, '');
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    const res = await apiFetch<{ success: boolean; data: MarketplaceStats }>(
      '/marketplace/admin/stats',
      { isAdmin: true, skipCache: true },
    );
    if (res.success && res.data) {
      setStats((res.data as any).data || res.data);
    }
  }, []);

  // Fetch Posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const queryParts = [`page=${page}`, 'limit=15'];
    if (debouncedSearch.trim()) {
      queryParts.push(`search=${encodeURIComponent(debouncedSearch.trim())}`);
    }

    const res = await apiFetch<any>(`/marketplace/admin/posts?${queryParts.join('&')}`, {
      isAdmin: true,
      skipCache: true,
    });

    if (res.success && res.data) {
      const payload = res.data;
      setPosts(payload.data || []);
      setTotalPages(payload.meta?.totalPages || 1);
      setTotalRecords(payload.meta?.total || 0);
    } else {
      toast.error('Failed to load marketplace posts');
    }
    setLoading(false);
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchPosts(), fetchStats()]);
      toast.info('Marketplace feed refreshed');
    } catch {
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  // Delete Post
  const handleConfirmDeletePost = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);

    const res = await apiFetch(`/marketplace/admin/posts/${postToDelete.id}`, {
      method: 'DELETE',
      isAdmin: true,
    });

    if (res.success) {
      toast.success('Post removed permanently');
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setPostToDelete(null);
      fetchStats();
    } else {
      toast.error(res.error?.message || 'Failed to delete post');
    }
    setIsDeleting(false);
  };

  // Delete Comment / Reply
  const handleConfirmDeleteComment = async () => {
    if (!commentToDelete) return;
    setIsDeleting(true);

    const res = await apiFetch(`/marketplace/admin/comments/${commentToDelete.id}`, {
      method: 'DELETE',
      isAdmin: true,
    });

    if (res.success) {
      toast.success('Comment removed permanently');
      // Update local state cleanly
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== commentToDelete.postId) return post;
          // Filter top-level or reply
          const updatedComments = (post.comments || [])
            .filter((c) => c.id !== commentToDelete.id)
            .map((c) => ({
              ...c,
              replies: (c.replies || []).filter((r) => r.id !== commentToDelete.id),
            }));

          return {
            ...post,
            comments: updatedComments,
            comments_count: Math.max(0, post.comments_count - 1),
          };
        }),
      );
      setCommentToDelete(null);
      fetchStats();
    } else {
      toast.error(res.error?.message || 'Failed to delete comment');
    }
    setIsDeleting(false);
  };

  // Filter posts based on tab
  const filteredPosts = useMemo(() => {
    if (filterType === 'MEDIA') {
      return posts.filter((p) => Boolean(p.image_url));
    }
    if (filterType === 'COMMENTS') {
      return posts.filter((p) => (p.comments?.length || 0) > 0);
    }
    return posts;
  }, [posts, filterType]);

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16 font-[family-name:var(--font-montserrat)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        
        {/* ── 1. PAGE HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#009F6B]" />
              Community Platform &amp; Content Governance
            </div>

            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Marketplace &amp; Feed Moderation
            </h1>

            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Supervise all member community updates, inspect posted media attachments, manage user interactions, and purge inappropriate posts or comments with full admin authority.
            </p>

            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                Live Content Stream &bull;{' '}
                <strong className="text-slate-900 font-semibold">
                  {totalRecords} Total Posts Monitored
                </strong>
              </span>
            </div>
          </div>

          {/* Action Header Button */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Link
              href="/dashboard/marketplace"
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-white text-xs font-semibold text-slate-700 shadow-xs transition-all hover:shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View User Feed</span>
            </Link>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-md text-xs font-semibold text-slate-700 hover:bg-white hover:text-slate-900 shadow-xs transition-all duration-200 hover:shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#009F6B]' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Feed'}</span>
            </button>
          </div>
        </div>

        {/* ── 2. METRIC / KPI SUMMARY CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* Total Posts */}
          <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-4 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Posts
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#009F6B]/10 text-[#009F6B] flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.totalPosts}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className="text-[#009F6B] font-bold">+{stats.todayPosts}</span> today
            </div>
          </div>

          {/* Active Contributors */}
          <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-4 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Posters
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.activeAuthors}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 font-medium">
              Registered Authors
            </div>
          </div>

          {/* Comments Count */}
          <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-4 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Discussions &amp; Replies
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.totalComments}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 font-medium">
              Threaded comments
            </div>
          </div>

          {/* Total Likes */}
          <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-4 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Community Reactions
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5 text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.totalLikes}
            </div>
            <div className="mt-1 text-[11px] text-slate-500 font-medium">
              Post likes &amp; hearts
            </div>
          </div>
        </div>

        {/* ── 3. SEARCH & FILTER TOOLBAR ── */}
        <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by author name, phone, email, or post content..."
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200/80 bg-white/90 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#009F6B]/30 focus:border-[#009F6B] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'ALL'
                    ? 'bg-[#009F6B] text-white shadow-xs'
                    : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                All Posts
              </button>
              <button
                onClick={() => setFilterType('MEDIA')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'MEDIA'
                    ? 'bg-[#009F6B] text-white shadow-xs'
                    : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>With Media</span>
              </button>
              <button
                onClick={() => setFilterType('COMMENTS')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'COMMENTS'
                    ? 'bg-[#009F6B] text-white shadow-xs'
                    : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>With Comments</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. POSTS MODERATION FEED ── */}
        {loading && posts.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 shadow-xs animate-pulse space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="w-32 h-3.5 bg-slate-200 rounded-md" />
                    <div className="w-20 h-2.5 bg-slate-200 rounded-md" />
                  </div>
                </div>
                <div className="w-full h-12 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-12 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Marketplace Posts Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm
                ? 'No posts matched your current search filters. Try using different keywords or clearing the search.'
                : 'There are currently no community posts recorded on the platform.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredPosts.map((post) => {
              const isExpanded = expandedComments[post.id] ?? false;
              const hasComments = (post.comments || []).length > 0;

              return (
                <div
                  key={post.id}
                  className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  {/* Post Header: Author info & Actions */}
                  <div className="p-4 sm:p-5 flex items-start justify-between gap-3 border-b border-slate-100">
                    <div className="flex items-center gap-3.5">
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-full bg-slate-100 border-2 border-white ring-2 ring-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden shadow-2xs">
                        {post.user?.avatar_url ? (
                          <img
                            src={getMediaUrl(post.user.avatar_url)}
                            alt={post.user?.full_name || 'Author'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (post.user?.full_name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Author Details */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">
                            {post.user?.full_name || 'Anonymous User'}
                          </span>

                          {post.user?.is_premium && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-700 border border-amber-500/20">
                              <Crown className="w-3 h-3 text-amber-600" />
                              VIP
                            </span>
                          )}

                          {post.user?.designation?.name && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
                              {post.user.designation.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium flex-wrap mt-0.5">
                          {post.user?.phone && <span>{post.user.phone}</span>}
                          {post.user?.email && (
                            <>
                              <span>&bull;</span>
                              <span>{post.user.email}</span>
                            </>
                          )}
                          <span>&bull;</span>
                          <span className="text-slate-400">{formatTimeAgo(post.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Admin Delete Action */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setPostToDelete(post)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Delete Post permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete Post</span>
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  {post.content && (
                    <div className="px-4 sm:px-5 pt-3.5 pb-2 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                      {post.content}
                    </div>
                  )}

                  {/* Post Image Attachment */}
                  {post.image_url && (
                    <div className="px-4 sm:px-5 py-3">
                      <div
                        onClick={() => setPreviewImage(getMediaUrl(post.image_url))}
                        className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 max-h-[420px] flex items-center justify-center cursor-pointer group"
                      >
                        <img
                          src={getMediaUrl(post.image_url)}
                          alt="Attachment"
                          className="w-full max-h-[420px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px]">
                          <Eye className="w-4 h-4" />
                          <span>Click to expand full size</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Post Metrics & Footer */}
                  <div className="px-4 sm:px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        <span>{post.likes_count || 0} Likes</span>
                      </span>

                      <span className="flex items-center gap-1.5 text-slate-600 font-semibold">
                        <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>{post.comments_count || 0} Comments</span>
                      </span>
                    </div>

                    {/* Toggle Comments Button */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedComments((prev) => ({
                          ...prev,
                          [post.id]: !isExpanded,
                        }))
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-[#009F6B] transition-colors cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Comments' : `Manage Comments (${post.comments?.length || 0})`}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* ── EXPANDABLE COMMENTS & REPLIES SECTION ── */}
                  {isExpanded && (
                    <div className="bg-slate-50/70 border-t border-slate-200/60 p-4 sm:p-5 space-y-3.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>Threaded Comments Moderation</span>
                        <span>{post.comments?.length || 0} top-level discussions</span>
                      </div>

                      {!hasComments ? (
                        <div className="p-4 rounded-xl bg-white/70 border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
                          No comments on this post yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {post.comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="p-3 sm:p-3.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-2xs space-y-2.5"
                            >
                              {/* Top-Level Comment */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                                    {comment.user?.avatar_url ? (
                                      <img
                                        src={getMediaUrl(comment.user.avatar_url)}
                                        alt={comment.user?.full_name || 'User'}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      (comment.user?.full_name || 'U').charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-slate-900">
                                        {comment.user?.full_name || 'Member'}
                                      </span>
                                      {comment.user?.phone && (
                                        <span className="text-[10px] text-slate-400">
                                          ({comment.user.phone})
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                      {formatTimeAgo(comment.created_at)}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setCommentToDelete({
                                      id: comment.id,
                                      postId: post.id,
                                      isReply: false,
                                    })
                                  }
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete Comment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <p className="text-xs text-slate-700 font-medium pl-10 leading-relaxed whitespace-pre-wrap">
                                {comment.content}
                              </p>

                              {/* Nested Replies */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="pl-10 space-y-2 pt-2 border-t border-slate-100">
                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Replies ({comment.replies.length})
                                  </div>
                                  {comment.replies.map((reply) => (
                                    <div
                                      key={reply.id}
                                      className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60 flex items-start justify-between gap-2"
                                    >
                                      <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden mt-0.5">
                                          {reply.user?.avatar_url ? (
                                            <img
                                              src={getMediaUrl(reply.user.avatar_url)}
                                              alt={reply.user?.full_name || 'User'}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            (reply.user?.full_name || 'U').charAt(0).toUpperCase()
                                          )}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] font-bold text-slate-900">
                                              {reply.user?.full_name || 'Member'}
                                            </span>
                                            <span className="text-[9px] text-slate-400">
                                              {formatTimeAgo(reply.created_at)}
                                            </span>
                                          </div>
                                          <p className="text-[11px] text-slate-700 font-medium mt-0.5 whitespace-pre-wrap leading-relaxed">
                                            {reply.content}
                                          </p>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setCommentToDelete({
                                            id: reply.id,
                                            postId: post.id,
                                            isReply: true,
                                          })
                                        }
                                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                                        title="Delete Reply"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── 5. PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
            <span className="text-xs text-slate-500 font-medium">
              Page <strong className="text-slate-900 font-bold">{page}</strong> of{' '}
              <strong className="text-slate-900 font-bold">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── DELETE POST CONFIRMATION MODAL ── */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/80 bg-white/95 backdrop-blur-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Post Permanently?</h3>
              <p className="text-xs text-slate-500 font-medium">
                This will immediately purge the post, all associated comments, and replies from the system. This action cannot be reversed.
              </p>
            </div>

            {postToDelete.content && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium max-h-24 overflow-y-auto">
                &ldquo;{postToDelete.content}&rdquo;
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPostToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeletePost}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE COMMENT CONFIRMATION MODAL ── */}
      {commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/80 bg-white/95 backdrop-blur-2xl p-5 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                Delete {commentToDelete.isReply ? 'Reply' : 'Comment'}?
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Remove this {commentToDelete.isReply ? 'reply' : 'comment'} from the community discussion permanently?
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCommentToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteComment}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isDeleting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX IMAGE MODAL ── */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Expanded post media"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}

    </div>
  );
}
