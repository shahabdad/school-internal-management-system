import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  IdCard,
  PhoneCall,
  AlertTriangle,
  BarChart3,
  UserCheck,
  ShieldCheck,
  History,
  Settings,
  HelpCircle,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { MAIN_NAV_ITEMS } from '../constants/navigation';
import { useAuth } from '../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard size={18} />;
      case 'Users': return <Users size={18} />;
      case 'CreditCard': return <CreditCard size={18} />;
      case 'IdCard': return <IdCard size={18} />;
      case 'PhoneCall': return <PhoneCall size={18} />;
      case 'AlertTriangle': return <AlertTriangle size={18} />;
      case 'BarChart3': return <BarChart3 size={18} />;
      case 'UserCheck': return <UserCheck size={18} />;
      case 'ShieldCheck': return <ShieldCheck size={18} />;
      case 'History': return <History size={18} />;
      case 'Settings': return <Settings size={18} />;
      default: return <LayoutDashboard size={18} />;
    }
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-section">
          <div className="brand-logo">
            <GraduationCap size={26} color="#1d4ed8" />
            <div>
              <div style={{ lineHeight: 1.1 }}>Academix Pro</div>
              <div className="brand-subtext">School Management</div>
            </div>
          </div>
        </div>

        <nav>
          <ul className="nav-list">
            {MAIN_NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.key}>
                  <Link
                    to={item.path}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    {getIcon(item.iconName)}
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div>
        <div className="sidebar-divider" />
        <div className="sidebar-bottom">
          <button
            type="button"
            className="nav-item"
            onClick={() => alert('Academix Pro Support center is active 24/7.')}
          >
            <HelpCircle size={18} />
            <span>Support</span>
          </button>
          <button
            type="button"
            className="nav-item"
            onClick={() => {
              if (confirm('Are you sure you want to log out of Academix Pro?')) {
                logout();
              }
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
