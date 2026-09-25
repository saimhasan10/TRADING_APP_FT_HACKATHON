import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actionButton?: React.ReactNode;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  change,
  isPositive,
  icon,
  badge,
  actionButton,
  className = '',
}) => {
  return (
    <div
      className={`bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden transition-all hover:border-slate-700/80 ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1.5">
          {badge}
          {icon && <div className="text-slate-400 p-1 rounded-lg bg-slate-800/60">{icon}</div>}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {change && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
              isPositive ? 'text-emerald-400 bg-emerald-950/60' : 'text-red-400 bg-red-950/60'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {(subValue || actionButton) && (
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
          {subValue && <span className="text-slate-400 leading-snug">{subValue}</span>}
          {actionButton}
        </div>
      )}
    </div>
  );
};
