import React from 'react';

interface MiniStatCardProps {
  title: string;
  value: number | string;
  progressPercent: number;
  colorClass: 'progress-blue' | 'progress-red' | 'progress-dark';
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
    <div className="mini-stat-card">
      <div className="mini-stat-title">{title}</div>
      <div className="mini-stat-value" style={valColor ? { color: valColor } : {}}>
        {value}
      </div>
      <div className="progress-track">
        <div
          className={`progress-bar ${colorClass}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};
