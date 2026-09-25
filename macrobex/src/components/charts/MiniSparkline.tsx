import React from 'react';
import { PricePoint } from '../../types';

interface MiniSparklineProps {
  data: PricePoint[];
  isPositive: boolean;
  width?: number;
  height?: number;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  isPositive,
  width = 120,
  height = 36,
}) => {
  if (!data || data.length < 2) {
    return <div className="w-[120px] h-[36px] bg-slate-800/40 rounded animate-pulse" />;
  }

  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.price - min) / range) * (height - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = isPositive ? '#10b981' : '#ef4444';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
  const id = `sparkline-grad-${Math.random().toString(36).substring(2, 8)}`;

  // Area path
  const firstPoint = points.split(' ')[0];
  const lastPoint = points.split(' ')[points.split(' ').length - 1];
  const lastX = lastPoint.split(',')[0];
  const areaD = `M ${firstPoint} L ${points.split(' ').join(' L ')} L ${lastX},${height} L 0,${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${id})`} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
