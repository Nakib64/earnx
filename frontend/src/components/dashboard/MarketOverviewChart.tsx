'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  time?: string;
}

// Candlesticks matching the exact curve in the mockup
const candleData: CandleData[] = [
  { open: 155, high: 160, low: 154, close: 159 },
  { open: 159, high: 164, low: 158, close: 162 },
  { open: 162, high: 166, low: 160, close: 165 },
  { open: 165, high: 172, low: 164, close: 170 },
  { open: 170, high: 174, low: 166, close: 168 },
  { open: 168, high: 169, low: 161, close: 163 },
  { open: 163, high: 167, low: 162, close: 166 },
  { open: 166, high: 175, low: 165, close: 174 },
  { open: 174, high: 184, low: 172, close: 182 },
  { open: 182, high: 189.45, low: 180, close: 188 }, // Peak High $189.45
  { open: 188, high: 189, low: 178, close: 180 },
  { open: 180, high: 182, low: 171, close: 173 },
  { open: 173, high: 175, low: 165, close: 167 },
  { open: 167, high: 168, low: 158, close: 160 },
  { open: 160, high: 162, low: 148, close: 150 },
  { open: 150, high: 152, low: 142.35, close: 144 }, // Trough Low $142.35
  { open: 144, high: 156, low: 143, close: 154 },
  { open: 154, high: 168, low: 153, close: 166 },
  { open: 166, high: 172, low: 164, close: 170 },
  { open: 170, high: 171, low: 162, close: 164 },
  { open: 164, high: 168, low: 162, close: 167 },
  { open: 167, high: 168, low: 156, close: 158 },
  { open: 158, high: 160, low: 150, close: 152 },
];

// Bottom dotted waveform points
const bottomWave = [
  { x: 20, y: 155 },
  { x: 50, y: 152 },
  { x: 90, y: 142 },
  { x: 130, y: 150 },
  { x: 170, y: 158 },
  { x: 210, y: 155 },
  { x: 250, y: 144 },
  { x: 290, y: 143 },
  { x: 330, y: 148 },
  { x: 370, y: 144 },
  { x: 400, y: 152 },
];

export default function MarketOverviewChart() {
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '1M'>('7D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const minPrice = 135;
  const maxPrice = 195;

  const svgWidth = 440;
  const svgHeight = 175;
  const chartRightMargin = 45; // Space for Y-axis labels
  const chartWidth = svgWidth - chartRightMargin;

  const getY = (price: number) => {
    const ratio = (price - minPrice) / (maxPrice - minPrice);
    return svgHeight - 35 - ratio * (svgHeight - 55);
  };

  const candleStep = (chartWidth - 20) / candleData.length;
  const yLabels = [190, 180, 170, 160, 150, 140];

  return (
    <div className="bg-white rounded-[28px] p-5 sm:p-6 shadow-sm border border-slate-100/80">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          Market Overview
        </h3>

        <div className="relative">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-extrabold px-3.5 py-1.5 pr-7 rounded-xl border border-slate-200 cursor-pointer focus:outline-none"
          >
            <option value="1D">1D</option>
            <option value="7D">7D</option>
            <option value="1M">1M</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* High / Low Pills */}
      <div className="flex items-center gap-2.5 mb-2">
        <span className="inline-flex items-center gap-1.5 bg-[#e8faf0] text-[#059669] text-xs font-bold px-3 py-1 rounded-xl border border-[#c1f2d6]">
          <span>High: $189.45</span>
          <span className="w-4 h-4 rounded-full bg-[#059669] text-white text-[9px] flex items-center justify-center font-black">
            ↗
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 bg-[#fef2f2] text-[#e11d48] text-xs font-bold px-3 py-1 rounded-xl border border-[#fed7d7]">
          <span>Low: $142.35</span>
          <span className="w-4 h-4 rounded-full bg-[#e11d48] text-white text-[9px] flex items-center justify-center font-black">
            ↘
          </span>
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden pt-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Y Axis Numbers on the right */}
          {yLabels.map((val) => {
            const y = getY(val);
            return (
              <text
                key={val}
                x={svgWidth - 5}
                y={y + 3}
                textAnchor="end"
                fill="#94a3b8"
                className="text-[10px] font-medium"
              >
                {val}
              </text>
            );
          })}

          {/* Candlesticks */}
          {candleData.map((candle, idx) => {
            const x = 15 + idx * candleStep + candleStep / 2;
            const isBullish = candle.close >= candle.open;
            const color = isBullish ? '#10b981' : '#f43f5e';

            const highY = getY(candle.high);
            const lowY = getY(candle.low);
            const openY = getY(candle.open);
            const closeY = getY(candle.close);

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 4);
            const candleWidth = 7.5;

            return (
              <g
                key={`candle-${idx}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  rx={2}
                />
              </g>
            );
          })}

          {/* Bottom green dotted wave line */}
          <path
            d={`M ${bottomWave[0].x} ${bottomWave[0].y} Q 70 135, 130 150 T 250 144 T 370 144 T 400 152`}
            fill="none"
            stroke="#10b981"
            strokeWidth={1.6}
            opacity={0.85}
          />
          {bottomWave.map((pt, i) => (
            <circle
              key={`dot-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={2.8}
              fill="#059669"
            />
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && (
          <div className="absolute top-0 right-1 bg-slate-900 text-white px-2.5 py-1 rounded-lg text-[10px] font-mono shadow-md z-10">
            <span>Price: ${candleData[hoveredIndex].close.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
