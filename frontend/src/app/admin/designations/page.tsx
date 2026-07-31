'use client';

import React from 'react';
import { useDesignations } from '../../../hooks/useDesignations';
import DesignationStats from '../../../components/designations/DesignationStats';
import DesignationForm from '../../../components/designations/DesignationForm';
import DesignationCard from '../../../components/designations/DesignationCard';
import AssignUsersModal from '../../../components/designations/AssignUsersModal';

export default function AdminDesignationsPage() {
  const {
    designations,
    loading,
    saving,
    editingId,
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
    handleEditClick,
    saveDesignation,
    deleteDesignation,
    openAssignModal,
    closeAssignModal,
    toggleUserDesignation,
  } = useDesignations(true);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveDesignation();
    } catch (err: any) {
      alert(err.message || 'Failed to save designation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this designation badge?')) return;
    try {
      await deleteDesignation(id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete designation');
    }
  };

  const handleToggleUser = async (userId: string, currentDesId: string | null) => {
    try {
      await toggleUserDesignation(userId, currentDesId);
    } catch (err: any) {
      alert(err.message || 'User assignment failed');
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Reusable Form Component */}
      <DesignationForm
        editingId={editingId}
        name={name}
        stars={stars}
        maxLevel={maxLevel}
        saving={saving}
        onNameChange={setName}
        onStarsChange={setStars}
        onMaxLevelChange={setMaxLevel}
        onSubmit={handleFormSubmit}
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
                onDelete={handleDelete}
                onOpenAssignModal={openAssignModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reusable Assign Users Modal Component */}
      <AssignUsersModal
        selectedDesignation={selectedDesignation}
        allUsers={filteredUsers}
        userSearch={userSearch}
        loadingUsers={loadingUsers}
        onClose={closeAssignModal}
        onSearchChange={setUserSearch}
        onToggleUserDesignation={handleToggleUser}
      />
    </div>
  );
}
