import React from 'react';
import { WorksiteColorKey } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'critical'
    | 'info'
    | 'neutral'
    | 'outline'
    | 'worksite';
  colorKey?: WorksiteColorKey;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  colorKey,
  size = 'sm',
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] rounded',
    sm: 'px-2 py-0.5 text-xs rounded-md',
    md: 'px-2.5 py-1 text-xs rounded-md font-medium',
  };

  const variantClasses = {
    default: 'bg-neutral-800 text-neutral-200 border border-neutral-700',
    success: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-800',
    critical: 'bg-rose-950/80 text-rose-300 border border-rose-800',
    info: 'bg-sky-950/80 text-sky-300 border border-sky-800',
    neutral: 'bg-neutral-800/80 text-neutral-400 border border-neutral-700',
    outline: 'bg-transparent text-neutral-300 border border-neutral-600',
    worksite: '',
  };

  const worksiteBgMap: Record<WorksiteColorKey, string> = {
    'site-blue': 'bg-sky-950/90 text-sky-200 border-sky-700',
    'site-green': 'bg-emerald-950/90 text-emerald-200 border-emerald-700',
    'site-orange': 'bg-amber-950/90 text-amber-200 border-amber-700',
    'site-violet': 'bg-purple-950/90 text-purple-200 border-purple-700',
    'site-teal': 'bg-teal-950/90 text-teal-200 border-teal-700',
    'site-red': 'bg-rose-950/90 text-rose-200 border-rose-700',
    'site-yellow': 'bg-yellow-950/90 text-yellow-200 border-yellow-700',
    'site-slate': 'bg-slate-900/90 text-slate-200 border-slate-700',
  };

  const activeClass =
    variant === 'worksite' && colorKey
      ? worksiteBgMap[colorKey]
      : variantClasses[variant];

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 font-medium border ${sizeClasses[size]} ${activeClass} ${
        onClick ? 'cursor-pointer hover:opacity-90' : ''
      } ${className}`}
    >
      {children}
    </span>
  );
};
