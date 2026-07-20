import { create } from 'zustand';

interface UIState {
  searchQuery: string;
  isReportModalOpen: boolean;
  activeTabKey: string;

  // Actions
  setSearchQuery: (query: string) => void;
  setReportModalOpen: (open: boolean) => void;
  setActiveTabKey: (key: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  searchQuery: '',
  isReportModalOpen: false,
  activeTabKey: 'dashboard',

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setReportModalOpen: (open: boolean) => set({ isReportModalOpen: open }),
  setActiveTabKey: (key: string) => set({ activeTabKey: key }),
}));
