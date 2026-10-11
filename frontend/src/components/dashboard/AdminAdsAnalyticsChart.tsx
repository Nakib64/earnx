'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Chart as ChartJS,
  registerables,
} from 'chart.js';
import { apiFetch } from '../../lib/api';
import { AdsAnalyticsData, AdsAnalyticsChartPoint } from '../../types';
import {
  TrendingUp,
  Tv,
  Wallet,
  Calendar,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

// Register all Chart.js components
ChartJS.register(...registerables);

export interface TimeframeOption {
  key: string;
  label: string;
  shortLabel: string;
}

export const ADMIN_ADS_TIMEFRAMES: TimeframeOption[] = [
  { key: '1d', label: '1 Day', shortLabel: '1D' },
  { key: '3d', label: '3 Days', shortLabel: '3D' },
  { key: '7d', label: '7 Days', shortLabel: '7D' },
  { key: '1m', label: '1 Month', shortLabel: '1M' },
  { key: '3m', label: '3 Months', shortLabel: '3M' },
];

export interface AdminAdsAnalyticsChartProps {
  initialTimeframe?: string;
  initialData?: AdsAnalyticsData | null;
  onTimeframeChange?: (timeframe: string) => void;
  onDataLoaded?: (data: AdsAnalyticsData) => void;
  showTimeframeSelector?: boolean;
  showMetricSelector?: boolean;
  showInterpolationSelector?: boolean;
  heightClass?: string;
  className?: string;
}

export function AdminAdsAnalyticsChart({
  initialTimeframe = '7d',
  initialData = null,
  onTimeframeChange,
  onDataLoaded,
  showTimeframeSelector = true,
  showMetricSelector = true,
  showInterpolationSelector = true,
  heightClass = 'h-64 sm:h-76',
  className = '',
}: AdminAdsAnalyticsChartProps) {
  const [timeframe, setTimeframe] = useState<string>(initialTimeframe);
  const [data, setData] = useState<AdsAnalyticsData | null>(initialData);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [activeMetric, setActiveMetric] = useState<'both' | 'ads' | 'earnings'>('both');
  const [interpolationMode, setInterpolationMode] = useState<'monotone' | 'default' | 'linear'>('monotone');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<ChartJS | null>(null);

  // Sync initialData if provided and changed
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
    }
  }, [initialData]);

  // Fetch analytics when timeframe changes
  const fetchAnalytics = useCallback(async (tf: string) => {
    setLoading(true);
    try {
      const res = await apiFetch<AdsAnalyticsData>(`/premium/admin/ads-analytics?timeframe=${tf}`, {
        isAdmin: true,
      });
      if (res.success && res.data) {
        setData(res.data);
        onDataLoaded?.(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin ads analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded]);

  // Handle timeframe change
  const handleTimeframeChange = useCallback((newTf: string) => {
    setTimeframe(newTf);
    onTimeframeChange?.(newTf);
    fetchAnalytics(newTf);
  }, [fetchAnalytics, onTimeframeChange]);

  // Initial fetch if no initialData
  useEffect(() => {
    if (!initialData) {
      fetchAnalytics(timeframe);
    }
  }, []);

  const chartPoints = useMemo(() => {
    if (!data?.chart_data || data.chart_data.length === 0) return [];
    return data.chart_data;
  }, [data]);

  // Initialize or re-draw Chart.js instance
  useEffect(() => {
    // Destroy previous chart instance cleanly
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    if (!canvasRef.current || loading || chartPoints.length === 0) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create emerald gradient for Total Ads
    const adsGradient = ctx.createLinearGradient(0, 0, 0, 260);
    adsGradient.addColorStop(0, 'rgba(0, 159, 107, 0.25)');
    adsGradient.addColorStop(1, 'rgba(0, 159, 107, 0.0)');

    // Create gold/amber gradient for User Payouts
    const earnedGradient = ctx.createLinearGradient(0, 0, 0, 260);
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

    chartInstanceRef.current = chartInstance;

    return () => {
      chartInstance.destroy();
      chartInstanceRef.current = null;
    };
  }, [chartPoints, activeMetric, interpolationMode, loading]);

  const activeTimeframeObj = ADMIN_ADS_TIMEFRAMES.find((t) => t.key === timeframe) || ADMIN_ADS_TIMEFRAMES[2];

  return (
    <div className={`space-y-4 relative z-10 ${className}`}>
      {/* ── CONTROLS ROW ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-100/80">
        {/* Left: Timeframe pills */}
        {showTimeframeSelector && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl border border-slate-200/70 overflow-x-auto self-start">
            {ADMIN_ADS_TIMEFRAMES.map((tf) => {
              const isActive = timeframe === tf.key;
              return (
                <button
                  key={tf.key}
                  type="button"
                  onClick={() => handleTimeframeChange(tf.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-[0.98] ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <span className="hidden sm:inline">{tf.label}</span>
                  <span className="sm:hidden">{tf.shortLabel}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right: Spline tension & Metric selector */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {/* Spline Tension Selector */}
          {showInterpolationSelector && (
            <div className="flex items-center bg-slate-100/80 backdrop-blur-sm p-0.5 rounded-xl border border-slate-200/70" title="Spline curve tension">
              <button
                type="button"
                onClick={() => setInterpolationMode('monotone')}
                className={`min-h-[28px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
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
                className={`min-h-[28px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
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
                className={`min-h-[28px] px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                  interpolationMode === 'linear'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Linear
              </button>
            </div>
          )}

          {/* Metric Selector */}
          {showMetricSelector && (
            <div className="flex items-center bg-slate-100/80 backdrop-blur-sm p-0.5 rounded-xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => setActiveMetric('both')}
                className={`min-h-[28px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
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
                className={`min-h-[28px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
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
                className={`min-h-[28px] px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                  activeMetric === 'earnings'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Payouts
              </button>
            </div>
          )}

          {/* Quick Refresh Button */}
          <button
            type="button"
            onClick={() => fetchAnalytics(timeframe)}
            disabled={loading}
            title="Refresh analytics data"
            className="p-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 border border-slate-200/70 transition-all cursor-pointer active:scale-[0.95] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── LEGEND & INDICATORS ROW ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold pt-1">
        <div className="flex items-center gap-5">
          {(activeMetric === 'both' || activeMetric === 'ads') && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#009F6B]" />
              <span className="text-slate-700">Total Ads Watched</span>
            </div>
          )}
          {(activeMetric === 'both' || activeMetric === 'earnings') && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
              <span className="text-slate-700">User Payouts (৳ BDT)</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-[#009F6B] animate-pulse" />
          <span>{activeTimeframeObj.label} Horizon</span>
          <span className="text-slate-300">•</span>
          <span>Interpolation: <strong className="text-slate-700 uppercase font-semibold">{interpolationMode}</strong></span>
        </div>
      </div>

      {/* ── CHART CANVAS CONTAINER ── */}
      <div className={`relative w-full ${heightClass}`}>
        {loading ? (
          <div className="h-full flex flex-col justify-center items-center gap-2 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-[#009F6B]" />
            <span className="text-xs font-medium">Loading live trajectory...</span>
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
  );
}

export default AdminAdsAnalyticsChart;
