'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Megaphone, ExternalLink } from 'lucide-react';
import { GlassCard } from '../design-system';

export interface NoticeItem {
  id: string;
  image_url?: string | null;
  link_url?: string | null;
  serial_number?: number;
  title?: string | null;
  content?: string | null;
  is_active?: boolean;
}

interface DashboardNoticeBannerProps {
  notices?: NoticeItem[] | NoticeItem | null;
  notice?: NoticeItem | null;
}

export function DashboardNoticeBanner({ notices, notice }: DashboardNoticeBannerProps) {
  // Normalize notices to an active array
  const rawList: NoticeItem[] = Array.isArray(notices)
    ? notices
    : notices
      ? [notices]
      : notice
        ? [notice]
        : [];

  const activeNotices = rawList.filter((item) => item.is_active !== false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-advance slider
  useEffect(() => {
    if (activeNotices.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeNotices.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeNotices.length, isPaused]);

  // Reset index if notices change
  useEffect(() => {
    if (currentIndex >= activeNotices.length) {
      setCurrentIndex(0);
    }
  }, [activeNotices.length, currentIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + activeNotices.length) % activeNotices.length);
  }, [activeNotices.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % activeNotices.length);
  }, [activeNotices.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      // Swiped left
      handleNext();
    } else if (distance < -50) {
      // Swiped right
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (activeNotices.length === 0) return null;

  const currentNotice = activeNotices[currentIndex];

  const getFullImageUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    return `${base}${url}`;
  };

  // If the current slide has no image_url, show fallback stylized text announcement banner
  if (!currentNotice.image_url) {
    return (
      <GlassCard
        variant="standard"
        className="p-4 sm:p-5 border-amber-200/70 bg-white/80 relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xs"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/[0.05] rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100/80 border border-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
            <Megaphone className="w-5 h-5 text-amber-800" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200/80">
                Notice
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-900  truncate">
                {currentNotice.title || 'Official Announcement'}
              </h2>
            </div>
            {currentNotice.content && (
              <p className="text-xs sm:text-sm font-semibold text-slate-600 leading-relaxed">
                {currentNotice.content}
              </p>
            )}
          </div>
        </div>
      </GlassCard>
    );
  }

  const BannerContent = (
    <div
      className="relative w-full h-36 sm:h-44 md:h-52 lg:h-56 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/85 bg-slate-900 group select-none transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      {activeNotices.map((slide, idx) => {
        const isCurrent = idx === currentIndex;
        return (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
          >
            <img
              src={getFullImageUrl(slide.image_url)}
              alt={slide.title || `Notice Banner ${idx + 1}`}
              className="w-full h-full object-cover object-center"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
            {/* Subtle Gradient Overlay for visual polish */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        );
      })}

      {/* Navigation Arrows for desktop hover */}
      {activeNotices.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handlePrev();
            }}
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 items-center justify-center shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNext();
            }}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-800 items-center justify-center shadow-md backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Pagination Dot Indicators (Matched to bKash design: active pill dot + inactive circles) */}
      {activeNotices.length > 1 && (
        <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md shadow-xs">
          {activeNotices.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${isActive
                    ? 'w-6 sm:w-7 h-2 bg-white shadow-xs'
                    : 'w-2 h-2 bg-white/60 hover:bg-white/90'
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );

  // If notice has a link_url, make the slide clickable
  if (currentNotice.link_url) {
    const isExternal = currentNotice.link_url.startsWith('http');
    if (isExternal) {
      return (
        <a
          href={currentNotice.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full transition-transform active:scale-[0.99]"
        >
          {BannerContent}
        </a>
      );
    }
    return (
      <Link
        href={currentNotice.link_url}
        className="block w-full transition-transform active:scale-[0.99]"
      >
        {BannerContent}
      </Link>
    );
  }

  return BannerContent;
}

