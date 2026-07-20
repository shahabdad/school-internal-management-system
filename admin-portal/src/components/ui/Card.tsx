import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  isFeatured?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, isFeatured }) => {
  return (
    <div
      className={cn(
        'bg-white border border-slate-200 rounded-2xl p-6 shadow-xs transition-all',
        isFeatured && 'bg-gradiant-to-brom-blue-700 to-blue-900 border-blue-700 text-white shadow-md',
        className
      )}
    >
      {children}
    </div>
  );
};
