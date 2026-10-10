'use client';

import React from 'react';
import { User, Mail, CreditCard, Upload, Camera } from 'lucide-react';
import { GlassButton } from '../design-system/GlassButton';

interface SettingsPersonalFormProps {
  fullName: string;
  setFullName: (val: string) => void;
  userPhone?: string | null;
  email: string;
  setEmail: (val: string) => void;
  country: string;
  setCountry: (val: string) => void;
  nationalId: string;
  setNationalId: (val: string) => void;
  userPhoto: string;
  onClearPhoto: () => void;
  selectedCountryObj: { name: string; flag: string };
  countries: { name: string; flag: string }[];
}

export function SettingsPersonalForm({
  fullName,
  setFullName,
  userPhone,
  email,
  setEmail,
  country,
  setCountry,
  nationalId,
  setNationalId,
  userPhoto,
  onClearPhoto,
  selectedCountryObj,
  countries,
}: SettingsPersonalFormProps) {
  return (
    <div className="space-y-4">
      {/* Device Upload Banner Prompt */}
      <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 shrink-0">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">Upload Profile Photo</p>
            <p className="text-[11px] text-slate-500 font-medium">JPEG, PNG, or WEBP up to 10MB</p>
          </div>
        </div>

        <label
          htmlFor="device-photo-upload"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black shrink-0 transition-all shadow-xs cursor-pointer active:scale-95"
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
            onClick={onClearPhoto}
            className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
          >
            Remove / Clear Current Photo
          </button>
        </div>
      )}

      {/* Section 2: Personal Information Details */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-black text-slate-900 border-b border-slate-200/60 pb-3 flex items-center space-x-2">
          <User className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>Personal Profile Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
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
                className="w-full bg-white/80 border border-slate-200/90 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Phone Number (Read Only) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Phone Number
            </label>
            <input
              type="text"
              disabled
              value={userPhone || ''}
              className="w-full bg-slate-100/80 border border-slate-200/70 rounded-2xl px-4 py-3 text-xs sm:text-sm  font-bold text-slate-400 cursor-not-allowed shadow-2xs"
            />
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
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
                className="w-full bg-white/80 border border-slate-200/90 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Country Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
              Country
            </label>
            <div className="relative">
              <span className="text-base absolute left-3.5 top-3 shrink-0 pointer-events-none">
                {selectedCountryObj.flag}
              </span>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white/80 border border-slate-200/90 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs cursor-pointer"
              >
                {countries.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Passport / National ID Number */}
          <div className="space-y-1.5 sm:col-span-2">
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
                className="w-full bg-white/80 border border-slate-200/90 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm  font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-xs uppercase"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
