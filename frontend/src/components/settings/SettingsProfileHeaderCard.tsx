'use client';

import React from 'react';
import { Crown, User, Upload, Camera, Star } from 'lucide-react';
import { User as UserType } from '../../types';

interface SettingsProfileHeaderCardProps {
  user: UserType | null;
  fullName: string;
  userPhoto: string;
  designationStars: number;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SettingsProfileHeaderCard({
  user,
  fullName,
  userPhoto,
  designationStars,
  onImageUpload,
}: SettingsProfileHeaderCardProps) {
  return (
    <div className="bg-gradient-to-r from-[#003822] via-[#014d31] to-[#002e1c] border border-emerald-700/50 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col-reverse sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
      {/* Left Side: Name, Badge, User ID */}
      <div className="space-y-3 text-center sm:text-left z-10">
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
            onChange={onImageUpload}
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

        {/* Designation Stars */}
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
  );
}
