'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  time: string;
}

// Exact 29 candle waveform matching the provided screenshot
const mock7DCandles: CandleData[] = [
  { open: 154, high: 158, low: 152, close: 157, time: '1' },
  { open: 157, high: 161, low: 155, close: 160, time: '2' },
  { open: 160, high: 161, low: 156, close: 157, time: '3' },
  { open: 157, high: 165, low: 156, close: 164, time: '4' },
  { open: 164, high: 171, low: 163, close: 169, time: '5' },
  { open: 169, high: 170, low: 164, close: 165, time: '6' },
  { open: 165, high: 166, low: 158, close: 159, time: '7' },
  { open: 159, high: 163, low: 158, close: 162, time: '8' },
  { open: 162, high: 163, low: 155, close: 156, time: '9' },
  { open: 156, high: 157, low: 150, close: 151, time: '10' },
  { open: 151, high: 156, low: 150, close: 155, time: '11' },
  { open: 155, high: 156, low: 151, close: 152, time: '12' },
  { open: 152, high: 160, low: 151, close: 159, time: '13' },
  { open: 159, high: 168, low: 158, close: 167, time: '14' },
  { open: 167, high: 176, low: 166, close: 175, time: '15' },
  { open: 175, high: 189.45, low: 174, close: 187, time: '16' }, // High $189.45 (Peak)
  { open: 187, high: 188, low: 178, close: 179, time: '17' },
  { open: 179, high: 180, low: 170, close: 171, time: '18' },
  { open: 171, high: 172, low: 163, close: 164, time: '19' },
  { open: 164, high: 172, low: 163, close: 170, time: '20' },
  { open: 170, high: 171, low: 158, close: 159, time: '21' },
  { open: 159, high: 160, low: 148, close: 149, time: '22' },
  { open: 149, high: 150, low: 142.35, close: 143, time: '23' }, // Low $142.35 (Trough)
  { open: 143, high: 156, low: 142, close: 155, time: '24' },
  { open: 155, high: 167, low: 154, close: 166, time: '25' },
  { open: 166, high: 167, low: 158, close: 159, time: '26' },
  { open: 159, high: 165, low: 158, close: 164, time: '27' },
  { open: 164, high: 165, low: 153, close: 154, time: '28' },
  { open: 154, high: 155, low: 146, close: 147, time: '29' },
];

export default function MarketOverviewChart() {
  const [timeframe, setTimeframe] = useState<'1D' | '7D' | '1M'>('7D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const candles = mock7DCandles;

  // Chart bounds matching screenshot ratios
  const minPrice = 136;
  const maxPrice = 196;

  const svgWidth = 460;
  const svgHeight = 220;
  const paddingTop = 35;
  const paddingBottom = 30;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getY = (price: number) => {
    const ratio = (price - minPrice) / (maxPrice - minPrice);
    return svgHeight - paddingBottom - ratio * chartHeight;
  };

  const candleCount = candles.length;
  const step = svgWidth / (candleCount + 1);

  // Peak (index 15) and Trough (index 22)
  const highX = step * 16;
  const highY = getY(189.45);

  const lowX = step * 23;
  const lowY = getY(142.35);

  // Bottom teal sparkline points
  const bottomPoints = candles.map((c, i) => {
    const x = step * (i + 1);
    const y = svgHeight - 12 + Math.sin(i * 0.7) * 2;
    return { x, y };
  });

  return (
    <div className="bg-white border border-slate-100/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full min-h-[300px]">
      {/* Header & Timeframe Selector */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Market Overview
        </h3>

        <div className="relative">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="appearance-none bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-1.5 pr-7 rounded-lg border border-slate-200 cursor-pointer focus:outline-none shadow-2xs"
          >
            <option value="1D">1D</option>
            <option value="7D">7D</option>
            <option value="1M">1M</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* SVG Candlestick Chart */}
      <div className="relative w-full overflow-hidden flex-1 flex items-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Subtle Background Grid Lines */}
          {[140, 155, 170, 185].map((price) => (
            <line
              key={price}
              x1={0}
              y1={getY(price)}
              x2={svgWidth}
              y2={getY(price)}
              stroke="#f8fafc"
              strokeWidth={1}
            />
          ))}

          {/* High Annotation Text (High: $189.45 in green text) */}
          <text
            x={highX}
            y={highY - 10}
            textAnchor="middle"
            fill="#10b981"
            className="text-[11px] font-bold"
          >
            High: $189.45
          </text>

          {/* Low Annotation Text (Low: $142.35 in red text) */}
          <text
            x={lowX}
            y={lowY + 18}
            textAnchor="middle"
            fill="#ef4444"
            className="text-[11px] font-bold"
          >
            Low: $142.35
          </text>

          {/* Render Candlesticks */}
          {candles.map((candle, idx) => {
            const x = step * (idx + 1);
            const isBullish = candle.close >= candle.open;
            const color = isBullish ? '#10b981' : '#ef4444'; // Green or Red

            const highYPos = getY(candle.high);
            const lowYPos = getY(candle.low);
            const openYPos = getY(candle.open);
            const closeYPos = getY(candle.close);

            const bodyTop = Math.min(openYPos, closeYPos);
            const bodyHeight = Math.max(Math.abs(closeYPos - openYPos), 4);
            const candleWidth = 7;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Thin Wick line */}
                <line
                  x1={x}
                  y1={highYPos}
                  x2={x}
                  y2={lowYPos}
                  stroke={color}
                  strokeWidth={1.2}
                />
                {/* Rectangular Candle Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  rx={1}
                />
              </g>
            );
          })}

          {/* Bottom Teal Sparkline & Dots matching Screenshot */}
          <polyline
            fill="none"
            stroke="#0d9488"
            strokeWidth={1.2}
            points={bottomPoints.map((p) => `${p.x},${p.y}`).join(' ')}
            opacity={0.7}
          />
          {bottomPoints.map((p, idx) => (
            <circle
              key={`dot-${idx}`}
              cx={p.x}
              cy={p.y}
              r={2.2}
              fill="#0f766e"
            />
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && (
          <div className="absolute top-0 right-0 bg-slate-900 text-white px-2.5 py-1 rounded-md text-[10px] font-mono shadow-md z-10">
            <span>Price: ${candles[hoveredIndex].close.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
