'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../lib/api';
import {
  Megaphone,
  ArrowLeft,
  RefreshCw,
  Upload,
  CheckCircle,
  XCircle,
  Trash2,
  MoveUp,
  MoveDown,
  Eye,
  Link as LinkIcon,
  Sparkles,
  Image as ImageIcon,
  Check,
  X,
  ExternalLink,
  Clock,
  EyeOff,
  Layers,
  Edit3,
} from 'lucide-react';
import { DashboardNoticeBanner } from '../../../components/dashboard/DashboardNoticeBanner';
import { AlertBanner } from '../../../components/common/AlertBanner';

interface NoticeItem {
  id: string;
  image_url?: string | null;
  link_url?: string | null;
  serial_number: number;
  title?: string | null;
  content?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionNoticeId, setActionNoticeId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [serialNumber, setSerialNumber] = useState<number>(1);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);

  // Inline editing of serial numbers
  const [editingSerials, setEditingSerials] = useState<Record<string, number>>({});

  // Edit Modal State
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');
  const [editSerial, setEditSerial] = useState<number>(1);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss success notifications
  useEffect(() => {
    if (message?.type === 'success') {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const getFullImageUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    return `${base}${url}`;
  };

  const fetchNotices = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await apiFetch<any>('/notices/admin', { isAdmin: true, skipCache: true });
      let list: NoticeItem[] = [];
      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res.data.data)) {
          list = res.data.data;
        }
      } else if (Array.isArray(res)) {
        list = res as any;
      }

      list.sort((a, b) => (a.serial_number || 0) - (b.serial_number || 0));
      setNotices(list);

      const maxSerial = list.reduce((max, item) => Math.max(max, item.serial_number || 0), 0);
      setSerialNumber(maxSerial + 1);

      const serialMap: Record<string, number> = {};
      list.forEach((item) => {
        serialMap[item.id] = item.serial_number || 0;
      });
      setEditingSerials(serialMap);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load notices' });
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // 1. CREATE: Instant optimistic update on upload completion
  const handleUploadBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a banner image file to upload.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await apiFetch<any>('/notices/admin/upload-image', {
        method: 'POST',
        isAdmin: true,
        body: formData,
      });

      if (!uploadRes.success || !uploadRes.data?.url) {
        throw new Error(uploadRes.error?.message || 'Image upload failed');
      }

      const uploadedUrl = uploadRes.data.url;

      const createRes = await apiFetch<any>('/notices/admin', {
        method: 'POST',
        isAdmin: true,
        body: JSON.stringify({
          image_url: uploadedUrl,
          serial_number: Number(serialNumber) || 1,
          link_url: linkUrl.trim() || undefined,
          is_active: isActive,
          title: `Notice Banner #${serialNumber}`,
          content: '',
        }),
      });

      if (!createRes.success) {
        throw new Error(createRes.error?.message || 'Failed to create notice banner');
      }

      const createdNotice: NoticeItem = createRes.data?.data || createRes.data || {
        id: String(Date.now()),
        image_url: uploadedUrl,
        serial_number: Number(serialNumber) || 1,
        link_url: linkUrl.trim() || undefined,
        is_active: isActive,
        title: `Notice Banner #${serialNumber}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Instant optimistic state update: append and re-sort
      setNotices((prev) => {
        const next = [...prev, createdNotice];
        next.sort((a, b) => (a.serial_number || 0) - (b.serial_number || 0));
        return next;
      });

      // Synchronize inline editing map
      setEditingSerials((prev) => ({
        ...prev,
        [createdNotice.id]: createdNotice.serial_number || 1,
      }));

      // Update next serial number
      setSerialNumber((prev) => Math.max(prev + 1, (createdNotice.serial_number || 0) + 1));

      setMessage({ type: 'success', text: 'Notice banner uploaded and added to slider successfully!' });

      // Reset file form
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setLinkUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload notice banner' });
    } finally {
      setUploading(false);
    }
  };

  // 2. TOGGLE ACTIVE: Instant optimistic state flip
  const handleToggleActive = async (notice: NoticeItem) => {
    const previousState = notice.is_active;
    const nextState = !previousState;

    // Instant state update: UI updates immediately without waiting
    setNotices((prev) =>
      prev.map((n) => (n.id === notice.id ? { ...n, is_active: nextState } : n))
    );
    setActionNoticeId(notice.id);
    setMessage(null);

    try {
      const res = await apiFetch<any>(`/notices/admin/${notice.id}`, {
        method: 'PATCH',
        isAdmin: true,
        body: JSON.stringify({ is_active: nextState }),
      });

      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to update notice status');
      }

      setMessage({
        type: 'success',
        text: `Banner #${notice.serial_number} ${nextState ? 'activated in' : 'paused from'} live slider.`,
      });
    } catch (err: any) {
      // Revert optimistic update on error
      setNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, is_active: previousState } : n))
      );
      setMessage({ type: 'error', text: err.message || 'Failed to update notice status' });
    } finally {
      setActionNoticeId(null);
    }
  };

  // 3. MOVE ORDER: Instant optimistic swap
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= notices.length) return;

    const currentItem = notices[index];
    const targetItem = notices[targetIndex];

    const currentSerial = currentItem.serial_number;
    const targetSerial = targetItem.serial_number;

    const newCurrentSerial = targetSerial === currentSerial ? currentSerial + (direction === 'up' ? -1 : 1) : targetSerial;
    const newTargetSerial = currentSerial;

    // Snapshot previous list and serial map for rollback
    const previousList = [...notices];
    const previousSerials = { ...editingSerials };

    // Instant optimistic state update: Swap in array and update serials
    setNotices((prev) => {
      const updated = prev.map((n) => {
        if (n.id === currentItem.id) return { ...n, serial_number: newCurrentSerial };
        if (n.id === targetItem.id) return { ...n, serial_number: newTargetSerial };
        return n;
      });
      updated.sort((a, b) => (a.serial_number || 0) - (b.serial_number || 0));
      return updated;
    });

    // Keep editing serials in sync
    setEditingSerials((prev) => ({
      ...prev,
      [currentItem.id]: newCurrentSerial,
      [targetItem.id]: newTargetSerial,
    }));

    setActionNoticeId(currentItem.id);
    setMessage(null);

    try {
      const res = await apiFetch<any>('/notices/admin/reorder', {
        method: 'PATCH',
        isAdmin: true,
        body: JSON.stringify({
          items: [
            { id: currentItem.id, serial_number: newCurrentSerial },
            { id: targetItem.id, serial_number: newTargetSerial },
          ],
        }),
      });

      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to reorder banners');
      }

      setMessage({ type: 'success', text: 'Slider sequence updated successfully.' });
    } catch (err: any) {
      // Rollback on error
      setNotices(previousList);
      setEditingSerials(previousSerials);
      setMessage({ type: 'error', text: err.message || 'Failed to reorder banners' });
    } finally {
      setActionNoticeId(null);
    }
  };

  // 4. SAVE SERIAL: Instant optimistic serial change & re-sort
  const handleSaveSerial = async (noticeId: string) => {
    const newSerial = editingSerials[noticeId];
    if (newSerial === undefined) return;

    const previousList = [...notices];

    // Instant optimistic state update
    setNotices((prev) => {
      const updated = prev.map((n) => (n.id === noticeId ? { ...n, serial_number: Number(newSerial) } : n));
      updated.sort((a, b) => (a.serial_number || 0) - (b.serial_number || 0));
      return updated;
    });

    setActionNoticeId(noticeId);
    setMessage(null);

    try {
      const res = await apiFetch<any>(`/notices/admin/${noticeId}`, {
        method: 'PATCH',
        isAdmin: true,
        body: JSON.stringify({
          serial_number: Number(newSerial),
        }),
      });

      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to update serial order');
      }

      setMessage({ type: 'success', text: `Serial order updated to #${newSerial}.` });
    } catch (err: any) {
      setNotices(previousList);
      setMessage({ type: 'error', text: err.message || 'Failed to update serial order' });
    } finally {
      setActionNoticeId(null);
    }
  };

  // 5. OPEN EDIT MODAL
  const handleOpenEdit = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setEditTitle(notice.title || '');
    setEditLinkUrl(notice.link_url || '');
    setEditSerial(notice.serial_number || 1);
    setEditIsActive(notice.is_active);
  };

  // 6. SAVE EDIT MODAL: Instant optimistic update
  const handleSaveEditModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNotice) return;

    const previousList = [...notices];
    const previousSerials = { ...editingSerials };
    const targetId = editingNotice.id;

    const updatedItem: NoticeItem = {
      ...editingNotice,
      title: editTitle.trim() || `Notice Banner #${editSerial}`,
      link_url: editLinkUrl.trim() || null,
      serial_number: Number(editSerial) || 1,
      is_active: editIsActive,
      updated_at: new Date().toISOString(),
    };

    // Instant optimistic state update: updates list and closes modal immediately
    setNotices((prev) => {
      const updated = prev.map((n) => (n.id === targetId ? updatedItem : n));
      updated.sort((a, b) => (a.serial_number || 0) - (b.serial_number || 0));
      return updated;
    });

    setEditingSerials((prev) => ({
      ...prev,
      [targetId]: Number(editSerial) || 1,
    }));

    setEditingNotice(null);
    setMessage({ type: 'success', text: `Banner #${updatedItem.serial_number} updated successfully.` });

    try {
      const res = await apiFetch<any>(`/notices/admin/${targetId}`, {
        method: 'PATCH',
        isAdmin: true,
        body: JSON.stringify({
          title: updatedItem.title,
          link_url: updatedItem.link_url || undefined,
          serial_number: updatedItem.serial_number,
          is_active: updatedItem.is_active,
        }),
      });

      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to update banner details');
      }
    } catch (err: any) {
      // Revert if API fails
      setNotices(previousList);
      setEditingSerials(previousSerials);
      setMessage({ type: 'error', text: err.message || 'Failed to update banner details' });
    }
  };

  // 7. DELETE: Instant optimistic removal
  const handleDelete = async (id: string, serial: number) => {
    if (!confirm(`Are you sure you want to permanently delete Banner #${serial}?`)) return;

    const previousList = [...notices];
    const previousSerials = { ...editingSerials };

    // Instant optimistic state update: remove immediately
    setNotices((prev) => prev.filter((n) => n.id !== id));
    setEditingSerials((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setActionNoticeId(id);
    setMessage(null);

    try {
      const res = await apiFetch<any>(`/notices/admin/${id}`, {
        method: 'DELETE',
        isAdmin: true,
      });

      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to delete notice');
      }

      setMessage({ type: 'success', text: `Banner #${serial} deleted successfully.` });
    } catch (err: any) {
      // Revert if error
      setNotices(previousList);
      setEditingSerials(previousSerials);
      setMessage({ type: 'error', text: err.message || 'Failed to delete notice' });
    } finally {
      setActionNoticeId(null);
    }
  };

  const activeSliderNotices = useMemo(() => notices.filter((n) => n.is_active), [notices]);

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16 font-[family-name:var(--font-montserrat)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        {/* ── 1. PAGE HEADER (Sitting directly on background per Design System) ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            {/* Eyebrow Label */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
              Promotional Media &amp; Public Broadcasts
            </div>

            {/* Prominent Main Heading */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Notice Slider &amp; Announcements
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Upload panoramic promotional banners, configure display ordering, and control live visibility for the member dashboard carousel slider.
            </p>

            {/* Operational Status Indicator */}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                Active Slider Stream &bull;{' '}
                <strong className="text-slate-900 font-semibold">
                  {activeSliderNotices.length} Active Slides ({notices.length} Total Uploads)
                </strong>
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

            <button
              onClick={() => setShowLivePreview(!showLivePreview)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-[0.98] ${
                showLivePreview
                  ? 'bg-emerald-50 text-[#009F6B] border-emerald-200/80 font-bold'
                  : 'bg-white/80 backdrop-blur-md border-white/90 text-slate-700 hover:bg-white'
              }`}
            >
              {showLivePreview ? <EyeOff className="w-3.5 h-3.5 text-[#009F6B]" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
              <span>{showLivePreview ? 'Hide Preview' : 'Show Preview'}</span>
            </button>

            <button
              onClick={() => fetchNotices(false)}
              disabled={loading}
              className="p-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-slate-600 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              title="Refresh Notices"
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
          {/* Card 1: Active Slides */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Slides</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <Megaphone className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {activeSliderNotices.length}
                <span className="text-xs font-medium text-slate-400 ml-1">/ {notices.length}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Displaying on client home
              </span>
            </div>
          </div>

          {/* Card 2: Total Uploads */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Banners</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {notices.length}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Saved promotional media
              </span>
            </div>
          </div>

          {/* Card 3: Slide Interval */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Carousel Cadence</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">
                4.5s
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Auto-slide interval pace
              </span>
            </div>
          </div>

          {/* Card 4: Action Routing */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Direct Actions</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <LinkIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-purple-700 tabular-nums">
                {notices.filter((n) => Boolean(n.link_url)).length}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Banners with redirect links
              </span>
            </div>
          </div>
        </div>

        {/* ── 3. LIVE DASHBOARD SLIDER PREVIEW (Liquid Glassmorphism) ── */}
        {showLivePreview && activeSliderNotices.length > 0 && (
          <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Live Client Dashboard Preview</h3>
                  <p className="text-xs text-slate-500 font-medium">Real-time simulation of member homepage notice banner carousel</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#009F6B] animate-pulse" />
                Auto-sliding live ({activeSliderNotices.length} active slides)
              </span>
            </div>

            <div className="w-full max-w-4xl mx-auto pt-1">
              <DashboardNoticeBanner notices={activeSliderNotices} />
            </div>
          </div>
        )}

        {/* ── 4. UPLOAD NEW BANNER CARD (Liquid Glassmorphism) ── */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Radial Mesh Sheen */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/[0.05] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-sky-500/[0.04] blur-3xl pointer-events-none" />

          <div className="flex items-center space-x-2.5 border-b border-slate-100/80 pb-4 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Upload New Promotional Banner</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Add an image banner to the client slider and configure its display priority
              </p>
            </div>
          </div>

          <form onSubmit={handleUploadBanner} className="space-y-5 relative z-10">
            {/* File Upload Zone */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span>Banner Image File *</span>
                <span className="text-[11px] text-slate-400 font-normal normal-case">
                  Recommended ~1200×450px (~16:6 panoramic ratio)
                </span>
              </label>

              {previewUrl ? (
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-emerald-200/80 bg-slate-900 group shadow-sm">
                  <img
                    src={previewUrl}
                    alt="Selected banner preview"
                    className="w-full h-36 sm:h-44 md:h-52 object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-slate-900 rounded-xl font-bold text-xs shadow-md hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Change Image
                    </button>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-bold">
                    <span className="truncate max-w-[200px]">{selectedFile?.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1 hover:text-rose-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200/90 hover:border-[#009F6B] hover:bg-emerald-50/20 rounded-2xl sm:rounded-3xl p-7 sm:p-9 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2 group bg-white/50"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-emerald-100 text-slate-400 group-hover:text-[#009F6B] flex items-center justify-center transition-colors">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Click to browse or drag &amp; drop banner image
                    </p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      PNG, JPG, JPEG or WEBP (Max 15MB)
                    </p>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Serial Order & Redirect Link Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Serial Order Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Serial Order # *</span>
                  <span className="text-[11px] text-slate-400 font-normal normal-case">Lower = 1st</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none transition-all"
                  required
                />
              </div>

              {/* Redirect Action Link */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Redirect Action URL (Optional)</span>
                  <span className="text-[11px] text-slate-400 font-normal normal-case">
                    e.g. /dashboard/premium or external URL
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/dashboard/premium"
                    className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all"
                  />
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Active Status & Submit CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded-md border-slate-300 text-[#009F6B] focus:ring-[#009F6B] h-4.5 w-4.5 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">
                  Immediately activate in public client dashboard slider
                </span>
              </label>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{uploading ? 'Uploading Media...' : 'Upload & Add to Slider'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ── 5. BANNERS LIST & SERIAL CONTROLS (Liquid Glassmorphism) ── */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Banner Sequence &amp; Visibility Controls
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {notices.length} Banners Total
            </span>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col justify-center items-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-[#009F6B]" />
              <p className="text-xs font-semibold text-slate-500">Loading banner sequence...</p>
            </div>
          ) : notices.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No notice banners uploaded yet</p>
              <p className="text-xs text-slate-400">Use the upload tool above to publish promotional carousel media.</p>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {notices.map((notice, idx) => (
                <div
                  key={notice.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    notice.is_active
                      ? 'bg-white/80 border-emerald-200/80 shadow-2xs hover:bg-white'
                      : 'bg-slate-50/60 border-slate-200/80 opacity-70 hover:opacity-90'
                  }`}
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
                    {/* Serial Number & Fast Reorder Arrows */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#009F6B] font-bold text-xs flex items-center justify-center shadow-2xs">
                        #{notice.serial_number}
                      </span>
                      <div className="flex flex-col mt-1 space-y-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(idx, 'up')}
                          disabled={idx === 0 || actionNoticeId === notice.id}
                          className="p-1 text-slate-400 hover:text-[#009F6B] disabled:opacity-30 cursor-pointer transition-colors"
                          title="Move sequence up (Optimistic)"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveOrder(idx, 'down')}
                          disabled={idx === notices.length - 1 || actionNoticeId === notice.id}
                          className="p-1 text-slate-400 hover:text-[#009F6B] disabled:opacity-30 cursor-pointer transition-colors"
                          title="Move sequence down (Optimistic)"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Thumbnail Image */}
                    <div className="w-32 sm:w-44 h-16 sm:h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 shadow-2xs">
                      {notice.image_url ? (
                        <img
                          src={getFullImageUrl(notice.image_url)}
                          alt={`Banner #${notice.serial_number}`}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold p-2 text-center">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {notice.title || `Slide #${notice.serial_number}`}
                        </span>
                        {notice.is_active ? (
                          <span className="bg-emerald-50 text-[#009F6B] border border-emerald-200/80 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <Check className="w-3 h-3 text-[#009F6B]" />
                            <span>Active in Slider</span>
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full">
                            Paused
                          </span>
                        )}
                      </div>

                      {notice.link_url && (
                        <div className="flex items-center space-x-1 text-xs text-slate-600 font-medium truncate">
                          <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate text-[#009F6B] font-semibold">{notice.link_url}</span>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 font-medium">
                        Uploaded: {new Date(notice.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Serial Input & Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                    {/* Inline Serial Number Edit */}
                    <div className="flex items-center space-x-1 bg-white border border-slate-200/90 rounded-xl px-2 py-1 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Seq:</span>
                      <input
                        type="number"
                        min="1"
                        value={editingSerials[notice.id] ?? notice.serial_number}
                        onChange={(e) =>
                          setEditingSerials({
                            ...editingSerials,
                            [notice.id]: parseInt(e.target.value) || 1,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveSerial(notice.id);
                          }
                        }}
                        className="w-12 text-center text-xs font-bold text-slate-900 bg-transparent focus:outline-none"
                        title="Edit sequence number and press Enter or Save"
                      />
                      {editingSerials[notice.id] !== undefined &&
                        editingSerials[notice.id] !== notice.serial_number && (
                          <button
                            type="button"
                            onClick={() => handleSaveSerial(notice.id)}
                            disabled={actionNoticeId === notice.id}
                            className="px-2 py-0.5 bg-[#009F6B] hover:bg-[#008C5F] text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Save
                          </button>
                        )}
                    </div>

                    {/* Edit Details Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(notice)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/90 transition-colors cursor-pointer shadow-2xs"
                      title="Edit Banner Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Active/Pause Button (Instant Optimistic Update) */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(notice)}
                      disabled={actionNoticeId === notice.id}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        notice.is_active
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200/80'
                          : 'bg-[#009F6B] hover:bg-[#008C5F] text-white border-transparent'
                      }`}
                    >
                      {notice.is_active ? 'Pause' : 'Activate'}
                    </button>

                    {/* Delete Button (Instant Optimistic Update) */}
                    <button
                      type="button"
                      onClick={() => handleDelete(notice.id, notice.serial_number)}
                      disabled={actionNoticeId === notice.id}
                      className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                      title="Delete Banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 6. EDIT BANNER MODAL (Liquid Glassmorphism) ── */}
      {editingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white/95 backdrop-blur-2xl border border-white/90 shadow-2xl rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Banner Details</h3>
                  <p className="text-xs text-slate-500 font-medium">Configure link routing and slide ordering</p>
                </div>
              </div>

              <button
                onClick={() => setEditingNotice(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="w-full h-32 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs">
              {editingNotice.image_url ? (
                <img
                  src={getFullImageUrl(editingNotice.image_url)}
                  alt="Banner preview"
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                  No Image
                </div>
              )}
            </div>

            <form onSubmit={handleSaveEditModal} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Banner Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder={`Notice Banner #${editSerial}`}
                  className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none transition-all"
                />
              </div>

              {/* Redirect Action URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Redirect Action URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editLinkUrl}
                    onChange={(e) => setEditLinkUrl(e.target.value)}
                    placeholder="/dashboard/premium"
                    className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none transition-all"
                  />
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Serial Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Serial Order #</span>
                  <span className="text-[11px] text-slate-400 font-normal normal-case">Lower number shows first</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={editSerial}
                  onChange={(e) => setEditSerial(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-[#009F6B] rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 outline-none transition-all"
                  required
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="rounded-md border-slate-300 text-[#009F6B] focus:ring-[#009F6B] h-4.5 w-4.5 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Active in live public client slider
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingNotice(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
