import { create } from 'zustand';
import type { UserProfile } from '../types/auth.types';
import { storage } from '../utils/storage';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  is2FAPending: boolean;
  pendingUserId: string | null;

  // Actions
  setAuth: (user: UserProfile, token: string) => void;
  set2FAPending: (userId: string) => void;
  clear2FA: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storage.getUser<UserProfile>(),
  token: storage.getToken(),
  isAuthenticated: Boolean(storage.getToken() || storage.getUser()),
  is2FAPending: false,
  pendingUserId: null,

  setAuth: (user: UserProfile, token: string) => {
    storage.setUser(user);
    storage.setToken(token);
    set({
      user,
      token,
      isAuthenticated: true,
      is2FAPending: false,
      pendingUserId: null,
    });
  },

  set2FAPending: (userId: string) => {
    set({
      is2FAPending: true,
      pendingUserId: userId,
    });
  },

  clear2FA: () => {
    set({
      is2FAPending: false,
      pendingUserId: null,
    });
  },

  logout: () => {
    storage.clearAll();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      is2FAPending: false,
      pendingUserId: null,
    });
  },
}));
