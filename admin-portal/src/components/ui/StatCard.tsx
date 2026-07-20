import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';

interface StatCardProps {
  title: string;
  value: string;
  badgeText?: string;
  badgeType?: 'growth' | 'target' | 'priority';
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  isFeatured?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  badgeText,
  badgeType = 'growth',
  icon,
  iconBg = '#dbeafe',
  iconColor = '#1d4ed8',
  isFeatured = false,
}) => {
  return (
    <Card isFeatured={isFeatured} className="flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={isFeatured ? { backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white' } : { backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        {badgeText && <Badge variant={badgeType}>{badgeText}</Badge>}
      </div>
      <div>
        <div className={`text-xs font-medium ${isFeatured ? 'text-white/80' : 'text-slate-500'} mb-1`}>
          {title}
        </div>
        <div className={`text-3xl font-extrabold font-['Outfit'] ${isFeatured ? 'text-white' : 'text-slate-900'} leading-tight`}>
          {value}
        </div>
      </div>
    </Card>
  );
};
