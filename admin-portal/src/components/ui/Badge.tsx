import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  variant?: 'active' | 'expiring' | 'expired' | 'pending' | 'approved' | 'priority' | 'growth' | 'target';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'active', children, className }) => {
  const variantStyles = {
    active: 'bg-emerald-100 text-emerald-800 font-semibold',
    approved: 'bg-emerald-100 text-emerald-800 font-semibold',
    growth: 'bg-emerald-100 text-emerald-800 font-semibold',
    expiring: 'bg-amber-100 text-amber-800 font-semibold',
    pending: 'bg-indigo-100 text-indigo-800 font-semibold',
    target: 'bg-white/20 text-white font-semibold',
    expired: 'bg-red-100 text-red-800 font-semibold',
    priority: 'bg-red-100 text-red-800 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
