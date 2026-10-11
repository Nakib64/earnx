'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  registerables,
} from 'chart.js';
import {
  Tv,
  Wallet,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  Crown,
  ChevronDown,
  Sparkles,
  PlayCircle,
  CheckCircle2,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

// Register all Chart.js components including LineController
ChartJS.register(...registerables);

export interface UserChartPoint {
  label: string;
  ads_count: number;
  total_earned: number;
}

export interface UserAdsAnalyticsSummary {
  total_ads_watched: number;
  total_earned_bdt: number;
  all_time_ads_watched: number;
  all_time_earned_bdt: number;
  avg_ads_per_day?: number;
}

export interface UserAdsAnalyticsResponse {
  timeframe: string;
  summary: UserAdsAnalyticsSummary;
  chart_data: UserChartPoint[];
}

type TimeframeOption = {
  key: string;
  label: string;
};

const TIMEFRAMES: TimeframeOption[] = [
  { key: '1d', label: '1D' },
  { key: '3d', label: '3D' },
  { key: '7d', label: '7D' },
  { key: '1m', label: '1M' },
];

export interface UserAdsAnalyticsChartProps {
  user?: any;
}

export function UserAdsAnalyticsChart({ user: propUser }: UserAdsAnalyticsChartProps = {}) {
  const { user: authUser } = useAuth();
  const currentUser = propUser || authUser;

  const [timeframe, setTimeframe] = useState<string>('7d');
  const [data, setData] = useState<UserAdsAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMetric, setActiveMetric] = useState<'both' | 'ads' | 'earnings'>('both');
  const [interpolationMode, setInterpolationMode] = useState<'monotone' | 'default' | 'linear'>('monotone');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchAnalytics = useCallback(async (tf: string) => {
    if (!data) {
      setLoading(true);
    }
    try {
      const res = await apiFetch<UserAdsAnalyticsResponse>(
        `/premium/user/ads-analytics?timeframe=${tf}`,
      );
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [timeframe, fetchAnalytics]);

  const chartPoints = useMemo(() => {
    if (data?.chart_data && data.chart_data.length > 0) {
      return data.chart_data;
    }
    const pointsCount = timeframe === '1d' ? 6 : timeframe === '3d' ? 6 : 7;
    return Array.from({ length: pointsCount }).map((_, i) => ({
      label: `Day ${i + 1}`,
      ads_count: 0,
      total_earned: 0,
    }));
  }, [data, timeframe]);

  // Chart.js instance lifecycle & interpolation mode binding
  useEffect(() => {
    if (!canvasRef.current || loading) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create emerald gradient for Ads
    const adsGradient = ctx.createLinearGradient(0, 0, 0, 260);
    adsGradient.addColorStop(0, 'rgba(0, 159, 107, 0.24)');
    adsGradient.addColorStop(1, 'rgba(0, 159, 107, 0.0)');

    // Create gold gradient for Earnings
    const earnedGradient = ctx.createLinearGradient(0, 0, 0, 260);
    earnedGradient.addColorStop(0, 'rgba(217, 119, 6, 0.24)');
    earnedGradient.addColorStop(1, 'rgba(217, 119, 6, 0.0)');

    const datasets: any[] = [];
    const tension = interpolationMode === 'linear' ? 0 : interpolationMode === 'default' ? 0.4 : 0;
    const cubicMode = interpolationMode === 'monotone' ? 'monotone' : 'default';

    if (activeMetric === 'both' || activeMetric === 'ads') {
      datasets.push({
        label: 'Ads Watched',
        data: chartPoints.map((p) => p.ads_count),
        borderColor: '#009F6B',
        backgroundColor: adsGradient,
        fill: true,
        cubicInterpolationMode: cubicMode,
        tension,
        pointRadius: 3.5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#009F6B',
        pointBorderWidth: 2,
        yAxisID: 'yAds',
      });
    }

    if (activeMetric === 'both' || activeMetric === 'earnings') {
      datasets.push({
        label: 'Earnings (৳)',
        data: chartPoints.map((p) => p.total_earned),
        borderColor: '#d97706',
        backgroundColor: earnedGradient,
        fill: activeMetric === 'earnings',
        cubicInterpolationMode: cubicMode,
        tension,
        pointRadius: 3.5,
        pointHoverRadius: 6,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#d97706',
        pointBorderWidth: 2,
        borderDash: activeMetric === 'both' ? [5, 4] : undefined,
        yAxisID: activeMetric === 'both' ? 'yEarned' : 'yAds',
      });
    }

    const chartInstance = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: chartPoints.map((p) => p.label),
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#0f172a',
            titleColor: '#fde68a',
            bodyColor: '#f8fafc',
            titleFont: { family: 'var(--font-montserrat), Montserrat, sans-serif', weight: 'bold', size: 12 },
            bodyFont: { family: 'var(--font-montserrat), Montserrat, sans-serif', weight: 'normal', size: 12 },
            padding: 12,
            cornerRadius: 12,
            displayColors: true,
            boxPadding: 4,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.parsed.y;
                if (label.includes('Earnings')) {
                  return ` ${label}: ৳${Number(val).toFixed(2)}`;
                }
                return ` ${label}: ${val?.toLocaleString()} ads`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: '#94a3b8',
              font: { family: 'var(--font-montserrat), Montserrat, sans-serif', size: 11, weight: 600 },
              maxRotation: 0,
            },
          },
          yAds: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            grid: {
              color: '#f1f5f9',
            },
            ticks: {
              color: '#64748b',
              font: { family: 'var(--font-montserrat), Montserrat, sans-serif', size: 11 },
              precision: 0,
            },
          },
          ...(activeMetric === 'both'
            ? {
              yEarned: {
                type: 'linear',
                display: true,
                position: 'right',
                beginAtZero: true,
                grid: {
                  drawOnChartArea: false,
                },
                ticks: {
                  color: '#d97706',
                  font: { family: 'var(--font-montserrat), Montserrat, sans-serif', size: 11 },
                  callback: (value) => `৳${value}`,
                },
              },
            }
            : {}),
        },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, [chartPoints, activeMetric, interpolationMode, loading]);

  const summary = data?.summary || {
    total_ads_watched: 0,
    total_earned_bdt: 0,
    all_time_ads_watched: 0,
    all_time_earned_bdt: 0,
  };

  const hasActivity = summary.total_ads_watched > 0 || summary.all_time_ads_watched > 0;

  // Subscribed package details (if only user is subscribed)
  const isSubscribed = Boolean(currentUser?.is_premium);
  const pkg = currentUser?.premium_package;
  const pkgTitle = pkg?.title || 'VIP Premium Membership';
  const pkgPrice = pkg?.price ? Number(pkg.price) : 0;
  const dailyAdsCount = pkg?.daily_ads_count ?? 30;
  const dailyRewardRate = pkg?.daily_reward_amount !== undefined ? Number(pkg.daily_reward_amount).toFixed(2) : '100.00';
  const expiresFormatted = currentUser?.premium_expires_at
    ? new Date(currentUser.premium_expires_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : null;

  return (
    <div className="space-y-6 w-full select-none">
      {/* 1. MAIN GRAPH BOX (Liquid Glassmorphism Card) */}
      <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 w-full relative overflow-hidden">
        {/* Subtle Ambient Radial Mesh Sheen */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/[0.05] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-sky-500/[0.04] blur-3xl pointer-events-none" />

        {/* Content 1: Header Row with Title & Filter Controls */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100/80 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 ">
              Ads Views &amp; Earnings
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50/90 text-emerald-800 text-[10px] font-bold border border-emerald-200/80">
              Personal
            </span>
          </div>

          {/* DESKTOP FILTER CONTROLS */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {/* Timeframe selector */}
            <div className="flex items-center bg-slate-100/80 backdrop-blur-sm p-0.5 rounded-xl border border-slate-200/70">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTimeframe(t.key)}
                  className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${timeframe === t.key
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Metric selector */}
            <div className="flex items-center bg-slate-100/80 backdrop-blur-sm p-0.5 rounded-xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => setActiveMetric('both')}
                className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${activeMetric === 'both'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Both
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('ads')}
                className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${activeMetric === 'ads'
                    ? 'bg-[#009F6B] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Ads
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('earnings')}
                className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${activeMetric === 'earnings'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Payouts
              </button>
            </div>
          </div>

          {/* MOBILE FILTER CONTROLS */}
          <div className="flex sm:hidden items-center gap-2 w-full">
            <div className="relative flex-1">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full min-h-[40px] appearance-none bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-xl px-3 py-2 pr-7 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                aria-label="Select timeframe"
              >
                {TIMEFRAMES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label} View
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative flex-1">
              <select
                value={activeMetric}
                onChange={(e) => setActiveMetric(e.target.value as any)}
                className="w-full min-h-[40px] appearance-none bg-white/90 backdrop-blur-sm border border-slate-200/90 rounded-xl px-3 py-2 pr-7 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                aria-label="Select metric"
              >
                <option value="both">Both</option>
                <option value="ads">Ads</option>
                <option value="earnings">Payouts</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content 2: Chart.js Canvas */}
        <div className="relative z-10 w-full h-64 sm:h-76">
          {loading ? (
            <div className="h-full flex justify-center items-center">
              <RefreshCw className="w-6 h-6 animate-spin text-[#009F6B]" />
            </div>
          ) : (
            <canvas ref={canvasRef} className="w-full h-full" />
          )}
        </div>
      </div>

      {/* 2. SEPARATE BOXES SECTION */}
      <div className="space-y-4">
        {/* Subscribed Package Card (Shown ONLY when subscribed: Max 2 Content - Left: Plan summary, Right: CTA button) */}
        {isSubscribed && (
          <div className="bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_16px_36px_rgba(15,23,42,0.06)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
            {/* Ambient Refraction Mesh Glows */}
            <div className="absolute -top-16 -right-16 w-60 h-60 bg-amber-500/[0.08] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-emerald-500/[0.07] blur-3xl pointer-events-none" />

            {/* Content 1: Plan Summary */}
            <div className="relative z-10 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-center text-amber-500 shrink-0 shadow-2xs">
                <Crown className="w-5 h-5 text-amber-500 fill-amber-400/20" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 ">
                    {pkgTitle}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/80">
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {dailyAdsCount} Ads/Day &bull; ৳{dailyRewardRate} Daily Return
                </p>
              </div>
            </div>

            {/* Content 2: CTA Button */}
            <Link
              href="/dashboard/premium"
              className="relative z-10 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer shrink-0 min-h-[44px]"
            >
              <PlayCircle className="w-4 h-4 text-white" />
              <span>Watch Ads</span>
            </Link>
          </div>
        )}

        {/* 4 Summary Stat Boxes: Max 2 Content per card (Top: Label + Icon, Bottom: Metric Value) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Box 1: Ads Watched */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Ads Watched</span>
              <Tv className="w-4 h-4 text-[#009F6B]" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
              {loading ? '...' : summary.total_ads_watched.toLocaleString()}
            </span>
          </div>

          {/* Box 2: Period Earnings */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Earned ({timeframe.toUpperCase()})</span>
              <span className="text-sm font-bold text-amber-600">৳</span>
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">
              {loading ? '...' : `৳${summary.total_earned_bdt.toLocaleString()}`}
            </span>
          </div>

          {/* Box 3: Lifetime Earned */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Lifetime Earned</span>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-purple-700 tabular-nums">
              {loading ? '...' : `৳${summary.all_time_earned_bdt.toLocaleString()}`}
            </span>
          </div>

          {/* Box 4: Current Available Balance */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[104px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Wallet Balance</span>
              <Wallet className="w-4 h-4 text-sky-600" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
              ৳{Number(currentUser?.wallet_balance || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserAdsAnalyticsChart;
