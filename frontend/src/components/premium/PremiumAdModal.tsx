'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Loader2,
  CheckCircle2,
  Volume2,
  VolumeX,
  ChevronRight,
  X,
  Sparkles,
  Tv2,
  ExternalLink,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';

interface AdPayload {
  mediaUrl: string;
  skipOffsetSeconds: number;
  impressionUrls?: string[];
  clickThroughUrl?: string | null;
  network?: string;
}

interface PremiumAdModalProps {
  isOpen: boolean;
  adCompleted: boolean;
  recordingAd: boolean;
  rewardPerAd?: number;
  onFinishAd?: () => void;
  onCompleteAd?: () => void;
  onCancelAd?: () => void;
}

export function PremiumAdModal({
  isOpen,
  adCompleted,
  recordingAd,
  rewardPerAd,
  onFinishAd,
  onCompleteAd,
  onCancelAd,
}: PremiumAdModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loadingAd, setLoadingAd] = useState(true);
  const [noAdAvailable, setNoAdAvailable] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [adData, setAdData] = useState<AdPayload | null>(null);

  const [countdown, setCountdown] = useState(15);
  const [canClaim, setCanClaim] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hasRewardedRef = useRef(false);

  // Trigger reward completion once per ad session (when ad ends)
  const grantReward = useCallback(() => {
    if (hasRewardedRef.current) return;
    hasRewardedRef.current = true;
    setCanClaim(true);

    if (onCompleteAd) {
      onCompleteAd();
    } else if (onFinishAd) {
      onFinishAd();
    }
  }, [onCompleteAd, onFinishAd]);

  // Load active ad when modal opens (NO fallback video; if no ad, show no-ad state)
  useEffect(() => {
    if (!isOpen || recordingAd || adCompleted) return;

    let isMounted = true;
    hasRewardedRef.current = false;
    setLoadingAd(true);
    setNoAdAvailable(false);
    setAdData(null);
    setCountdown(15);
    setCanClaim(false);
    setVideoProgress(0);

    async function fetchAd() {
      try {
        const res = await apiFetch<any>('/ads/resolve-vast', {
          skipCache: true,
        });

        if (!isMounted) return;

        if (res.success && res.data?.hasAd && res.data?.data?.mediaUrl) {
          const payload: AdPayload = res.data.data;
          setAdData(payload);
          setLoadingAd(false);

          // Fire impression beacons silently in background
          if (payload.impressionUrls && Array.isArray(payload.impressionUrls)) {
            payload.impressionUrls.forEach((url) => {
              if (!url) return;
              try {
                const img = new Image();
                img.src = url;
              } catch {}
              try {
                fetch(url, { mode: 'no-cors' }).catch(() => {});
              } catch {}
            });
          }

          // Start playing video
          if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
          }
        } else {
          // Strictly NO fallback video: show "No ads available" state
          setLoadingAd(false);
          setNoAdAvailable(true);
        }
      } catch (err) {
        if (!isMounted) return;
        setLoadingAd(false);
        setNoAdAvailable(true);
      }
    }

    fetchAd();

    return () => {
      isMounted = false;
    };
  }, [isOpen, recordingAd, adCompleted]);

  // Track video progress and countdown directly from playback
  const handleLoadedMetadata = () => {
    if (videoRef.current && Number.isFinite(videoRef.current.duration)) {
      setCountdown(Math.ceil(videoRef.current.duration));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && Number.isFinite(videoRef.current.duration) && videoRef.current.duration > 0) {
      const remaining = Math.max(0, Math.ceil(videoRef.current.duration - videoRef.current.currentTime));
      setCountdown(remaining);
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
    }
  };

  // When ad video ends, immediately grant reward!
  const handleVideoEnded = () => {
    setCountdown(0);
    setVideoProgress(100);
    grantReward();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleClickAd = () => {
    if (adData?.clickThroughUrl) {
      window.open(adData.clickThroughUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999999] w-screen h-screen bg-black flex items-center justify-center overflow-hidden select-none animate-fade-in">
      
      {/* ── 1. LOADING AD SPINNER ── */}
      {loadingAd && !recordingAd && !adCompleted && (
        <div className="flex flex-col items-center justify-center space-y-4 text-center px-4">
          <Loader2 className="w-12 h-12 text-[#009F6B] animate-spin" />
          <div className="space-y-1">
            <p className="text-white font-semibold text-base sm:text-lg">
              Connecting to Ad Network...
            </p>
            <p className="text-slate-400 text-xs sm:text-sm">
              Retrieving live video ad campaign
            </p>
          </div>
          {onCancelAd && (
            <button
              type="button"
              onClick={onCancelAd}
              className="mt-6 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* ── 2. NO ADS AVAILABLE STATE (NO FALLBACK VIDEO) ── */}
      {!loadingAd && noAdAvailable && !recordingAd && !adCompleted && (
        <div className="flex flex-col items-center justify-center space-y-5 text-center px-6 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shadow-xl">
            <Tv2 className="w-8 h-8 text-slate-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-bold text-lg sm:text-xl">
              No Ads Available Right Now
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              There are currently no sponsored video ads available for your location. Please check back in a few minutes.
            </p>
          </div>
          {onCancelAd && (
            <button
              type="button"
              onClick={onCancelAd}
              className="mt-2 px-6 py-2.5 rounded-full bg-[#009F6B] hover:bg-[#00875A] text-white text-sm font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/30 cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      )}

      {/* ── 3. REAL AD VIDEO PLAYER ── */}
      {!loadingAd && !noAdAvailable && adData?.mediaUrl && (
        <>
          <video
            ref={videoRef}
            src={adData.mediaUrl}
            playsInline
            autoPlay
            muted={isMuted}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onClick={handleClickAd}
            className="w-full h-full object-contain md:object-cover bg-black cursor-pointer"
          />

          {/* AUDIO CONTROLS (Top-Left) */}
          {!recordingAd && !adCompleted && (
            <div className="absolute top-3 sm:top-5 left-3 sm:left-5 z-50 flex items-center gap-2 pt-[env(safe-area-inset-top,0px)]">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 sm:p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md shadow-lg transition-transform active:scale-90 cursor-pointer border border-white/20"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {adData.clickThroughUrl && (
                <button
                  type="button"
                  onClick={handleClickAd}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 hover:bg-black/80 text-white/90 hover:text-white text-xs font-medium backdrop-blur-md transition-colors cursor-pointer border border-white/10"
                >
                  <span>Learn More</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* TOP-RIGHT SKIP / CLAIM CONTROLLER */}
          {!recordingAd && !adCompleted && (
            <div className="absolute top-3 sm:top-5 right-3 sm:right-5 z-50 flex items-center gap-2 pt-[env(safe-area-inset-top,0px)]">
              {canClaim ? (
                <button
                  type="button"
                  onClick={grantReward}
                  className="group flex items-center gap-1.5 sm:gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-emerald-400/80 animate-bounce"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 animate-pulse" />
                  <span>Claim Reward</span>
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-black/80 text-white/90 text-xs font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-white/20 backdrop-blur-md shadow-lg select-none">
                  <span>Ad ends in {countdown > 0 ? `${countdown}s` : '0s'}</span>
                </div>
              )}

              {/* Early Exit Cancel Button */}
              {onCancelAd && (
                <button
                  type="button"
                  onClick={onCancelAd}
                  className="p-1.5 sm:p-2 rounded-full bg-black/70 hover:bg-black/90 text-white/80 hover:text-white backdrop-blur-md border border-white/20 transition-colors cursor-pointer"
                  title="Close ad (forfeit reward)"
                >
                  <X className="w-4 h-4 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          )}

          {/* BOTTOM PROGRESS BAR */}
          {!recordingAd && !adCompleted && (
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/15 z-40">
              <div
                className="h-full bg-[#009F6B] transition-all duration-200"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
          )}
        </>
      )}

      {/* ── 4. REWARD CLAIM VERIFICATION OVERLAY ── */}
      {(recordingAd || adCompleted) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900/95 text-white p-8 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col items-center text-center space-y-4 max-w-sm mx-4">
            {recordingAd ? (
              <>
                <Loader2 className="w-10 h-10 text-[#009F6B] animate-spin" />
                <div className="space-y-1">
                  <p className="text-base font-bold">Verifying Ad View</p>
                  <p className="text-xs text-slate-400">
                    Crediting reward to your wallet balance...
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-emerald-400">
                    Reward Credited!
                  </p>
                  <p className="text-xs text-slate-300">
                    {rewardPerAd
                      ? `৳${rewardPerAd.toFixed(2)} added to your wallet.`
                      : 'Daily task progress updated.'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
