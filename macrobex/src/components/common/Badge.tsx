import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'red' | 'amber' | 'blue' | 'purple' | 'slate' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60',
    red: 'bg-red-950/80 text-red-400 border border-red-800/60',
    amber: 'bg-amber-950/80 text-amber-300 border border-amber-800/60',
    blue: 'bg-blue-950/80 text-blue-400 border border-blue-800/60',
    purple: 'bg-purple-950/80 text-purple-300 border border-purple-800/60',
    slate: 'bg-slate-800 text-slate-300 border border-slate-700',
    gray: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-md font-medium',
    md: 'text-sm px-2.5 py-1 rounded-lg font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap leading-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
