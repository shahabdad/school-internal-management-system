import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Settings } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, setSearchQuery }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="top-header">
      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search school records..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="header-right">
        <button
          type="button"
          className="icon-btn"
          title="Notifications"
          onClick={() => setNotificationsOpen(!notificationsOpen)}
        >
          <Bell size={20} />
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '2px solid white'
          }} />
        </button>

        <button
          type="button"
          className="icon-btn"
          title="Help & Documentation"
          onClick={() => alert('Academix Pro Documentation Center: All guides up to date.')}
        >
          <HelpCircle size={20} />
        </button>

        <button
          type="button"
          className="icon-btn"
          title="System Settings"
          onClick={() => alert('Quick Settings menu opened.')}
        >
          <Settings size={20} />
        </button>

        <div className="header-divider" />

        <div className="user-profile" onClick={() => alert('Alex Rivera profile selected.')}>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
            alt="Alex Rivera"
            className="user-avatar"
          />
          <div className="user-info">
            <span className="user-name">Alex Rivera</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};
