import { ROUTES } from './routes';

export interface NavItemConfig {
  key: string;
  label: string;
  path: string;
  iconName: 'LayoutDashboard' | 'Users' | 'CreditCard' | 'IdCard' | 'PhoneCall' | 'AlertTriangle' | 'BarChart3' | 'UserCheck' | 'ShieldCheck' | 'History' | 'Settings';
}

export const MAIN_NAV_ITEMS: NavItemConfig[] = [
  { key: 'dashboard', label: 'Dashboard', path: ROUTES.DASHBOARD, iconName: 'LayoutDashboard' },
  { key: 'students', label: 'Students', path: ROUTES.STUDENTS, iconName: 'Users' },
  { key: 'payments', label: 'Payments', path: ROUTES.PAYMENTS, iconName: 'CreditCard' },
  { key: 'memberships', label: 'Memberships', path: ROUTES.MEMBERSHIPS, iconName: 'IdCard' },
  { key: 'call-logs', label: 'Call Logs', path: ROUTES.CALL_LOGS, iconName: 'PhoneCall' },
  { key: 'complaints', label: 'Complaints', path: ROUTES.COMPLAINTS, iconName: 'AlertTriangle' },
  { key: 'reports', label: 'Reports', path: ROUTES.REPORTS, iconName: 'BarChart3' },
  { key: 'users', label: 'Users', path: ROUTES.USERS, iconName: 'UserCheck' },
  { key: 'roles', label: 'Roles', path: ROUTES.ROLES, iconName: 'ShieldCheck' },
  { key: 'audit-logs', label: 'Audit Logs', path: ROUTES.AUDIT_LOGS, iconName: 'History' },
  { key: 'settings', label: 'Settings', path: ROUTES.SETTINGS, iconName: 'Settings' },
];
