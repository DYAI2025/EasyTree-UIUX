import React from 'react';
import { Employee } from '../../types';

interface AvatarProps {
  employee: Employee;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showRoleBadge?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  employee,
  size = 'md',
  showName = false,
  showRoleBadge = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  // Deterministic background color based on initials
  const getAvatarBg = (initials: string) => {
    const bgColors = [
      'bg-blue-900/80 text-blue-200 border-blue-700',
      'bg-emerald-900/80 text-emerald-200 border-emerald-700',
      'bg-amber-900/80 text-amber-200 border-amber-700',
      'bg-purple-900/80 text-purple-200 border-purple-700',
      'bg-teal-900/80 text-teal-200 border-teal-700',
      'bg-indigo-900/80 text-indigo-200 border-indigo-700',
    ];
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = initials.charCodeAt(i) + ((hash << 5) - hash);
    }
    return bgColors[Math.abs(hash) % bgColors.length];
  };

  const colorClass = getAvatarBg(employee.initials);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`relative inline-flex items-center justify-center rounded-full font-semibold border ${sizeClasses[size]} ${colorClass} shrink-0 select-none shadow-sm`}
        title={`${employee.firstName} ${employee.lastName} (${employee.role})`}
      >
        {employee.initials}
        {employee.isLeader && showRoleBadge && (
          <span
            className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 border border-neutral-900 rounded-full flex items-center justify-center text-[9px] text-neutral-950 font-bold"
            title="Teamleiter"
          >
            ★
          </span>
        )}
      </div>

      {showName && (
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-neutral-100 truncate">
            {employee.firstName} {employee.lastName}
          </span>
          <span className="text-[10px] text-neutral-400 truncate">
            {employee.role}
          </span>
        </div>
      )}
    </div>
  );
};
