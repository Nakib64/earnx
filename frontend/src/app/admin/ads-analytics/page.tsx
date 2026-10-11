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
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { AlertBanner } from '../../../components/common/AlertBanner';

// Register all Chart.js components including LineController
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

  // SVG Chart Computations for smooth spline curves
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
    adsGradient.addColorStop(0, 'rgba(0, 90, 54, 0.28)');
    adsGradient.addColorStop(1, 'rgba(0, 90, 54, 0.0)');

    // Create gold gradient for Earnings
    const earnedGradient = ctx.createLinearGradient(0, 0, 0, 280);
    earnedGradient.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
    earnedGradient.addColorStop(1, 'rgba(212, 175, 55, 0.0)');

    const datasets: any[] = [];
    const tension = interpolationMode === 'linear' ? 0 : interpolationMode === 'default' ? 0.4 : 0;
    const cubicMode = interpolationMode === 'monotone' ? 'monotone' : 'default';

    if (activeMetric === 'both' || activeMetric === 'ads') {
      datasets.push({
        label: 'Total Ads Run',
        data: chartPoints.map((p) => p.ads_count),
        borderColor: '#005A36',
        backgroundColor: adsGradient,
        fill: true,
        cubicInterpolationMode: cubicMode,
        tension,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#005A36',
        pointBorderWidth: 2.5,
        yAxisID: 'yAds',
      });
    }

    if (activeMetric === 'both' || activeMetric === 'earnings') {
      datasets.push({
        label: 'User Payouts (৳)',
        data: chartPoints.map((p) => p.total_earned),
        borderColor: '#f59e0b',
        backgroundColor: earnedGradient,
        fill: activeMetric === 'earnings',
        cubicInterpolationMode: cubicMode,
        tension,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#f59e0b',
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
            titleFont: { family: 'Montserrat, sans-serif', weight: 'bold', size: 12 },
            bodyFont: { family: 'Montserrat, sans-serif', weight: 'normal', size: 12 },
            padding: 12,
            cornerRadius: 12,
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
              font: { family: 'Montserrat, sans-serif', size: 11, weight: 600 },
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
              font: { family: 'Montserrat, sans-serif', size: 11 },
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
                  font: { family: 'Montserrat, sans-serif', size: 11 },
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
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#01281a] via-[#023b28] to-[#011f15] border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-[#d4af37]/50 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Watch-to-Earn Revenue & Consumption Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-black  text-white">
              Ads Analytics & User Earnings
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-medium max-w-2xl">
              Real-time monitoring of total ads displayed, daily user reward disbursements, active member quotas, and fractional wallet credits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/premium"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-xs font-bold transition-all"
            >
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Manage Packages</span>
            </Link>
            <button
              onClick={() => fetchAnalytics(timeframe)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#b8952b] text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <AlertBanner type="error" message={errorMsg} onClose={() => setErrorMsg(null)} />
      )}

      {/* Timeframe Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-emerald-700" />
          <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Analytics Time Horizon:
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
          {TIMEFRAMES.map((tf) => {
            const isActive = timeframe === tf.key;
            return (
              <button
                key={tf.key}
                onClick={() => setTimeframe(tf.key)}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer shrink-0 ${isActive
                  ? 'bg-[#005A36] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Ads Watched */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Total Ads Watched
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#005A36]">
              <Tv className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900  ">
              {loading ? '...' : (data?.summary.total_ads_watched ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>In selected {TIMEFRAMES.find((t) => t.key === timeframe)?.label}</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-bold">
            All-Time Total: {(data?.summary.all_time_ads_watched ?? 0).toLocaleString()} ads
          </div>
        </div>

        {/* Metric 2: Total User Earnings */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Total User Earnings
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-black text-lg">
              ৳
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900  ">
              ৳{loading ? '...' : (data?.summary.total_earned_bdt ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-amber-700 mt-1 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" />
              <span>Disbursed directly into user wallets</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-bold">
            All-Time Payout: ৳{(data?.summary.all_time_earned_bdt ?? 0).toLocaleString()}
          </div>
        </div>

        {/* Metric 3: Active Viewers */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Active Watchers
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900  ">
              {loading ? '...' : (data?.summary.active_users ?? 0).toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-sky-700 mt-1">
              Unique premium users participating
            </div>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-bold">
            Fractional earning enabled for all members
          </div>
        </div>

        {/* Metric 4: Avg Ads per User */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Avg Ads / Viewer
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900  ">
              {loading ? '...' : (data?.summary.avg_ads_per_user ?? 0)}
            </div>
            <div className="text-[11px] font-semibold text-purple-700 mt-1">
              Average ad completions per viewer
            </div>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-bold">
            Guaranteed daily quota limits enforced
          </div>
        </div>
      </div>

      {/* Main Interactive Smooth Chart Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Performance Curve & Disbursement Trend
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                {TIMEFRAMES.find((t) => t.key === timeframe)?.label} View
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Smooth spline trajectory of total ads watched (Emerald) vs total user reward payouts in BDT (Gold)
            </p>
          </div>

          {/* Metric View & Interpolation Mode Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Interpolation Mode Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200" title="Chart.js Interpolation Mode">
              <button
                type="button"
                onClick={() => setInterpolationMode('monotone')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${interpolationMode === 'monotone'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                  }`}
              >
                Monotone
              </button>
              <button
                type="button"
                onClick={() => setInterpolationMode('default')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${interpolationMode === 'default'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                  }`}
              >
                Cubic
              </button>
              <button
                type="button"
                onClick={() => setInterpolationMode('linear')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${interpolationMode === 'linear'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                  }`}
              >
                Linear
              </button>
            </div>

            {/* Metric Selector */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveMetric('both')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeMetric === 'both'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                  }`}
              >
                Both Metrics
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('ads')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeMetric === 'ads'
                    ? 'bg-[#005A36] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                  }`}
              >
                Ads Watched
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('earnings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeMetric === 'earnings'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                  }`}
              >
                Payouts (৳)
              </button>
            </div>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center gap-6 text-xs font-black">
          {(activeMetric === 'both' || activeMetric === 'ads') && (
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-[#005A36]" />
              <span className="text-slate-700">Total Ads Run (Count)</span>
            </div>
          )}
          {(activeMetric === 'both' || activeMetric === 'earnings') && (
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
              <span className="text-slate-700">User Earnings (৳ BDT)</span>
            </div>
          )}
          <div className="ml-auto text-[11px] font-semibold text-slate-400 hidden sm:inline">
            Chart.js Mode: <strong className="text-slate-800 uppercase">{interpolationMode}</strong>
          </div>
        </div>

        {/* Chart.js Canvas Container */}
        {loading ? (
          <div className="h-72 sm:h-80 flex justify-center items-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#005A36]" />
          </div>
        ) : chartPoints.length === 0 ? (
          <div className="h-72 sm:h-80 flex flex-col justify-center items-center text-center space-y-2 text-slate-400">
            <Tv className="w-10 h-10 text-slate-300" />
            <p className="text-xs font-bold">No ads recorded in this timeframe yet.</p>
          </div>
        ) : (
          <div className="relative w-full h-72 sm:h-80">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        )}
      </div>

      {/* Package Breakdown & Live Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VIP Packages Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span>Package Breakdown</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">Volume & Payouts</span>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-[#005A36]" />
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
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900 font-black">{pkg.title}</strong>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {pkg.ads_count} Ads Ran
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Total Payout:</span>
                    <strong className="text-emerald-700 font-black">
                      ৳{pkg.total_earned.toLocaleString()}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Active Users:</span>
                    <strong className="text-slate-800 font-bold">{pkg.user_count} members</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Recent Ad Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#005A36]" />
              <span>Recent Watch & Earn Activity</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">Live Audit Feed</span>
          </div>

          {loading ? (
            <div className="py-8 flex justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-[#005A36]" />
            </div>
          ) : !data?.recent_activity || data.recent_activity.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-semibold">
              No recent ad watches recorded in this timeframe
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="pb-2.5">User</th>
                    <th className="pb-2.5">Package</th>
                    <th className="pb-2.5">Reward Credited</th>
                    <th className="pb-2.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {data.recent_activity.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5">
                        <div className="font-black text-slate-900">{item.user_name}</div>
                        {item.user_phone && (
                          <div className="text-[10px] text-slate-400 ">
                            {item.user_phone}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-black border border-amber-200/50">
                          {item.package_title}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <strong className="text-emerald-700 font-black ">
                          +৳{item.amount.toFixed(2)}
                        </strong>
                      </td>
                      <td className="py-2.5 text-slate-400 text-[11px]">
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
  );
}
