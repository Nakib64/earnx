'use client';

import React, { useState } from 'react';
import { useDesignations, DesignationItem } from '../../../hooks/useDesignations';
import DesignationStats from '../../../components/designations/DesignationStats';
import DesignationForm from '../../../components/designations/DesignationForm';
import DesignationCard from '../../../components/designations/DesignationCard';
import AssignUsersModal from '../../../components/designations/AssignUsersModal';
import EditDesignationModal from '../../../components/designations/EditDesignationModal';
import { ConfirmModal } from '../../../components/common/ConfirmModal';
import { apiFetch } from '../../../lib/api';
import { Award, Star } from 'lucide-react';
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
    filteredUsers,
    userSearch,
    loadingUsers,
    maxDepthLevel,
    totalAssignedMembers,
    setName,
    setStars,
    setMaxLevel,
    setUserSearch,
    resetForm,
    saveDesignation,
    deleteDesignation,
    openAssignModal,
    closeAssignModal,
    toggleUserDesignation,
    refreshDesignations,
  } = useDesignations(true);

  // Edit Modal State
  const [editingDesignation, setEditingDesignation] = useState<DesignationItem | null>(null);
  const [modalSaving, setModalSaving] = useState(false);

  // Delete Confirmation Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

      {/* Top Banner — Coins Page Theme */}
      <div className="bg-[#005A36] rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-700/60 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-secondary" />
          </div>
          <div className="space-y-1 flex-1">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
              Designations & Star Badges
            </h1>
            <p className="text-xs text-emerald-100/80 font-medium">
              Configure Star badges and unlocked tree level depth keys. Assign members to control earning depth.
            </p>
          </div>
          <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-emerald-700/50 text-secondary border border-emerald-500/30 font-mono shrink-0 hidden sm:inline-flex">
            {designations.length} Badges
          </span>
        </div>
      </div>

      {/* Reusable Stats Component */}
      <DesignationStats
        designationsCount={designations.length}
        maxDepthLevel={maxDepthLevel}
        totalAssignedMembers={totalAssignedMembers}
      />

      {/* Create Designation Form Component */}
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

      {/* Designation Cards Grid */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-primary shrink-0">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">Active Designations</h2>
            <p className="text-[11px] font-medium text-slate-400">Total {designations.length} star tier badges configured</p>
          </div>
        </div>

        {loading ? (
          <div className="text-xs text-slate-400 py-8 text-center font-extrabold">Loading designations...</div>
        ) : designations.length === 0 ? (
          <div className="rounded-2xl p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 bg-slate-50 font-extrabold">
            No designations created yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* Edit Designation Modal Dialog Component */}
      <EditDesignationModal
        designation={editingDesignation as any}
        isOpen={!!editingDesignation}
        saving={modalSaving}
        onClose={() => setEditingDesignation(null)}
        onSave={handleSaveModalEdit}
      />

      {/* Delete Confirmation Modal */}
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

      {/* View Assigned Members Modal Component */}
      <AssignUsersModal
        selectedDesignation={selectedDesignation}
        onClose={closeAssignModal}
      />
    </div>
  );
}
