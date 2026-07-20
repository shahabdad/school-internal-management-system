export const API_BASE_URL = 'http://localhost:5000/api/v1';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    VERIFY_2FA: '/auth/verify-2fa',
    CHECK_DEVICE: '/auth/check-device-approval',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
  },
  STUDENTS: {
    BASE: '/students',
    BY_ID: (id: string) => `/students/${id}`,
  },
  PAYMENTS: {
    BASE: '/payments',
    UPLOAD_PROOF: '/payments/upload-proof',
    APPROVE: (id: string) => `/payments/${id}/approve`,
    REJECT: (id: string) => `/payments/${id}/reject`,
  },
  MEMBERSHIPS: {
    BASE: '/memberships',
    PLANS: '/membership-plans',
  },
  COMPLAINTS: {
    BASE: '/complaints',
  },
  CALL_LOGS: {
    BASE: '/call-logs',
  },
  REPORTS: {
    BASE: '/reports',
    GENERATE: '/reports/generate',
  },
  USERS: {
    BASE: '/users',
  },
  AUDIT_LOGS: {
    BASE: '/audit-logs',
  },
} as const;
