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

  const handleToggleUser = async (userId: string, currentDesId: string | null) => {
    try {
      await toggleUserDesignation(userId, currentDesId);
      toast.success('Member designation assignment updated!');
    } catch (err: any) {
      toast.error(err.message || 'User assignment failed');
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Designation & Star Badges</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure Star badges and unlocked tree level depth keys. Assign members to control earning depth in the referral tree.
        </p>
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
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Active Designations ({designations.length})</h3>

        {loading ? (
          <div className="text-xs text-slate-400 py-8 text-center">Loading designations...</div>
        ) : designations.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-xs text-slate-400">
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
        message="Are you sure you want to delete this designation badge? This action cannot be undone."
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
