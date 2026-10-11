'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  registerables,
} from 'chart.js';
import { apiFetch } from '../../../lib/api';
import { AdsAnalyticsData, AdsAnalyticsChartPoint } from '../../../types';
import {
  BarChart3,
  TrendingUp,
  Tv,
  Wallet,
  Users,
  Calendar,
  RefreshCw,
  Crown,
  Clock,
  ArrowUpRight,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { AlertBanner } from '../../../components/common/AlertBanner';
import { ShimmerSkeleton, SkeletonLine } from '../../../components/design-system';

// Register all Chart.js components
ChartJS.register(...registerables);

type TimeframeOption = {
  key: string;
  label: string;
};

const TIMEFRAMES: TimeframeOption[] = [
  { key: '1d', label: '1 Day' },
  { key: '3d', label: '3 Days' },
  { key: '7d', label: '7 Days' },
  { key: '1m', label: '1 Month' },
  { key: '3m', label: '3 Months' },
];

export default function AdminAdsAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<string>('7d');
  const [data, setData] = useState<AdsAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeMetric, setActiveMetric] = useState<'both' | 'ads' | 'earnings'>('both');
  const [interpolationMode, setInterpolationMode] = useState<'monotone' | 'default' | 'linear'>('monotone');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchAnalytics = useCallback(async (tf: string) => {
    setLoading(true);
    setErrorMsg(null);
    const res = await apiFetch<AdsAnalyticsData>(`/premium/admin/ads-analytics?timeframe=${tf}`, {
      isAdmin: true,
    });
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setErrorMsg(res.error?.message || 'Failed to load ads analytics');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [timeframe, fetchAnalytics]);

  const chartPoints = useMemo(() => {
    if (!data?.chart_data || data.chart_data.length === 0) return [];
    return data.chart_data;
  }, [data]);

  useEffect(() => {
    if (!canvasRef.current || loading || chartPoints.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create emerald gradient for Ads
    const adsGradient = ctx.createLinearGradient(0, 0, 0, 280);
    adsGradient.addColorStop(0, 'rgba(0, 159, 107, 0.25)');
    adsGradient.addColorStop(1, 'rgba(0, 159, 107, 0.0)');

    // Create gold gradient for Earnings
    const earnedGradient = ctx.createLinearGradient(0, 0, 0, 280);
    earnedGradient.addColorStop(0, 'rgba(217, 119, 6, 0.24)');
    earnedGradient.addColorStop(1, 'rgba(217, 119, 6, 0.0)');

    const datasets: any[] = [];
    const tension = interpolationMode === 'linear' ? 0 : interpolationMode === 'default' ? 0.4 : 0;
    const cubicMode = interpolationMode === 'monotone' ? 'monotone' : 'default';

    if (activeMetric === 'both' || activeMetric === 'ads') {
      datasets.push({
        label: 'Total Ads Watched',
        data: chartPoints.map((p) => p.ads_count),
        borderColor: '#009F6B',
        backgroundColor: adsGradient,
        fill: true,
        cubicInterpolationMode: cubicMode,
        tension,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#009F6B',
        pointBorderWidth: 2.5,
        yAxisID: 'yAds',
      });
    }

    if (activeMetric === 'both' || activeMetric === 'earnings') {
      datasets.push({
        label: 'User Payouts (৳)',
        data: chartPoints.map((p) => p.total_earned),
        borderColor: '#d97706',
        backgroundColor: earnedGradient,
        fill: activeMetric === 'earnings',
        cubicInterpolationMode: cubicMode,
        tension,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#d97706',
        pointBorderWidth: 2.5,
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
            cornerRadius: 14,
            displayColors: true,
            boxPadding: 4,
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const val = context.parsed.y;
                if (label.includes('Payouts')) {
                  return ` ${label}: ৳${Number(val).toFixed(2)}`;
                }
                return ` ${label}: ${val?.toLocaleString()} ads`;
              },
              afterBody: (tooltipItems) => {
                const idx = tooltipItems[0]?.dataIndex;
                if (idx !== undefined && chartPoints[idx]?.active_users !== undefined) {
                  return [` Active Viewers: ${chartPoints[idx].active_users}`];
                }
                return [];
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

  return (
    <div className="relative z-10 min-h-full text-[#111827] pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 select-none">
        {/* ── 1. PAGE HEADER (Sitting directly on background per Design System) ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pt-1">
          <div className="space-y-1.5 max-w-2xl">
            {/* Eyebrow Label */}
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
              Analytics &amp; Revenue Intelligence
            </div>

            {/* Prominent Main Heading */}
            <h1 className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-tight">
              Ads Views &amp; Member Earnings Analytics
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-[15px] text-slate-600 font-normal leading-relaxed">
              Real-time platform oversight of total ad views, daily user reward disbursements, active member quotas, and fractional wallet credits.
            </p>

            {/* Status & Time Horizon Indicator */}
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#009F6B] animate-pulse" />
                Live Data Stream &bull;{' '}
                <strong className="text-slate-900 font-semibold">
                  {TIMEFRAMES.find((t) => t.key === timeframe)?.label} Horizon
                </strong>
              </span>
            </div>
          </div>

          {/* Secondary Actions with Liquid Glassmorphism */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/premium"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-md border border-white/90 text-xs font-semibold text-slate-700 hover:bg-white transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>VIP Packages</span>
            </Link>

            <button
              onClick={() => fetchAnalytics(timeframe)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#009F6B] hover:bg-[#008C5F] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <AlertBanner type="error" message={errorMsg} onClose={() => setErrorMsg(null)} />
        )}

        {/* ── 2. TIMEFRAME HORIZON SELECTOR (Liquid Glassmorphism Card) ── */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Analytics Time Window
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                Select duration to recalculate all graphs and metrics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200/70 overflow-x-auto">
            {TIMEFRAMES.map((tf) => {
              const isActive = timeframe === tf.key;
              return (
                <button
                  key={tf.key}
                  type="button"
                  onClick={() => setTimeframe(tf.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-[0.98] ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. TOP 4 KPI METRIC CARDS (Matches User Dashboard Boxes) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Total Ads Watched */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Ads Watched</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                <Tv className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
                {loading ? '...' : (data?.summary.total_ads_watched ?? 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                All-time: {(data?.summary.all_time_ads_watched ?? 0).toLocaleString()} ads
              </span>
            </div>
          </div>

          {/* Card 2: Total User Earnings */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">User Payouts</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">
                ৳{loading ? '...' : (data?.summary.total_earned_bdt ?? 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                All-time: ৳{(data?.summary.all_time_earned_bdt ?? 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Card 3: Active Watchers */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Watchers</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-sky-700 tabular-nums">
                {loading ? '...' : (data?.summary.active_users ?? 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Active premium members
              </span>
            </div>
          </div>

          {/* Card 4: Avg Ads / Viewer */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 flex flex-col justify-between min-h-[110px] hover:bg-white/85 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Avg Ads / Viewer</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-bold text-purple-700 tabular-nums">
                {loading ? '...' : (data?.summary.avg_ads_per_user ?? 0)}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5 truncate">
                Daily task average
              </span>
            </div>
          </div>
        </div>

        {/* ── 4. MAIN INTERACTIVE GRAPH CARD (Liquid Glassmorphism) ── */}
        <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-6 w-full relative overflow-hidden">
          {/* Subtle Ambient Radial Mesh Sheen */}
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/[0.05] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-amber-500/[0.04] blur-3xl pointer-events-none" />

          {/* Header Row with Title & Filter Controls */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100/80 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Performance Curve &amp; Disbursement Trajectory
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50/90 text-emerald-800 text-[10px] font-bold border border-emerald-200/80">
                  {TIMEFRAMES.find((t) => t.key === timeframe)?.label} View
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Trajectory of total ads watched (Emerald) vs total user payouts in BDT (Gold)
              </p>
            </div>

            {/* Controls (Metric Selector & Interpolation Selector) */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Interpolation Mode Selector */}
              <div className="flex items-center bg-slate-100/80 backdrop-blur-sm p-0.5 rounded-xl border border-slate-200/70" title="Spline curve tension">
                <button
                  type="button"
                  onClick={() => setInterpolationMode('monotone')}
                  className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                    interpolationMode === 'monotone'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Monotone
                </button>
                <button
                  type="button"
                  onClick={() => setInterpolationMode('default')}
                  className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                    interpolationMode === 'default'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cubic
                </button>
                <button
                  type="button"
                  onClick={() => setInterpolationMode('linear')}
                  className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                    interpolationMode === 'linear'
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Linear
                </button>
              </div>

              {/* Metric Selector */}
              <div className="flex items-center bg-slate-100/80 backdrop-blur-sm p-0.5 rounded-xl border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => setActiveMetric('both')}
                  className={`min-h-[30px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                    activeMetric === 'both'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Both
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('ads')}
                  className={`min-h-[30px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                    activeMetric === 'ads'
                      ? 'bg-[#009F6B] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ads
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMetric('earnings')}
                  className={`min-h-[30px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                    activeMetric === 'earnings'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Payouts
                </button>
              </div>
            </div>
          </div>

          {/* Legend Row */}
          <div className="flex items-center gap-6 text-xs font-semibold relative z-10">
            {(activeMetric === 'both' || activeMetric === 'ads') && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#009F6B]" />
                <span className="text-slate-700">Total Ads Watched</span>
              </div>
            )}
            {(activeMetric === 'both' || activeMetric === 'earnings') && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#d97706]" />
                <span className="text-slate-700">User Earnings (৳ BDT)</span>
              </div>
            )}
            <div className="ml-auto text-[11px] font-medium text-slate-400 hidden sm:inline">
              Interpolation: <strong className="text-slate-700 uppercase font-semibold">{interpolationMode}</strong>
            </div>
          </div>

          {/* Chart.js Canvas */}
          <div className="relative z-10 w-full h-72 sm:h-80">
            {loading ? (
              <div className="h-full flex justify-center items-center">
                <RefreshCw className="w-8 h-8 animate-spin text-[#009F6B]" />
              </div>
            ) : chartPoints.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-2 text-slate-400">
                <Tv className="w-10 h-10 text-slate-300" />
                <p className="text-xs font-semibold">No ads recorded in this timeframe yet.</p>
              </div>
            ) : (
              <canvas ref={canvasRef} className="w-full h-full" />
            )}
          </div>
        </div>

        {/* ── 5. PACKAGE BREAKDOWN & LIVE RECENT ACTIVITY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Package Breakdown */}
          <div className="bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Package Breakdown
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Volume &amp; Payouts</span>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-[#009F6B]" />
              </div>
            ) : !data?.package_breakdown || data.package_breakdown.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-semibold">
                No package activity in selected timeframe
              </div>
            ) : (
              <div className="space-y-3">
                {data.package_breakdown.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-900 font-bold">{pkg.title}</strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                        {pkg.ads_count.toLocaleString()} Ads
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Total Payout:</span>
                      <strong className="text-[#009F6B] font-bold">
                        ৳{pkg.total_earned.toLocaleString()}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-500">
                      <span>Active Users:</span>
                      <strong className="text-slate-800 font-semibold">{pkg.user_count} members</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 2: Live Recent Ad Activity Feed Table */}
          <div className="lg:col-span-2 bg-white/75 backdrop-blur-xl border border-white/85 shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#009F6B] shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Recent Watch &amp; Earn Activity
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">Live Audit Feed</span>
            </div>

            {loading ? (
              <div className="py-8 flex justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-[#009F6B]" />
              </div>
            ) : !data?.recent_activity || data.recent_activity.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-semibold">
                No recent ad watches recorded in this timeframe
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10.5px] font-bold uppercase text-slate-400 tracking-wider">
                      <th className="pb-3 font-semibold">Member</th>
                      <th className="pb-3 font-semibold">Subscribed Package</th>
                      <th className="pb-3 font-semibold">Credit Disbursed</th>
                      <th className="pb-3 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 font-medium">
                    {data.recent_activity.map((item) => (
                      <tr key={item.id} className="hover:bg-white/60 transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-slate-900">{item.user_name}</div>
                          {item.user_phone && (
                            <div className="text-[11px] text-slate-400 font-mono">
                              {item.user_phone}
                            </div>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/60">
                            {item.package_title}
                          </span>
                        </td>
                        <td className="py-3">
                          <strong className="text-[#009F6B] font-bold">
                            +৳{item.amount.toFixed(2)}
                          </strong>
                        </td>
                        <td className="py-3 text-slate-400 text-[11px]">
                          {new Date(item.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
