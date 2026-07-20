export type StudentStatus = 'Active' | 'Expiring' | 'Expired' | 'Inactive';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  membership: string;
  status: StudentStatus;
  enrolledDate: string;
}
