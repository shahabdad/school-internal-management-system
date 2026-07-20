export type UserRole = 'Student' | 'CustomerService' | 'OperationsManager' | 'Admin' | 'CEO';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastLogin?: string;
}

export interface LoginResponse {
  status: string;
  twoFactorRequired?: boolean;
  deviceApprovalRequired?: boolean;
  userId?: string;
  email?: string;
  accessToken?: string;
  data?: {
    user: UserProfile;
  };
}

export interface Verify2FAResponse {
  status: string;
  accessToken?: string;
  deviceApprovalRequired?: boolean;
  data?: {
    user: UserProfile;
  };
}
