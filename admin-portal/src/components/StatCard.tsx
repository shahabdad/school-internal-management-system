import React from 'react';

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
    <div className={`stat-card ${isFeatured ? 'featured-blue' : ''}`}>
      <div className="stat-card-header">
        <div
          className="stat-icon-wrapper"
          style={isFeatured ? {} : { backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        {badgeText && (
          <span
            className={
              badgeType === 'target'
                ? 'badge-target'
                : badgeType === 'priority'
                ? 'badge-priority'
                : 'badge-growth'
            }
          >
            {badgeText}
          </span>
        )}
      </div>
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
};
