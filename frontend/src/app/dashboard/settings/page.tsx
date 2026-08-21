'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { apiFetch } from '../../../lib/api';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { ImageCropModal } from '../../../components/common/ImageCropModal';
import {
  User,
  Lock,
  Save,
  Star,
  Mail,
  Globe,
  CreditCard,
  Camera,
  Upload,
  Crown,
  CheckCircle2,
} from 'lucide-react';

const COUNTRIES = [
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

export default function UserSettingsPage() {
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
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setCountry(user.country || 'Bangladesh');
      setNationalId(user.national_id || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  // Handle uploading photo directly from user's device & opening Cropper
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">
     

      {statusMsg && (
        <AlertBanner
          type={statusMsg.type}
          message={statusMsg.text}
          onClose={() => setStatusMsg(null)}
        />
      )}

      {/* Profile Card matching Screenshot Design */}
      <div className="bg-gradient-to-r from-[#003822] via-[#014d31] to-[#002e1c] border border-emerald-700/50 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col-reverse sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Left Side: Name, Badge, User ID */}
        <div className="space-y-3 text-center sm:text-left z-10">
          {/* Full Name */}
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {fullName || user?.full_name || user?.phone || 'User'}
          </h2>

          {/* Membership / Designation Badge with Crown */}
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <Crown className="w-5 h-5 fill-[#f3ba2f] text-[#f3ba2f]" />
            <span className="text-sm sm:text-base font-extrabold text-[#f3ba2f] tracking-wide">
              {user?.is_premium
                ? 'Premium Member'
                : user?.designation?.name || 'Standard Member'}
            </span>
          </div>

          {/* User ID */}
          <div className="text-xs sm:text-sm font-bold text-emerald-300/90 font-mono tracking-wider pt-1">
            User id: <span className="text-white font-black">{user?.referral_code || ''}</span>
          </div>
        </div>

        {/* Right Side: Circular Photo Frame with Device Upload */}
        <div className="relative group shrink-0 z-10">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-2xl relative overflow-hidden bg-[#01281a] flex flex-col items-center justify-center text-center">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="User Profile Photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-1 p-2">
                <User className="w-12 h-12 text-emerald-400" />
                <span className="text-[10px] font-bold text-slate-300">No Photo</span>
              </div>
            )}

            {/* Hidden File Input for Device Photo Upload */}
            <input
              type="file"
              accept="image/*"
              id="device-photo-upload"
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Overlay Upload Trigger on Hover */}
            <label
              htmlFor="device-photo-upload"
              className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white font-bold text-xs space-y-1"
            >
              <Upload className="w-6 h-6 text-[#f3ba2f]" />
              <span>Upload Photo</span>
            </label>
          </div>

          {/* Floating Camera Upload Button */}
          <label
            htmlFor="device-photo-upload"
            className="absolute top-1 right-1 bg-[#f3ba2f] text-slate-950 p-2 rounded-full shadow-lg border-2 border-white cursor-pointer hover:bg-amber-300 transition-colors"
            title="Upload photo from device"
          >
            <Camera className="w-4 h-4 fill-slate-950" />
          </label>

          {/* Overlapping 3D Gold Stars at Bottom Right of Photo - ONLY IF DESIGNATION STARS > 0 */}
          {designationStars > 0 && (
            <div className="absolute -bottom-2 right-1 flex items-center space-x-0.5 bg-slate-950/80 px-2 py-1 rounded-full border border-[#f3ba2f]/60 shadow-lg">
              {Array.from({ length: designationStars }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 sm:w-5 sm:h-5 fill-[#f3ba2f] text-[#f3ba2f] drop-shadow-[0_2px_4px_rgba(243,186,47,0.8)]"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Device Upload Banner Prompt */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#01281a] border border-[#d4af37]/40 flex items-center justify-center text-[#f3ba2f] shrink-0">
                <Upload className="w-5 h-5" />
              </div>
        
            </div>

            <label
              htmlFor="device-photo-upload"
              className="bg-[#005A36] hover:bg-[#044D2F] text-white px-4 py-2 rounded-xl text-xs font-black flex items-center space-x-1.5 shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Choose Device File</span>
            </label>
          </div>

          {/* Option to clear photo if uploaded */}
          {userPhoto && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
              >
                Remove / Clear Current Photo
              </button>
            </div>
          )}

          {/* Section 2: Personal Information Details */}
          <div className="space-y-4 pt-2">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <User className="w-5 h-5 text-[#03442e] shrink-0" />
              <span>Personal Profile Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a]"
                  />
                </div>
              </div>

              {/* Phone Number (Read Only) */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.phone || ''}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a]"
                  />
                </div>
              </div>

              {/* Country Selection */}
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Country
                </label>
                <div className="relative">
                  <span className="text-base absolute left-3.5 top-2.5 shrink-0 pointer-events-none">
                    {selectedCountryObj.flag}
                  </span>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] cursor-pointer"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Passport / National ID Number */}
              <div className="space-y-1 sm:col-span-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Passport / National ID Number (NID)
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Enter NID or Passport number..."
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a] uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Password Update */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h2 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <Lock className="w-5 h-5 text-[#03442e] shrink-0" />
              <span>Change Security Password (Optional)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#01281a]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={savingProfile}
              className="bg-[#005A36] hover:bg-[#044D2F] text-white px-8 py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>
                {savingProfile ? 'Saving Changes...' : 'Save Profile & Security Settings'}
              </span>
            </button>
          </div>
        </form>
      </div>

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
