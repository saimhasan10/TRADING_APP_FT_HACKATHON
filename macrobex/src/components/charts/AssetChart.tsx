import React, { useState } from 'react';
import { PricePoint } from '../../types';

interface AssetChartProps {
  data: PricePoint[];
  symbol: string;
  isPositive: boolean;
  currentPrice: number;
}

export const AssetChart: React.FC<AssetChartProps> = ({
  data,
  symbol,
  isPositive,
  currentPrice,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-500 text-sm">
        Awaiting live price ticks...
      </div>
    );
  }

  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const width = 600;
  const height = 240;
  const padY = 24;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padY - ((d.price - min) / range) * (height - padY * 2);
    return { x, y, price: d.price, time: d.time };
  });

  const polyPoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const strokeColor = isPositive ? '#10b981' : '#ef4444';
  const gradId = `asset-grad-${symbol.replace(/[^a-zA-Z0-9]/g, '')}`;

  const areaD = `M ${points[0].x},${points[0].y} L ${polyPoints.split(' ').join(' L ')} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="relative w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-4 select-none">
      {/* Chart Header details */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <div className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            {symbol} Synthetic Price Feed
          </div>
          <div className="text-2xl font-bold text-white tracking-tight mt-0.5">
            ${activePoint.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </div>
        </div>
        <div className="text-right text-xs text-slate-400">
          <div>Time: <span className="text-slate-200 font-mono">{activePoint.time}</span></div>
          <div className="text-[11px] text-slate-500">24h High: ${max.toFixed(2)} | Low: ${min.toFixed(2)}</div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = (e.clientX - rect.left) / rect.width;
            const index = Math.min(
              data.length - 1,
              Math.max(0, Math.round(relX * (data.length - 1)))
            );
            setHoverIndex(index);
          }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={padY} x2={width} y2={padY} stroke="#334155" strokeWidth="0.75" strokeDasharray="4 4" />
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#334155" strokeWidth="0.75" strokeDasharray="4 4" />
          <line x1="0" y1={height - padY} x2={width} y2={height - padY} stroke="#334155" strokeWidth="0.75" strokeDasharray="4 4" />

          {/* Area fill */}
          <path d={areaD} fill={`url(#${gradId})`} />

          {/* Price Line */}
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polyPoints}
          />

          {/* Hover Crosshair */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={0}
                x2={activePoint.x}
                y2={height}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill="#ffffff"
                stroke={strokeColor}
                strokeWidth="2.5"
              />
            </g>
          )}
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-800/80">
        <span>Historical 20 Ticks</span>
        <span className="text-emerald-400 font-medium">Realtime Simulation Interval: ~2.5s</span>
        <span>Latest: {data[data.length - 1]?.time}</span>
      </div>
    </div>
  );
};
