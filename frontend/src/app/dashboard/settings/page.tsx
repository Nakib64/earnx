'use client';

import React from 'react';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { ImageCropModal } from '../../../components/common/ImageCropModal';
import { useSettingsOrchestrator, COUNTRIES } from '../../../hooks/orchestrators';
import { useDesignSystem } from '../../../context/DesignSystemContext';
import { GlassCard } from '../../../components/design-system/GlassCard';
import {
  SettingsProfileHeaderCard,
  SettingsPersonalForm,
  SettingsSecurityForm,
  SettingsSkeleton,
} from '../../../components/settings';

export default function UserSettingsPage() {
  const { isLoading: forceSkeletonLoading } = useDesignSystem();
  const {
    state: {
      fullName,
      email,
      country,
      nationalId,
      rawImageToCrop,
      showCropModal,
      currentPassword,
      newPassword,
      confirmPassword,
      savingProfile,
      statusMsg,
    },
    computed: {
      user,
      selectedCountryObj,
      designationStars,
      userPhoto,
    },
    actions: {
      setFullName,
      setEmail,
      setCountry,
      setNationalId,
      setAvatarUrl,
      setShowCropModal,
      setCurrentPassword,
      setNewPassword,
      setConfirmPassword,
      setStatusMsg,
      handleImageUpload,
      handleCropComplete,
      handleUpdateProfile,
    },
  } = useSettingsOrchestrator();

  if (forceSkeletonLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 animate-fade-in">
      {statusMsg && (
        <AlertBanner
          type={statusMsg.type}
          message={statusMsg.text}
          onClose={() => setStatusMsg(null)}
        />
      )}

      {/* Profile Card */}
      <SettingsProfileHeaderCard
        user={user}
        fullName={fullName}
        userPhoto={userPhoto}
        designationStars={designationStars}
        onImageUpload={handleImageUpload}
      />

      {/* Main Settings Form */}
      <GlassCard className="p-6 sm:p-8 specular-rim">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <SettingsPersonalForm
            fullName={fullName}
            setFullName={setFullName}
            userPhone={user?.phone}
            email={email}
            setEmail={setEmail}
            country={country}
            setCountry={setCountry}
            nationalId={nationalId}
            setNationalId={setNationalId}
            userPhoto={userPhoto}
            onClearPhoto={() => setAvatarUrl('')}
            selectedCountryObj={selectedCountryObj}
            countries={COUNTRIES}
          />

          <SettingsSecurityForm
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            savingProfile={savingProfile}
          />
        </form>
      </GlassCard>

      {/* Interactive Profile Photo Cropper Modal */}
      <ImageCropModal
        isOpen={showCropModal}
        imageSrc={rawImageToCrop}
        onClose={() => setShowCropModal(false)}
        onCropComplete={handleCropComplete}
        cropShape="round"
      />
    </div>
  );
}
