'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import { LeaderboardEntry } from '../../../types';
import { AlertBanner } from '../../../components/common/AlertBanner';
import {
  Trophy,
  Crown,
  Flame,
  Users,
  Plus,
  Trash2,
  Upload,
  Search,
  X,
  Award,
  GripVertical,
  ArrowLeft,
  RefreshCw,
  MoveUp,
  MoveDown,
  Edit3,
  TrendingUp,
  Sparkles,
  Check,
} from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';

export default function AdminLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingReorder, setSavingReorder] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    rank: 1,
    name: '',
    phone: '',
    invested_amount: 100000,
    profit_earned: 15000,
    photo_url: '',
    badge: 'VIP Member',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Auto-dismiss success alert
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getPhotoUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    return `${base}${url}`;
  };

  const fetchLeaderboard = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await apiFetch<LeaderboardEntry[]>('/leaderboard/admin/all', {
        isAdmin: true,
        skipCache: true,
      });
      if (res.success && res.data) {
        const sorted = [...res.data].sort((a, b) => (Number(a.rank) || 0) - (Number(b.rank) || 0));
        setEntries(sorted);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load leaderboard' });
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(true);
  }, []);

  // Open Modal for Add
  const handleOpenAdd = () => {
    setEditingId(null);
    const nextRank = entries.length > 0 ? Math.max(...entries.map((e) => Number(e.rank) || 0)) + 1 : 1;
    setFormData({
      rank: Math.min(nextRank, 100),
      name: '',
      phone: '',
      invested_amount: 100000,
      profit_earned: 15000,
      photo_url: '',
      badge: 'VIP Investor',
    });
    setPhotoPreview(null);
    setShowModal(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (entry: LeaderboardEntry) => {
    setEditingId(entry.id);
    setFormData({
      rank: Number(entry.rank) || 1,
      name: entry.name,
      phone: entry.phone || '',
      invested_amount: Number(entry.invested_amount) || 0,
      profit_earned: Number(entry.profit_earned) || 0,
      photo_url: entry.photo_url || '',
      badge: entry.badge || 'VIP Member',
    });
    setPhotoPreview(entry.photo_url ? getPhotoUrl(entry.photo_url) : null);
    setShowModal(true);
  };

  // Instant Avatar File Upload with Blob Preview
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setUploading(true);

    try {
      const body = new FormData();
      body.append('file', file);

      const res = await apiFetch<any>('/leaderboard/admin/upload-photo', {
        method: 'POST',
        isAdmin: true,
        body,
      });

      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, photo_url: res.data.url }));
      } else {
        throw new Error(res.error?.message || 'Photo upload failed');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Avatar upload failed' });
    } finally {
      setUploading(false);
    }
  };

  // 1. CREATE & UPDATE: Instant Optimistic State Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const previousEntries = [...entries];
    setShowModal(false);

    if (editingId) {
      // Optimistic Update
      const updatedEntry: LeaderboardEntry = {
        id: editingId,
        rank: Number(formData.rank),
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        invested_amount: Number(formData.invested_amount),
        profit_earned: Number(formData.profit_earned),
        photo_url: formData.photo_url || null,
        badge: formData.badge.trim() || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      setEntries((prev) => {
        const next = prev.map((item) => (item.id === editingId ? updatedEntry : item));
        return next.sort((a, b) => Number(a.rank) - Number(b.rank));
      });

      setMessage({ type: 'success', text: `Leaderboard entry for ${formData.name} updated successfully!` });

      try {
        const res = await apiFetch(`/leaderboard/admin/${editingId}`, {
          method: 'PUT',
          isAdmin: true,
          body: JSON.stringify(formData),
        });

        if (!res.success) {
          throw new Error(res.error?.message || 'Update failed');
        }
      } catch (err: any) {
        setEntries(previousEntries);
        setMessage({ type: 'error', text: err.message || 'Failed to update entry' });
      }
    } else {
      // Optimistic Create
      const tempId = `temp-${Date.now()}`;
      const newEntry: LeaderboardEntry = {
        id: tempId,
        rank: Number(formData.rank),
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        invested_amount: Number(formData.invested_amount),
        profit_earned: Number(formData.profit_earned),
        photo_url: formData.photo_url || null,
        badge: formData.badge.trim() || null,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setEntries((prev) => {
        const next = [...prev, newEntry];
        return next.sort((a, b) => Number(a.rank) - Number(b.rank));
      });

      setMessage({ type: 'success', text: `Leader #${formData.rank} ${formData.name} created successfully!` });

      try {
        const res = await apiFetch<any>('/leaderboard/admin/create', {
          method: 'POST',
          isAdmin: true,
          body: JSON.stringify(formData),
        });

        if (!res.success) {
          throw new Error(res.error?.message || 'Creation failed');
        }

        // Replace temporary ID with server ID
        if (res.data?.id) {
          setEntries((prev) =>
            prev.map((item) => (item.id === tempId ? { ...item, id: res.data.id } : item))
          );
        }
      } catch (err: any) {
        setEntries(previousEntries);
        setMessage({ type: 'error', text: err.message || 'Failed to create entry' });
      }
    }
  };

  // 2. DELETE: Instant Optimistic State Update
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the leaderboard?`)) return;

    const previousEntries = [...entries];

    // Optimistic removal
    setEntries((prev) => prev.filter((item) => item.id !== id));
    setMessage({ type: 'success', text: `Removed "${name}" from leaderboard.` });

    try {
      const res = await apiFetch(`/leaderboard/admin/${id}`, {
        method: 'DELETE',
        isAdmin: true,
      });

      if (!res.success) {
        throw new Error(res.error?.message || 'Delete failed');
      }
    } catch (err: any) {
      setEntries(previousEntries);
      setMessage({ type: 'error', text: err.message || 'Failed to delete entry' });
    }
  };

  // 3. MOVE SEQUENCE (Quick Shift Up/Down): Instant Optimistic Swap
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= entries.length) return;

    const previousEntries = [...entries];

    const currentItem = entries[index];
    const targetItem = entries[targetIndex];

    const newCurrentRank = targetItem.rank;
    const newTargetRank = currentItem.rank;

    // Instant optimistic swap
    const updated = [...entries];
    updated[index] = { ...currentItem, rank: newCurrentRank };
    updated[targetIndex] = { ...targetItem, rank: newTargetRank };
    updated.sort((a, b) => Number(a.rank) - Number(b.rank));

    setEntries(updated);
    setSavingReorder(true);
    setMessage({ type: 'success', text: `Rank position updated for ${currentItem.name}.` });

    try {
      const orders = [
        { id: currentItem.id, rank: newCurrentRank },
        { id: targetItem.id, rank: newTargetRank },
      ];
      const res = await apiFetch('/leaderboard/admin/reorder', {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({ orders }),
      });

      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to reorder ranks');
      }
    } catch (err: any) {
      setEntries(previousEntries);
      setMessage({ type: 'error', text: err.message || 'Failed to save reordered ranks' });
    } finally {
      setSavingReorder(false);
    }
  };

  // 4. DRAG AND DROP: Instant Optimistic Reorder
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const previousEntries = [...entries];

    // Reorder local array
    const updated = [...entries];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, movedItem);

    // Re-assign ranks 1..N based on new array order
    const reordered = updated.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    setEntries(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
    setSavingReorder(true);
    setMessage({ type: 'success', text: 'Leaderboard ranking reordered successfully!' });

    try {
      const orders = reordered.map((item) => ({ id: item.id, rank: item.rank }));
      const res = await apiFetch('/leaderboard/admin/reorder', {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({ orders }),
      });

      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to save reordered ranks');
      }
    } catch (err: any) {
      setEntries(previousEntries);
      setMessage({ type: 'error', text: err.message || 'Failed to save reordered ranks' });
    } finally {
      setSavingReorder(false);
    }
  };

  // 5. SEED INITIAL LEADERBOARD DATA
  const handleSeedLeaderboard = async () => {
    if (!confirm('Populate the leaderboard with default sample top champions?')) return;
    setLoading(true);
    try {
      const res = await apiFetch('/leaderboard/admin/seed', {
        method: 'POST',
        isAdmin: true,
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Leaderboard seeded successfully with verified sample leaders!' });
        await fetchLeaderboard(false);
      } else {
        throw new Error(res.error?.message || 'Seeding failed');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to seed leaderboard' });
    } finally {
      setLoading(false);
    }
  };

  // Filtered entries by debounced search
  const filteredEntries = useMemo(() => {
    if (!debouncedSearch.trim()) return entries;
    const query = debouncedSearch.toLowerCase();
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        (e.phone && e.phone.includes(query)) ||
        (e.badge && e.badge.toLowerCase().includes(query))
    );
  }, [entries, debouncedSearch]);

  const isSearching = searchQuery.trim().length > 0;

  // Podium Leaders (Top 3)
  const top1 = entries.find((e) => Number(e.rank) === 1) || entries[0];
  const top2 = entries.find((e) => Number(e.rank) === 2) || entries[1];
  const top3 = entries.find((e) => Number(e.rank) === 3) || entries[2];

  const championName = top1?.name || (loading ? 'Loading...' : 'None');
  const championProfit = Number(top1?.profit_earned || 0);
  const totalPodiumYield =
    Number(top1?.profit_earned || 0) +
    Number(top2?.profit_earned || 0) +
    Number(top3?.profit_earned || 0);

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16 font-[family-name:var(--font-montserrat)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        {/* ── 1. PAGE HEADER (Sitting directly on background per Design System) ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            {/* Eyebrow Label */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
              Hall of Fame &amp; High Yield Governance
            </div>

            {/* Prominent Main Heading */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Leaderboard &amp; Top Champions
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Audit top community investors, drag rows or move sequence ranks, update member yields, and manage featured champion badges.
            </p>

            {/* Operational Status Indicator */}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                Live Audited Ranking &bull;{' '}
                <strong className="text-slate-900 font-semibold">
                  {entries.length} Champions Ranked
                </strong>
                {savingReorder && (
                  <span className="text-xs text-[#009F6B] font-bold animate-pulse ml-1">
                    (Saving order...)
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Secondary Actions with Liquid Glassmorphism */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Dashboard</span>
            </Link>

            {entries.length === 0 && (
              <button
                onClick={handleSeedLeaderboard}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 text-xs font-bold hover:bg-purple-100 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Seed Default</span>
              </button>
            )}

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry</span>
            </button>

            <button
              onClick={() => fetchLeaderboard(false)}
              disabled={loading}
              className="p-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-slate-600 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Alert Notification */}
        {message && (
          <AlertBanner
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        )}

        {/* ── 2. TOP 4 KPI SUMMARY CARDS (Matches User Dashboard Boxes) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Top Champion */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Top Champion</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                <Crown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 truncate block" title={championName}>
                {championName}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Rank #1 All-time Leader
              </span>
            </div>
          </div>

          {/* Card 2: Peak Yield */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Peak Yield</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-[#009F6B] tabular-nums">
                ৳{championProfit.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Highest individual payout
              </span>
            </div>
          </div>

          {/* Card 3: Podium Total Yield */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Podium Yield</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-purple-700 tabular-nums">
                ৳{totalPodiumYield.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Combined Top 3 earnings
              </span>
            </div>
          </div>

          {/* Card 4: Total Ranked Leaders */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Ranked Leaders</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-blue-700 tabular-nums">
                {entries.length} Active
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Community hall of fame
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. TOP 3 PODIUM SHOWCASE (Liquid Glassmorphism) ── */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {/* 2nd Place: Silver */}
            {top2 && (
              <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col items-center text-center space-y-3 order-2 md:order-1 relative overflow-hidden group hover:bg-white/90 transition-all">
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                  Rank #2 &bull; Silver
                </div>
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-md relative mt-3">
                  {top2.photo_url ? (
                    <img
                      src={getPhotoUrl(top2.photo_url)}
                      alt={top2.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 font-bold text-lg">
                      {top2.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 truncate max-w-[200px]">{top2.name}</h4>
                  <span className="text-[11px] font-semibold text-slate-400 block">{top2.badge || 'VIP Investor'}</span>
                </div>
                <div className="w-full pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Profit Earned</span>
                  <span className="font-bold text-slate-800 tabular-nums">৳{Number(top2.profit_earned).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* 1st Place: Gold (Elevated center) */}
            {top1 && (
              <div className="bg-gradient-to-b from-amber-500/[0.08] via-white/85 to-white/90 backdrop-blur-xl border border-amber-300/60 shadow-[0_12px_36px_rgba(245,158,11,0.12)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col items-center text-center space-y-3.5 order-1 md:order-2 relative overflow-hidden group md:-translate-y-1 transition-all">
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300/80 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>Champion &bull; Gold</span>
                </div>
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-amber-50 border-2 border-amber-300 shadow-lg relative mt-3">
                  {top1.photo_url ? (
                    <img
                      src={getPhotoUrl(top1.photo_url)}
                      alt={top1.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-100 text-amber-700 font-bold text-2xl">
                      {top1.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 truncate max-w-[220px]">{top1.name}</h4>
                  <span className="text-xs font-bold text-amber-700 block">{top1.badge || 'Grand Champion'}</span>
                </div>
                <div className="w-full pt-2.5 border-t border-amber-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Profit Earned</span>
                  <span className="font-bold text-[#009F6B] text-sm tabular-nums">৳{Number(top1.profit_earned).toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* 3rd Place: Bronze */}
            {top3 && (
              <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col items-center text-center space-y-3 order-3 relative overflow-hidden group hover:bg-white/90 transition-all">
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-200">
                  Rank #3 &bull; Bronze
                </div>
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-amber-50 border-2 border-amber-200/80 shadow-md relative mt-3">
                  {top3.photo_url ? (
                    <img
                      src={getPhotoUrl(top3.photo_url)}
                      alt={top3.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-amber-100/60 text-amber-800 font-bold text-lg">
                      {top3.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 truncate max-w-[200px]">{top3.name}</h4>
                  <span className="text-[11px] font-semibold text-slate-400 block">{top3.badge || 'VIP Investor'}</span>
                </div>
                <div className="w-full pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Profit Earned</span>
                  <span className="font-bold text-slate-800 tabular-nums">৳{Number(top3.profit_earned).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 4. LEADERBOARD RANKING SEQUENCE TABLE (Liquid Glassmorphism) ── */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 overflow-hidden">
          {/* Table Header with Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/80 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ranking Roster &amp; Sequence Order
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isSearching
                    ? 'Search filtering active &bull; Drag reordering paused'
                    : 'Drag handles or use ▲ ▼ arrows to shift ranking'}
                </p>
              </div>
            </div>

            {/* Debounced Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, phone, badge..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-semibold text-slate-900 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3 py-3 w-10 text-center hidden lg:table-cell">Seq</th>
                  <th className="px-3 py-3 w-16">Rank</th>
                  <th className="px-4 py-3">Member Details</th>
                  <th className="px-4 py-3 hidden md:table-cell">Invested</th>
                  <th className="px-4 py-3">Profit Yield</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Badge</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white/70">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-[#009F6B]" />
                        <span className="text-xs font-semibold text-slate-500">Loading ranking roster...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-400 space-y-2">
                      <Trophy className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-sm font-bold text-slate-700">No leaderboard champions found</p>
                      <p className="text-xs text-slate-400">Add an entry or click &quot;Seed Default&quot; to populate top earners.</p>
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((item, index) => {
                    const isDragging = draggedIndex === index;
                    const isOver = dragOverIndex === index;
                    const rankNum = Number(item.rank);

                    return (
                      <tr
                        key={item.id}
                        draggable={!isSearching}
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={() => handleDrop(index)}
                        className={`transition-all ${
                          isDragging
                            ? 'opacity-30 bg-emerald-100/50'
                            : isOver
                            ? 'bg-emerald-50 border-y-2 border-[#009F6B]'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        {/* Drag Handle & Fast Reorder Arrows */}
                        <td className="px-2 py-2.5 text-center hidden lg:table-cell">
                          <div className="flex items-center justify-center space-x-0.5">
                            <span
                              className="text-slate-300 hover:text-slate-600 cursor-grab active:cursor-grabbing p-1"
                              title="Drag to reorder"
                            >
                              <GripVertical className="w-4 h-4" />
                            </span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(index, 'up')}
                                disabled={index === 0 || isSearching}
                                className="p-0.5 text-slate-400 hover:text-[#009F6B] disabled:opacity-20 cursor-pointer"
                                title="Move Rank Up (Optimistic)"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveOrder(index, 'down')}
                                disabled={index === entries.length - 1 || isSearching}
                                className="p-0.5 text-slate-400 hover:text-[#009F6B] disabled:opacity-20 cursor-pointer"
                                title="Move Rank Down (Optimistic)"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Rank Badge */}
                        <td className="px-3 py-2.5">
                          {rankNum === 1 ? (
                            <span className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 font-extrabold text-xs flex items-center justify-center shadow-2xs">
                              #1
                            </span>
                          ) : rankNum === 2 ? (
                            <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 font-extrabold text-xs flex items-center justify-center shadow-2xs">
                              #2
                            </span>
                          ) : rankNum === 3 ? (
                            <span className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs flex items-center justify-center shadow-2xs">
                              #3
                            </span>
                          ) : (
                            <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#009F6B] font-bold text-xs flex items-center justify-center shadow-2xs">
                              #{rankNum}
                            </span>
                          )}
                        </td>

                        {/* Member Details */}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              {item.photo_url ? (
                                <img
                                  src={getPhotoUrl(item.photo_url)}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-[#009F6B] font-bold text-xs">
                                  {item.name[0]}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-[180px] sm:max-w-[240px]">
                              <p className="font-bold text-slate-900 text-xs truncate">{item.name}</p>
                              <p className="text-[11px] text-slate-400 font-normal truncate">
                                {item.phone || 'Phone undisclosed'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Invested */}
                        <td className="px-4 py-2.5 hidden md:table-cell">
                          <span className="font-bold text-slate-800 text-xs tabular-nums">
                            ৳{Number(item.invested_amount).toLocaleString()}
                          </span>
                        </td>

                        {/* Profit Yield */}
                        <td className="px-4 py-2.5">
                          <span className="font-bold text-[#009F6B] text-xs tabular-nums">
                            ৳{Number(item.profit_earned).toLocaleString()}
                          </span>
                        </td>

                        {/* Badge / Title */}
                        <td className="px-4 py-2.5 hidden lg:table-cell">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80 inline-block truncate max-w-[120px]">
                            {item.badge || 'VIP Member'}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-colors cursor-pointer shadow-2xs"
                              title="Edit Entry"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.name)}
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 transition-colors cursor-pointer shadow-2xs"
                              title="Delete Entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── 5. ADD / EDIT LEADERBOARD ENTRY MODAL (Liquid Glassmorphism) ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 relative max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingId ? 'Edit Champion Entry' : 'Create New Champion Entry'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Configure position, yields, and featured badges</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Rank Position & Badge Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Rank Position (1 - 100) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={formData.rank}
                    onChange={(e) => setFormData({ ...formData, rank: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Badge / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VIP Member"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-medium text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Amin Hossain"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Phone Number</span>
                  <span className="text-[11px] text-slate-400 font-normal normal-case">Optional</span>
                </label>
                <input
                  type="text"
                  placeholder="01700000000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-medium text-slate-900 outline-none transition-all"
                />
              </div>

              {/* Invested & Profit Yield Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Invested (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.invested_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, invested_amount: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Profit Earned (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.profit_earned}
                    onChange={(e) =>
                      setFormData({ ...formData, profit_earned: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-bold text-slate-900 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Avatar Upload with Live Thumbnail Preview */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Photo Avatar
                </label>
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-sm">
                        N/A
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Image URL or upload file"
                        value={formData.photo_url}
                        onChange={(e) => {
                          setFormData({ ...formData, photo_url: e.target.value });
                          setPhotoPreview(e.target.value ? getPhotoUrl(e.target.value) : null);
                        }}
                        className="flex-1 px-3 py-2 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl text-xs font-medium text-slate-900 outline-none transition-all"
                      />

                      <label className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer flex items-center space-x-1.5 transition-colors shrink-0 shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-[#009F6B]" />
                        <span>{uploading ? 'Uploading...' : 'Browse'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, or WEBP (Square ratio recommended)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                {editingId ? 'Update Champion' : 'Create Champion'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
