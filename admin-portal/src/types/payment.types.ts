export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Payment {
  id: string;
  studentName: string;
  studentEmail: string;
  planName: string;
  amount: number;
  status: PaymentStatus;
  date: string;
  proofUrl?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  active: boolean;
  features: string[];
}
