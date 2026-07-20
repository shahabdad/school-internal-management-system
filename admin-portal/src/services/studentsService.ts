import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type { Student } from '../types';

export const mockStudents: Student[] = [
  { id: '1234', name: 'Alex Rivera', email: 'alex.rivera@academix.edu', phone: '+1 (555) 234-5678', address: '123 University Ave', membership: 'VIP Pass', status: 'Active', enrolledDate: '2024-01-15' },
  { id: '1235', name: 'Sarah Jenkins', email: 'sarah.j@academix.edu', phone: '+1 (555) 876-5432', address: '456 College St', membership: 'Basic Plan', status: 'Expiring', enrolledDate: '2024-02-10' },
  { id: '1236', name: 'James Miller', email: 'j.miller@academix.edu', phone: '+1 (555) 345-6789', address: '789 Academy Blvd', membership: 'Premium Pro', status: 'Active', enrolledDate: '2024-03-01' },
  { id: '1237', name: 'Emily Davis', email: 'emily.d@academix.edu', phone: '+1 (555) 987-6543', address: '321 Campus Way', membership: 'Standard Tier', status: 'Expired', enrolledDate: '2023-11-20' },
  { id: '1238', name: 'Michael Brown', email: 'm.brown@academix.edu', phone: '+1 (555) 654-3210', address: '654 Scholar Lane', membership: 'VIP Pass', status: 'Active', enrolledDate: '2024-04-05' },
];

export const studentsService = {
  getAll: async (): Promise<Student[]> => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.STUDENTS.BASE);
      if (res.data?.data?.students) {
        return res.data.data.students;
      }
    } catch {}
    return mockStudents;
  },

  create: async (studentData: Partial<Student>): Promise<Student> => {
    try {
      const res = await apiClient.post(API_ENDPOINTS.STUDENTS.BASE, studentData);
      if (res.data?.data?.student) return res.data.data.student;
    } catch {}
    return {
      id: (1239 + Math.floor(Math.random() * 1000)).toString(),
      name: studentData.name || 'New Student',
      email: studentData.email || 'student@academix.edu',
      phone: studentData.phone || '+1 (555) 000-0000',
      address: studentData.address || 'Campus Quad',
      membership: studentData.membership || 'Basic Plan',
      status: 'Active',
      enrolledDate: new Date().toISOString().split('T')[0],
    };
  },
};
