import React from 'react';
import { Card } from './Card';

interface MiniStatCardProps {
  title: string;
  value: number | string;
  progressPercent: number;
  colorClass: 'bg-blue-600' | 'bg-red-600' | 'bg-slate-700';
  valColor?: string;
}

export const MiniStatCard: React.FC<MiniStatCardProps> = ({
  title,
  value,
  progressPercent,
  colorClass,
  valColor,
}) => {
  return (
    <Card className="p-5">
      <div className="text-xs font-semibold text-slate-500 mb-1">{title}</div>
      <div className="text-2xl font-bold font-['Outfit'] text-slate-900 mb-3" style={valColor ? { color: valColor } : {}}>
        {value}
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </Card>
  );
};
