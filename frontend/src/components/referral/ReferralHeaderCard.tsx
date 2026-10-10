'use client';

import React, { useState } from 'react';
import { Crown, User, Upload, Camera, Star, Copy, Check, Sparkles } from 'lucide-react';
import { User as UserType } from '../../types';
import { GlassCard } from '../design-system/GlassCard';
import { GlassButton } from '../design-system/GlassButton';

interface ReferralHeaderCardProps {
  user: UserType | null;
  userPhoto: string;
  designationStars: number;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ReferralHeaderCard({
  user,
  userPhoto,
  designationStars,
  onImageUpload,
}: ReferralHeaderCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <GlassCard
      className="p-6 sm:p-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 specular-rim relative overflow-hidden"
      glow
    >
      {/* Subtle ambient mesh background */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left Side: Name, Badge, User ID */}
      <div className="space-y-3.5 text-center sm:text-left z-10 w-full sm:w-auto">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Affiliate Partner Profile
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {user?.full_name || user?.phone || 'Partner Member'}
          </h2>
        </div>

        {/* Membership / Designation Badge with Crown */}
        <div className="flex items-center justify-center sm:justify-start space-x-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-800 text-xs font-black uppercase tracking-wider shadow-xs">
            <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>
              {user?.is_premium
                ? 'VIP Premium Member'
                : user?.designation?.name || 'Standard Member'}
            </span>
          </div>
        </div>

        {/* User Referral ID with 1-tap Copy */}
        <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
          <div className="bg-white/80 backdrop-blur-md border border-white/95 px-3.5 py-1.5 rounded-xl text-xs  font-bold text-slate-700 shadow-xs flex items-center gap-2">
            <span className="text-slate-400 font-sans text-[11px]">Referral ID:</span>
            <span className="text-emerald-700 font-black">{user?.referral_code || '—'}</span>
          </div>

          <GlassButton
            variant="secondary"
            size="sm"
            onClick={handleCopyCode}
            className="gap-1.5 px-3 py-1.5 rounded-xl h-auto min-h-0 text-xs"
            title="Copy Referral Code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </GlassButton>
        </div>
      </div>

      {/* Right Side: Circular Photo Frame with Device Upload */}
      <div className="relative group shrink-0 z-10">
        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-2xl relative overflow-hidden bg-slate-100 flex flex-col items-center justify-center text-center ring-2 ring-emerald-500/20">
          {userPhoto ? (
            <img
              src={userPhoto}
              alt="User Profile Photo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1 p-2">
              <User className="w-12 h-12 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400">No Photo</span>
            </div>
          )}

          {/* Hidden File Input for Device Photo Upload */}
          <input
            type="file"
            accept="image/*"
            id="referral-photo-upload"
            onChange={onImageUpload}
            className="hidden"
          />

          {/* Overlay Upload Trigger on Hover */}
          <label
            htmlFor="referral-photo-upload"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white font-bold text-xs space-y-1"
          >
            <Upload className="w-6 h-6 text-amber-300" />
            <span>Upload Photo</span>
          </label>
        </div>

        {/* Floating Camera Upload Button */}
        <label
          htmlFor="referral-photo-upload"
          className="absolute top-1 right-1 bg-white text-slate-700 p-2 rounded-full shadow-lg border border-slate-200/90 cursor-pointer hover:bg-slate-50 hover:text-emerald-700 transition-colors"
          title="Upload photo from device"
        >
          <Camera className="w-4 h-4" />
        </label>

        {/* Overlapping Gold Stars at Bottom Right of Photo */}
        {designationStars > 0 && (
          <div className="absolute -bottom-2 right-1 flex items-center space-x-0.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-amber-400/50 shadow-md">
            {Array.from({ length: designationStars }).map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-amber-400 text-amber-500 drop-shadow-xs"
              />
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
