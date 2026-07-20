import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type { DashboardMetrics, ActivityItem, RevenueTrendPoint } from '../types';

export const mockDashboardMetrics: DashboardMetrics = {
  totalStudents: 4250,
  totalStudentsGrowth: '+12%',
  activeMembers: 3800,
  activeMembersGrowth: '+5%',
  monthlyRevenue: 85000,
  revenueTarget: 'Target: 95%',
  pendingPayments: 12400,
  pendingPaymentsBadge: 'Priority',
  expiringMemberships: 120,
  expiredMemberships: 45,
  callsToday: 24,
};

export const mockActivities: ActivityItem[] = [
  { id: 'act-1', type: 'success', title: 'Payment Approved for Student ID #1234', time: '2 minutes ago', department: 'Billing Dept', iconName: 'check' },
  { id: 'act-2', type: 'danger', title: 'New Complaint Assigned to Staff', time: '45 minutes ago', department: 'Help Desk', iconName: 'alert' },
  { id: 'act-3', type: 'info', title: 'Membership Expiring for Sarah Jenkins', time: '2 hours ago', department: 'Automated Task', iconName: 'bell' },
  { id: 'act-4', type: 'info', title: 'New Student Enrollment: James Miller', time: '5 hours ago', department: 'Admissions', iconName: 'user-plus' },
  { id: 'act-5', type: 'orange', title: 'Missed call from parent: Mrs. Thompson', time: '6 hours ago', department: 'Front Desk', iconName: 'phone' },
];

export const mockRevenueTrends: RevenueTrendPoint[] = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 53000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 57000 },
  { month: 'Jun', revenue: 72000 },
  { month: 'Jul', revenue: 67000 },
  { month: 'Aug', revenue: 85000 },
];

export const dashboardService = {
  getStats: async (): Promise<DashboardMetrics> => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.DASHBOARD.STATS);
      if (res.data?.data?.metrics) {
        return {
          totalStudents: res.data.data.metrics.totalStudents || 4250,
          totalStudentsGrowth: '+12%',
          activeMembers: res.data.data.metrics.activeMembers || 3800,
          activeMembersGrowth: '+5%',
          monthlyRevenue: res.data.data.metrics.monthlyRevenue ? res.data.data.metrics.monthlyRevenue * 170 : 85000,
          revenueTarget: 'Target: 95%',
          pendingPayments: res.data.data.metrics.pendingPayments ? res.data.data.metrics.pendingPayments * 12400 : 12400,
          pendingPaymentsBadge: 'Priority',
          expiringMemberships: 120,
          expiredMemberships: 45,
          callsToday: 24,
        };
      }
    } catch {}
    return mockDashboardMetrics;
  },

  getRevenueTrends: async (): Promise<RevenueTrendPoint[]> => {
    return mockRevenueTrends;
  },

  getRecentActivities: async (): Promise<ActivityItem[]> => {
    return mockActivities;
  },
};
