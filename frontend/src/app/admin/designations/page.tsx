'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDesignations, DesignationItem } from '../../../hooks/useDesignations';
import DesignationStats from '../../../components/designations/DesignationStats';
import DesignationForm from '../../../components/designations/DesignationForm';
import DesignationCard from '../../../components/designations/DesignationCard';
import AssignUsersModal from '../../../components/designations/AssignUsersModal';
import EditDesignationModal from '../../../components/designations/EditDesignationModal';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { apiFetch } from '../../../lib/api';
import { Award, Star, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDesignationsPage() {
  const {
    designations,
    loading,
    saving,
    name,
    stars,
    maxLevel,
    selectedDesignation,
    maxDepthLevel,
    totalAssignedMembers,
    setName,
    setStars,
    setMaxLevel,
    resetForm,
    saveDesignation,
    deleteDesignation,
    openAssignModal,
    closeAssignModal,
    refreshDesignations,
  } = useDesignations(true);

  // Refreshing indicator
  const [refreshing, setRefreshing] = useState(false);

  // Edit Modal State
  const [editingDesignation, setEditingDesignation] = useState<DesignationItem | null>(null);
  const [modalSaving, setModalSaving] = useState(false);

  // Delete Confirmation Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshDesignations();
      toast.info('Refreshed designation badges');
    } catch {
      toast.error('Failed to refresh designations');
    } finally {
      setRefreshing(false);
    }
  };

  // Create Form Submit handler
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveDesignation();
      toast.success('Designation badge created successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create designation');
    }
  };

  // Open Edit Modal
  const handleEditClick = (des: DesignationItem) => {
    setEditingDesignation(des);
  };

  // Save Edit Modal Changes
  const handleSaveModalEdit = async (id: string, editName: string, editStars: number, editMaxLevel: number) => {
    setModalSaving(true);
    const res = await apiFetch(`/admin/designations/${id}`, {
      method: 'PATCH',
      isAdmin: true,
      body: JSON.stringify({
        name: editName,
        stars: Number(editStars),
        max_level: Number(editMaxLevel),
      }),
    });

    if (res.success) {
      toast.success('Designation badge updated successfully!');
      setEditingDesignation(null);
      await refreshDesignations();
    } else {
      toast.error(res.error?.message || 'Failed to update designation');
    }
    setModalSaving(false);
  };

  // Open Delete Confirmation
  const handleDeletePrompt = (id: string) => {
    setDeletingId(id);
  };

  // Execute Delete
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await deleteDesignation(deletingId);
      toast.success('Designation badge deleted successfully');
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete designation');
    }
    setDeleting(false);
  };

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16 font-[family-name:var(--font-montserrat)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        
        {/* ── 1. PAGE HEADER (Sitting directly on background per Design System) ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl select-none">
            {/* Eyebrow Label */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              Rank Tiers &amp; Commission Depth Governance
            </div>

            {/* Prominent Main Heading */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Designations &amp; Star Badges
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Configure leadership star badges, define unlocked referral tree commission depths, and govern member earning tier levels.
            </p>

            {/* Operational Status Indicator */}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                Live Rank Matrix &bull;{' '}
                <strong className="text-slate-900 font-semibold">
                  {designations.length} Active Badges Configured
                </strong>
              </span>
            </div>
          </div>

          {/* Secondary Actions with Liquid Glassmorphism */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap select-none">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Dashboard</span>
            </Link>

            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              title="Refresh Designation Badges"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${loading || refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* ── 2. SUMMARY KPI STATS CARDS ── */}
        <DesignationStats
          designationsCount={designations.length}
          maxDepthLevel={maxDepthLevel}
          totalAssignedMembers={totalAssignedMembers}
        />

        {/* ── 3. CREATE DESIGNATION FORM ── */}
        <DesignationForm
          editingId={null}
          name={name}
          stars={stars}
          maxLevel={maxLevel}
          saving={saving}
          onNameChange={setName}
          onStarsChange={setStars}
          onMaxLevelChange={setMaxLevel}
          onSubmit={handleCreateSubmit}
          onCancelEdit={resetForm}
        />

        {/* ── 4. DESIGNATION CARDS GRID ── */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] select-none">
          <div className="flex items-center justify-between border-b border-slate-100/80 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Configured Rank Badges</h2>
                <p className="text-xs text-slate-400 font-medium">Total {designations.length} star tier badges configured</p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 hidden sm:inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{designations.length} Tier Levels</span>
            </span>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-[#009F6B] animate-spin" />
              <div className="text-xs text-slate-400 font-semibold">Loading designation badges...</div>
            </div>
          ) : designations.length === 0 ? (
            <div className="rounded-2xl p-10 text-center text-xs text-slate-400 border border-dashed border-slate-200 bg-slate-50/60 font-semibold">
              No designations created yet. Use the form above to add your first Star Badge tier.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {designations.map((des) => (
                <DesignationCard
                  key={des.id}
                  designation={des}
                  onEdit={handleEditClick}
                  onDelete={handleDeletePrompt}
                  onOpenAssignModal={openAssignModal}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── 5. EDIT DESIGNATION MODAL ── */}
        <EditDesignationModal
          designation={editingDesignation as any}
          isOpen={!!editingDesignation}
          saving={modalSaving}
          onClose={() => setEditingDesignation(null)}
          onSave={handleSaveModalEdit}
        />

        {/* ── 6. DELETE CONFIRMATION MODAL ── */}
        <ConfirmModal
          isOpen={!!deletingId}
          title="Delete Designation Badge"
          message="Are you sure you want to delete this designation badge? Any members holding this badge will safely revert to Unbadged (No Designation) status. User profiles and wallet data will NOT be deleted."
          confirmText="Delete Badge"
          variant="danger"
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingId(null)}
        />

        {/* ── 7. VIEW ASSIGNED MEMBERS MODAL ── */}
        <AssignUsersModal
          selectedDesignation={selectedDesignation}
          onClose={closeAssignModal}
        />
      </div>
    </div>
  );
}
