export * from './auth.types';
export * from './dashboard.types';
export * from './student.types';
export * from './payment.types';

export type TabType = 
  | 'dashboard'
  | 'students'
  | 'payments'
  | 'memberships'
  | 'call-logs'
  | 'complaints'
  | 'reports'
  | 'users'
  | 'roles'
  | 'audit-logs'
  | 'settings';

export interface Complaint {
  id: string;
  studentName: string;
  title: string;
  description: string;
  assignedStaff: string;
  status: 'Created' | 'Assigned' | 'UnderReview' | 'Solved' | 'Closed';
  date: string;
}

export interface CallLog {
  id: string;
  agentName: string;
  studentName: string;
  durationSeconds: number;
  result: 'No Answer' | 'Interested' | 'Follow-up' | 'Joined' | 'Upgraded';
  date: string;
  notes: string;
}

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'Student' | 'CustomerService' | 'OperationsManager' | 'Admin' | 'CEO';
  active: boolean;
  lastLogin: string;
}

export interface AuditLog {
  id: string;
  userEmail: string;
  action: string;
  module: string;
  ipAddress: string;
  timestamp: string;
  details: string;
}
