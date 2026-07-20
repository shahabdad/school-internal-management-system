import React from 'react';
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
import type { TabType } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();

  const mainNavItems: { tab: TabType; label: string; icon: React.ReactNode }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { tab: 'students', label: 'Students', icon: <Users size={18} /> },
    { tab: 'payments', label: 'Payments', icon: <CreditCard size={18} /> },
    { tab: 'memberships', label: 'Memberships', icon: <IdCard size={18} /> },
    { tab: 'call-logs', label: 'Call Logs', icon: <PhoneCall size={18} /> },
    { tab: 'complaints', label: 'Complaints', icon: <AlertTriangle size={18} /> },
    { tab: 'reports', label: 'Reports', icon: <BarChart3 size={18} /> },
    { tab: 'users', label: 'Users', icon: <UserCheck size={18} /> },
    { tab: 'roles', label: 'Roles', icon: <ShieldCheck size={18} /> },
    { tab: 'audit-logs', label: 'Audit Logs', icon: <History size={18} /> },
    { tab: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

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
            {mainNavItems.map((item) => (
              <li key={item.tab}>
                <button
                  type="button"
                  className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.tab)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div>
        <div className="sidebar-divider" />
        <div className="sidebar-bottom">
          <button
            type="button"
            className="nav-item"
            onClick={() => alert('Academix Pro Support center is active. Live chat available 24/7.')}
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
