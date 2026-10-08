'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

export const COUNTRIES = [
  { name: 'Bangladesh', flag: '🇧🇩' },
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Oman', flag: '🇴🇲' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Kuwait', flag: '🇰🇼' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'Canada', flag: '🇨🇦' },
];

export function useSettingsOrchestrator() {
  const { user, refreshUserProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [nationalId, setNationalId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Image Cropper State
  const [rawImageToCrop, setRawImageToCrop] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState<boolean>(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setCountry(user.country || 'Bangladesh');
      setNationalId(user.national_id || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'Image file size should be less than 10MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setRawImageToCrop(reader.result);
        setShowCropModal(true);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBase64: string) => {
    setAvatarUrl(croppedBase64);
    setStatusMsg({
      type: 'success',
      text: 'Profile photo cropped & selected! Click "Save Profile & Security Settings" below to complete.',
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (newPassword && newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setStatusMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setSavingProfile(true);

    const bodyData: any = {
      full_name: fullName.trim(),
      email: email.trim(),
      country: country,
      national_id: nationalId.trim(),
      avatar_url: avatarUrl.trim(),
    };

    if (newPassword) {
      bodyData.current_password = currentPassword;
      bodyData.new_password = newPassword;
    }

    const res = await apiFetch<any>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(bodyData),
    });

    if (res.success) {
      setStatusMsg({
        type: 'success',
        text: 'Account Settings updated successfully!',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshUserProfile();
    } else {
      setStatusMsg({
        type: 'error',
        text: res.error?.message || 'Failed to update profile settings',
      });
    }

    setSavingProfile(false);
  };

  const selectedCountryObj = COUNTRIES.find((c) => c.name === country) || COUNTRIES[0];
  const designationStars = user?.designation?.stars || 0;
  const userPhoto = avatarUrl || user?.avatar_url || '';

  return {
    state: {
      fullName,
      email,
      country,
      nationalId,
      avatarUrl,
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
  };
}
