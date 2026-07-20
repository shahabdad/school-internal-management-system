import React from 'react';
import { Check, AlertCircle, Bell, UserPlus, PhoneCall } from 'lucide-react';
import type { ActivityItem } from '../types';

interface RecentActivityProps {
  activities: ActivityItem[];
  onViewAll?: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities, onViewAll }) => {
  const getIcon = (iconName: ActivityItem['iconName']) => {
    switch (iconName) {
      case 'check':
        return <Check size={18} />;
      case 'alert':
        return <AlertCircle size={18} />;
      case 'bell':
        return <Bell size={18} />;
      case 'user-plus':
        return <UserPlus size={18} />;
      case 'phone':
        return <PhoneCall size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  const getCircleClass = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return 'icon-circle-success';
      case 'danger':
        return 'icon-circle-danger';
      case 'info':
        return 'icon-circle-info';
      case 'orange':
        return 'icon-circle-orange';
      default:
        return 'icon-circle-indigo';
    }
  };

  return (
    <div className="card" style={{ flex: 1 }}>
      <div className="card-header">
        <div className="card-title">Recent Activity</div>
        <button
          type="button"
          onClick={onViewAll}
          style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1d4ed8' }}
        >
          View All
        </button>
      </div>

      <div className="activity-list">
        {activities.map((item) => (
          <div className="activity-item" key={item.id}>
            <div className={`activity-icon-circle ${getCircleClass(item.type)}`}>
              {getIcon(item.iconName)}
            </div>
            <div className="activity-content">
              <div className="activity-title">{item.title}</div>
              <div className="activity-subtext">
                {item.time} • {item.department}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
