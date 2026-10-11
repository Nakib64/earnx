'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  ArrowRight,
  User,
} from 'lucide-react';
import { PremiumPackage } from '../../types';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface PremiumSubscribeModalProps {
  isOpen: boolean;
  pkg: PremiumPackage | null;
  subscribing: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (
    pkg: PremiumPackage,
    referrerCode: string,
  ) => Promise<{ success: boolean; error?: string } | void>;
}

export function PremiumSubscribeModal({
  isOpen,
  pkg,
  subscribing,
  error,
  onClose,
  onConfirm,
}: PremiumSubscribeModalProps) {
  const { user } = useAuth();
  const [referrerCode, setReferrerCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [referrerUser, setReferrerUser] = useState<{
    id: string;
    full_name: string;
    referral_code: string;
  } | null>(null);
  const [isInvalid, setIsInvalid] = useState(false);
  const [invalidMsg, setInvalidMsg] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset form and errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setReferrerCode('');
      setChecking(false);
      setReferrerUser(null);
      setIsInvalid(false);
      setInvalidMsg('');
      setLocalError(null);
    }
  }, [isOpen]);

  // Debounced referrer code validation
  useEffect(() => {
    const code = referrerCode.trim();
    if (!code) {
      setChecking(false);
      setReferrerUser(null);
      setIsInvalid(false);
      setInvalidMsg('');
      return;
    }

    if (user?.referral_code && code.toLowerCase() === user.referral_code.toLowerCase()) {
      setChecking(false);
      setReferrerUser(null);
      setIsInvalid(true);
      setInvalidMsg('You cannot use your own referral code.');
      return;
    }

    setChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch<{
          exists: boolean;
          user?: { id: string; full_name: string; referral_code: string };
        }>(`/users/check-referrer?code=${encodeURIComponent(code)}`);

        if (res.success && res.data?.exists && res.data.user) {
          if (user?.id && res.data.user.id === user.id) {
            setReferrerUser(null);
            setIsInvalid(true);
            setInvalidMsg('You cannot use your own referral code.');
          } else {
            setReferrerUser(res.data.user);
            setIsInvalid(false);
            setInvalidMsg('');
          }
        } else {
          setReferrerUser(null);
          setIsInvalid(true);
          setInvalidMsg('Sponsor code not found. Please enter a valid referral code.');
        }
      } catch (err) {
        setReferrerUser(null);
        setIsInvalid(true);
        setInvalidMsg('Failed to verify sponsor code. Please try again.');
      } finally {
        setChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [referrerCode, user]);

  if (!isOpen || !pkg) return null;

  const displayError = error || localError;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribing) return;
    setLocalError(null);

    const cleanCode = referrerCode.trim();
    if (!cleanCode) {
      setLocalError('A valid sponsor referral code is mandatory to purchase a premium package.');
      return;
    }

    if (!referrerUser) {
      setLocalError('Please verify a valid sponsor referral code before subscribing.');
      return;
    }

    const result = await onConfirm(pkg, referrerUser.referral_code);
    if (result && !result.success && result.error) {
      setLocalError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-t-[14px] sm:rounded-[14px] border border-[#E5EBE7] shadow-xl overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 border-b border-[#E5EBE7] relative bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={subscribing}
            className="absolute top-5 right-5 w-8 h-8 rounded-[8px] border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Confirm Subscription
          </div>
          <h3 className="text-xl font-bold text-slate-900 ">{pkg.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            365 days validity • Instant fractional payouts per ad
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
          {/* Subscription Error Notification */}
          {displayError && (
            <div className="p-3.5 rounded-[10px] bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 flex-1">
                <strong className="font-semibold text-rose-950 block">Subscription Failed</strong>
                <p className="font-medium text-rose-800 leading-relaxed">{displayError}</p>
                {displayError.toLowerCase().includes('balance') && (
                  <div className="pt-1.5">
                    <a
                      href="/dashboard/deposit"
                      className="inline-flex items-center gap-1 font-bold text-rose-700 hover:text-rose-950 underline underline-offset-2 transition-colors"
                    >
                      <span>Deposit funds to your wallet &rarr;</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Package Summary Card */}
          <div className="bg-slate-50 border border-[#E5EBE7] rounded-[10px] p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Subscription Cost
              </span>
              <div className="text-2xl font-bold text-slate-900  mt-0.5">
                ৳{Number(pkg.price).toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Daily Reward Pool
              </span>
              <div className="text-sm font-semibold text-[#009F6B]  mt-0.5">
                ৳{Number(pkg.daily_reward_amount).toLocaleString()} / {pkg.daily_ads_count} ads
              </div>
            </div>
          </div>

          {/* Referrer ID Field (Mandatory) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="referrer-input"
                className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Sponsor Referral Code</span>
                <span className="text-rose-500 font-bold">*</span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-rose-50 text-rose-700 border border-rose-200">
                Required
              </span>
            </div>

            <div className="relative">
              <input
                id="referrer-input"
                type="text"
                required
                value={referrerCode}
                onChange={(e) => setReferrerCode(e.target.value)}
                placeholder="Enter your sponsor's referral code..."
                disabled={subscribing}
                className={`w-full bg-white border rounded-[10px] pl-4 pr-10 py-3 text-sm font-medium text-slate-900 focus:outline-none transition-colors ${referrerUser
                  ? 'border-[#009F6B] ring-2 ring-[#009F6B]/20 bg-emerald-50/20'
                  : isInvalid
                    ? 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/20'
                    : 'border-[#E5EBE7] focus:border-[#009F6B] focus:ring-2 focus:ring-[#009F6B]/20'
                  }`}
              />

              <div className="absolute right-3.5 top-3.5">
                {checking ? (
                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                ) : referrerUser ? (
                  <CheckCircle2 className="w-4 h-4 text-[#009F6B]" />
                ) : isInvalid ? (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                ) : null}
              </div>
            </div>

            {/* Dynamic Status Feedback */}
            {checking ? (
              <p className="text-xs text-slate-400 font-normal flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Validating sponsor in database...</span>
              </p>
            ) : referrerUser ? (
              <div className="p-2.5 rounded-[8px] bg-emerald-50 border border-emerald-200/80 text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#009F6B] shrink-0" />
                <span className="text-xs font-medium">
                  Sponsor Verified:{' '}
                  <strong className="font-semibold text-emerald-950">
                    {referrerUser.full_name}
                  </strong>{' '}
                  <span className="text-emerald-700">({referrerUser.referral_code})</span>
                </span>
              </div>
            ) : isInvalid ? (
              <div className="p-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs font-normal">
                  <strong className="font-semibold text-rose-950 block">Invalid Sponsor ID</strong>
                  {invalidMsg || 'Sponsor code was not found. A valid referral code is strictly required to subscribe.'}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 font-normal flex items-center gap-1.5">
                <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
                <span>
                  A valid referral code from an existing member is mandatory to buy this package.
                </span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#E5EBE7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={subscribing}
              className="px-5 py-2.5 rounded-[10px] border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={subscribing || checking || !referrerUser}
              className="premium-subscribe-btn !w-auto !h-auto px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subscribing ? (
                <span className="flex items-center gap-2 text-white">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="premium-subscribe-btn__label">Processing...</span>
                </span>
              ) : (
                <>
                  <span className="premium-subscribe-btn__label">Confirm &amp; Subscribe</span>
                  <span className="premium-subscribe-btn__icon" aria-hidden="true">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
