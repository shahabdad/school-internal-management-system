import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
  });
}

export function useRevenueTrends() {
  return useQuery({
    queryKey: ['dashboard', 'revenue-trends'],
    queryFn: () => dashboardService.getRevenueTrends(),
  });
}

export function useRecentActivities() {
  return useQuery({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: () => dashboardService.getRecentActivities(),
  });
}
