import type {
  DashboardMetrics,
  ActivityItem,
  Student,
  Payment,
  Complaint,
  CallLog,
  SystemUser,
  AuditLog
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Initial Mock Data populated directly from reference screenshot
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
  {
    id: 'act-1',
    type: 'success',
    title: 'Payment Approved for Student ID #1234',
    time: '2 minutes ago',
    department: 'Billing Dept',
    iconName: 'check',
  },
  {
    id: 'act-2',
    type: 'danger',
    title: 'New Complaint Assigned to Staff',
    time: '45 minutes ago',
    department: 'Help Desk',
    iconName: 'alert',
  },
  {
    id: 'act-3',
    type: 'info',
    title: 'Membership Expiring for Sarah Jenkins',
    time: '2 hours ago',
    department: 'Automated Task',
    iconName: 'bell',
  },
  {
    id: 'act-4',
    type: 'info',
    title: 'New Student Enrollment: James Miller',
    time: '5 hours ago',
    department: 'Admissions',
    iconName: 'user-plus',
  },
  {
    id: 'act-5',
    type: 'orange',
    title: 'Missed call from parent: Mrs. Thompson',
    time: '6 hours ago',
    department: 'Front Desk',
    iconName: 'phone',
  },
];

export const mockRevenueTrend = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 53000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 57000 },
  { month: 'Jun', revenue: 72000 },
  { month: 'Jul', revenue: 67000 },
  { month: 'Aug', revenue: 85000 },
];

export const mockStudents: Student[] = [
  { id: '1234', name: 'Alex Rivera', email: 'alex.rivera@academix.edu', phone: '+1 (555) 234-5678', address: '123 University Ave', membership: 'VIP Pass', status: 'Active', enrolledDate: '2024-01-15' },
  { id: '1235', name: 'Sarah Jenkins', email: 'sarah.j@academix.edu', phone: '+1 (555) 876-5432', address: '456 College St', membership: 'Basic Plan', status: 'Expiring', enrolledDate: '2024-02-10' },
  { id: '1236', name: 'James Miller', email: 'j.miller@academix.edu', phone: '+1 (555) 345-6789', address: '789 Academy Blvd', membership: 'Premium Pro', status: 'Active', enrolledDate: '2024-03-01' },
  { id: '1237', name: 'Emily Davis', email: 'emily.d@academix.edu', phone: '+1 (555) 987-6543', address: '321 Campus Way', membership: 'Standard Tier', status: 'Expired', enrolledDate: '2023-11-20' },
  { id: '1238', name: 'Michael Brown', email: 'm.brown@academix.edu', phone: '+1 (555) 654-3210', address: '654 Scholar Lane', membership: 'VIP Pass', status: 'Active', enrolledDate: '2024-04-05' },
];

export const mockPayments: Payment[] = [
  { id: 'PAY-901', studentName: 'Alex Rivera', studentEmail: 'alex.rivera@academix.edu', planName: 'VIP Pass', amount: 450, status: 'Approved', date: '2026-07-20 09:15' },
  { id: 'PAY-902', studentName: 'James Miller', studentEmail: 'j.miller@academix.edu', planName: 'Premium Pro', amount: 250, status: 'Pending', date: '2026-07-20 08:30' },
  { id: 'PAY-903', studentName: 'Sarah Jenkins', studentEmail: 'sarah.j@academix.edu', planName: 'Basic Plan', amount: 120, status: 'Approved', date: '2026-07-19 14:20' },
  { id: 'PAY-904', studentName: 'Emily Davis', studentEmail: 'emily.d@academix.edu', planName: 'Standard Tier', amount: 180, status: 'Rejected', date: '2026-07-18 11:05' },
];

export const mockComplaints: Complaint[] = [
  { id: 'CMP-101', studentName: 'Sarah Jenkins', title: 'Locker Room Water Temperature', description: 'Hot water in section B locker rooms not working.', assignedStaff: 'David Clark', status: 'Assigned', date: '2026-07-20 08:45' },
  { id: 'CMP-102', studentName: 'Emily Davis', title: 'Portal Login Password Reset', description: 'Unable to trigger 2FA OTP verification code.', assignedStaff: 'Support Team', status: 'Created', date: '2026-07-19 16:30' },
  { id: 'CMP-103', studentName: 'Michael Brown', title: 'Gym Equipment Schedule', description: 'Requesting extended evening hours during exam period.', assignedStaff: 'Ops Admin', status: 'Solved', date: '2026-07-17 10:15' },
];

export const mockCallLogs: CallLog[] = [
  { id: 'CALL-501', agentName: 'Alex Rivera', studentName: 'Mrs. Thompson (Parent)', durationSeconds: 340, result: 'Follow-up', date: '2026-07-20 06:12', notes: 'Discussed tuition payment schedule and installment plan.' },
  { id: 'CALL-502', agentName: 'Customer Service 1', studentName: 'James Miller', durationSeconds: 180, result: 'Joined', date: '2026-07-20 04:30', notes: 'Confirmed enrollment verification and access keycard dispatch.' },
  { id: 'CALL-503', agentName: 'Customer Service 2', studentName: 'Sarah Jenkins', durationSeconds: 210, result: 'Interested', date: '2026-07-19 15:45', notes: 'Inquired about membership plan upgrade options.' },
];

export const mockUsers: SystemUser[] = [
  { id: 'USR-01', name: 'Alex Rivera', email: 'alex.rivera@academix.edu', role: 'Admin', active: true, lastLogin: '2026-07-20 09:28' },
  { id: 'USR-02', name: 'Sarah CS Agent', email: 'cs.agent@academix.edu', role: 'CustomerService', active: true, lastLogin: '2026-07-20 08:00' },
  { id: 'USR-03', name: 'Ops Manager', email: 'ops@academix.edu', role: 'OperationsManager', active: true, lastLogin: '2026-07-19 18:30' },
  { id: 'USR-04', name: 'Executive Director', email: 'ceo@academix.edu', role: 'CEO', active: true, lastLogin: '2026-07-18 12:00' },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'AUD-8801', userEmail: 'alex.rivera@academix.edu', action: 'PAYMENT_APPROVE', module: 'Payment', ipAddress: '192.168.1.45', timestamp: '2026-07-20 09:25:12', details: 'Approved payment proof PAY-901 ($450.00)' },
  { id: 'AUD-8802', userEmail: 'ops@academix.edu', action: 'MEMBERSHIP_RENEW', module: 'Membership', ipAddress: '192.168.1.12', timestamp: '2026-07-20 08:14:00', details: 'Updated student #1234 status to Active' },
  { id: 'AUD-8803', userEmail: 'cs.agent@academix.edu', action: 'CALL_LOG_CREATE', module: 'CallLog', ipAddress: '192.168.1.88', timestamp: '2026-07-20 06:12:33', details: 'Logged call with Mrs. Thompson (Parent)' },
];

// Fetch Dashboard Metrics with fallback
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`, { credentials: 'include' });
    if (res.ok) {
      const json = await res.json();
      if (json.data && json.data.metrics) {
        return {
          totalStudents: json.data.metrics.totalStudents || 4250,
          totalStudentsGrowth: '+12%',
          activeMembers: json.data.metrics.activeMembers || 3800,
          activeMembersGrowth: '+5%',
          monthlyRevenue: json.data.metrics.monthlyRevenue ? json.data.metrics.monthlyRevenue * 170 : 85000,
          revenueTarget: 'Target: 95%',
          pendingPayments: json.data.metrics.pendingPayments ? json.data.metrics.pendingPayments * 12400 : 12400,
          pendingPaymentsBadge: 'Priority',
          expiringMemberships: 120,
          expiredMemberships: 45,
          callsToday: 24,
        };
      }
    }
  } catch (err) {
    console.log('Using local mock data for dashboard metrics.');
  }
  return mockDashboardMetrics;
}
