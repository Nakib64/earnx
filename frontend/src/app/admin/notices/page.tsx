'use client';

import React, { useEffect, useState, useRef } from 'react';
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
} from 'lucide-react';
import { DashboardNoticeBanner } from '../../../components/dashboard/DashboardNoticeBanner';

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFullImageUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    return `${base}${url}`;
  };

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<any>('/notices/admin', { isAdmin: true });
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

      // Sort by serial_number asc
      list.sort((a, b) => (a.serial_number || 0) - (b.serial_number || 0));

      setNotices(list);

      // Auto-set next serial number
      const maxSerial = list.reduce((max, item) => Math.max(max, item.serial_number || 0), 0);
      setSerialNumber(maxSerial + 1);

      // Initialize inline edit serials
      const serialMap: Record<string, number> = {};
      list.forEach((item) => {
        serialMap[item.id] = item.serial_number || 0;
      });
      setEditingSerials(serialMap);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to load notices' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
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

  const handleUploadBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Please select a banner image file to upload' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      // Step 1: Upload image to /notices/admin/upload-image
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

      // Step 2: Create notice entry with image_url, serial_number, link_url, is_active
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

      setMessage({ type: 'success', text: 'Notice banner uploaded and added to slider successfully!' });

      // Reset form
      setSelectedFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setLinkUrl('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      await fetchNotices();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to upload notice banner' });
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (notice: NoticeItem) => {
    setActionNoticeId(notice.id);
    setMessage(null);
    try {
      await apiFetch(`/notices/admin/${notice.id}`, {
        method: 'PATCH',
        isAdmin: true,
        body: JSON.stringify({
          is_active: !notice.is_active,
        }),
      });
      setMessage({
        type: 'success',
        text: `Banner ${!notice.is_active ? 'activated' : 'deactivated'} in slider`,
      });
      await fetchNotices();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update notice status' });
    } finally {
      setActionNoticeId(null);
    }
  };

  const handleSaveSerial = async (noticeId: string) => {
    const newSerial = editingSerials[noticeId];
    if (newSerial === undefined) return;

    setActionNoticeId(noticeId);
    setMessage(null);
    try {
      await apiFetch(`/notices/admin/${noticeId}`, {
        method: 'PATCH',
        isAdmin: true,
        body: JSON.stringify({
          serial_number: Number(newSerial),
        }),
      });
      setMessage({ type: 'success', text: 'Serial order updated successfully' });
      await fetchNotices();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update serial order' });
    } finally {
      setActionNoticeId(null);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= notices.length) return;

    const currentItem = notices[index];
    const targetItem = notices[targetIndex];

    const currentSerial = currentItem.serial_number;
    const targetSerial = targetItem.serial_number;

    // Swap serial numbers
    const newCurrentSerial = targetSerial === currentSerial ? currentSerial + (direction === 'up' ? -1 : 1) : targetSerial;
    const newTargetSerial = currentSerial;

    setActionNoticeId(currentItem.id);
    setMessage(null);

    try {
      await apiFetch('/notices/admin/reorder', {
        method: 'PATCH',
        isAdmin: true,
        body: JSON.stringify({
          items: [
            { id: currentItem.id, serial_number: newCurrentSerial },
            { id: targetItem.id, serial_number: newTargetSerial },
          ],
        }),
      });
      setMessage({ type: 'success', text: 'Slider order updated successfully' });
      await fetchNotices();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to reorder banners' });
    } finally {
      setActionNoticeId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this banner?')) return;

    setActionNoticeId(id);
    setMessage(null);
    try {
      await apiFetch(`/notices/admin/${id}`, {
        method: 'DELETE',
        isAdmin: true,
      });
      setMessage({ type: 'success', text: 'Notice banner deleted successfully' });
      await fetchNotices();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete notice' });
    } finally {
      setActionNoticeId(null);
    }
  };

  const activeSliderNotices = notices.filter((n) => n.is_active);

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/dashboard"
            className="w-10 h-10 rounded-2xl bg-white/80 hover:bg-white border border-white/90 flex items-center justify-center text-slate-700 transition-all shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2">
              <Megaphone className="w-6 h-6 text-emerald-600" />
              <span>Notice Slider Management</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Upload promotional notice banners and set their serial order for the user dashboard slider
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`font-extrabold text-xs px-3.5 py-2.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer border ${
              showLivePreview
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-white/80 hover:bg-white text-slate-700 border-white/90 shadow-xs'
            }`}
          >
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>{showLivePreview ? 'Hide Preview' : 'Live Preview'}</span>
          </button>

          <button
            onClick={fetchNotices}
            className="bg-white/80 hover:bg-white text-slate-700 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all cursor-pointer border border-white/90 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2 border transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Live Preview Container (Simulating exactly what users see on Dashboard) */}
      {showLivePreview && activeSliderNotices.length > 0 && (
        <div className="bg-white/70 backdrop-blur-xl border border-white/90 rounded-3xl p-4 sm:p-5 shadow-xs space-y-2.5 specular-rim">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              Live Dashboard Slider Preview ({activeSliderNotices.length} active slides)
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Auto-sliding every 4.5s
            </span>
          </div>
          <div className="w-full max-w-4xl mx-auto">
            <DashboardNoticeBanner notices={activeSliderNotices} />
          </div>
        </div>
      )}

      {/* Upload New Notice Banner Card (Pure Image + Serial; No text writing!) */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 specular-rim">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shadow-xs">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Upload Notice Banner</h2>
            <p className="text-xs text-slate-500 font-medium">
              Add a new panoramic image banner to the slider and set its serial display order
            </p>
          </div>
        </div>

        <form onSubmit={handleUploadBanner} className="space-y-5">
          {/* File Upload Zone */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Banner Image File *</span>
              <span className="text-[11px] text-slate-400 font-semibold normal-case">
                Recommended 1200×450px (~16:6 ratio)
              </span>
            </label>

            {previewUrl ? (
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-emerald-200/80 bg-slate-900 group shadow-xs">
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
                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-xs font-bold">
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
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to browse or drag and drop banner image
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

          {/* Serial Number & Target Link Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Serial Number Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Serial Order # *</span>
                <span className="text-[11px] text-slate-400 font-normal normal-case">Lower = 1st</span>
              </label>
              <input
                type="number"
                min="1"
                value={serialNumber}
                onChange={(e) => setSerialNumber(parseInt(e.target.value) || 1)}
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none transition-colors shadow-2xs"
                required
              />
            </div>

            {/* Target URL Link */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Action / Redirect URL (Optional)</span>
                <span className="text-[11px] text-slate-400 font-normal normal-case">
                  e.g. /dashboard/premium or https://...
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="/dashboard/premium"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-xl pl-9 pr-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none transition-colors shadow-2xs"
                />
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Active Status Checkbox & Submit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <label className="flex items-center space-x-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4.5 w-4.5 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-700">
                Immediately display in user dashboard slider
              </span>
            </label>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs px-6 py-3 rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{uploading ? 'Uploading Banner...' : 'Upload & Add to Slider'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Existing Notice Banners & Serial Reordering List */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm specular-rim">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
            <span>Active Slider Banners &amp; Serial Ordering</span>
          </h3>
          <span className="text-xs font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {notices.length} Banners Total
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-medium space-y-2">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <p>No notice banners uploaded yet. Upload your first banner above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice, idx) => (
              <div
                key={notice.id}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  notice.is_active
                    ? 'bg-white border-emerald-200/90 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 opacity-75'
                }`}
              >
                {/* Left: Thumbnail & Order Info */}
                <div className="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
                  {/* Serial Order Number Badge */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <span className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 font-black text-xs flex items-center justify-center shadow-2xs">
                      #{notice.serial_number}
                    </span>
                    <div className="flex flex-col mt-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'up')}
                        disabled={idx === 0 || actionNoticeId === notice.id}
                        className="p-1 text-slate-400 hover:text-emerald-700 disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(idx, 'down')}
                        disabled={idx === notices.length - 1 || actionNoticeId === notice.id}
                        className="p-1 text-slate-400 hover:text-emerald-700 disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
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
                      <span className="text-sm font-extrabold text-slate-900 truncate">
                        Slide #{notice.serial_number}
                      </span>
                      {notice.is_active ? (
                        <span className="bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Active in Slider</span>
                        </span>
                      ) : (
                        <span className="bg-slate-200 text-slate-600 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>

                    {notice.link_url && (
                      <div className="flex items-center space-x-1 text-xs text-slate-600 font-medium truncate">
                        <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate text-emerald-700 font-semibold">{notice.link_url}</span>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 font-medium">
                      Created: {new Date(notice.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Right: Quick Serial Input & Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  {/* Inline Serial Number Edit */}
                  <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Serial:</span>
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
                      className="w-12 text-center text-xs font-black text-slate-900 bg-transparent focus:outline-none"
                    />
                    {editingSerials[notice.id] !== notice.serial_number && (
                      <button
                        type="button"
                        onClick={() => handleSaveSerial(notice.id)}
                        disabled={actionNoticeId === notice.id}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold cursor-pointer"
                      >
                        Save
                      </button>
                    )}
                  </div>

                  {/* Toggle Active Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(notice)}
                    disabled={actionNoticeId === notice.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      notice.is_active
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
                    }`}
                  >
                    {notice.is_active ? 'Pause' : 'Activate'}
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(notice.id)}
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
  );
}
