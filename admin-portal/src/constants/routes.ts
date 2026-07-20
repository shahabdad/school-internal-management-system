export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  STUDENTS: '/students',
  PAYMENTS: '/payments',
  MEMBERSHIPS: '/memberships',
  CALL_LOGS: '/call-logs',
  COMPLAINTS: '/complaints',
  REPORTS: '/reports',
  USERS: '/users',
  ROLES: '/roles',
  AUDIT_LOGS: '/audit-logs',
  SETTINGS: '/settings',
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
