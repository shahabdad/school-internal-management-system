export interface DashboardMetrics {
  totalStudents: number;
  totalStudentsGrowth: string;
  activeMembers: number;
  activeMembersGrowth: string;
  monthlyRevenue: number;
  revenueTarget: string;
  pendingPayments: number;
  pendingPaymentsBadge: string;
  expiringMemberships: number;
  expiredMemberships: number;
  callsToday: number;
}

export interface ActivityItem {
  id: string;
  type: 'success' | 'danger' | 'warning' | 'info' | 'orange';
  title: string;
  time: string;
  department: string;
  iconName: 'check' | 'alert' | 'bell' | 'user-plus' | 'phone';
}

export interface RevenueTrendPoint {
  month: string;
  revenue: number;
}
