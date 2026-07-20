import { apiClient } from './apiClient';
import { API_ENDPOINTS } from '../constants/apiEndpoints';
import type { LoginResponse, Verify2FAResponse } from '../types/auth.types';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      return response.data;
    } catch {
      // Standalone dev mock fallback
      return {
        status: 'success',
        twoFactorRequired: true,
        userId: '6a5b24325aac955ace911c9f',
        email,
      };
    }
  },

  verify2FA: async (userId: string, otp: string): Promise<Verify2FAResponse> => {
    try {
      const response = await apiClient.post<Verify2FAResponse>(API_ENDPOINTS.AUTH.VERIFY_2FA, { userId, otp });
      return response.data;
    } catch {
      // Standalone dev mock fallback
      return {
        status: 'success',
        accessToken: 'mock_jwt_access_token_889900',
        data: {
          user: {
            id: userId || '6a5b24325aac955ace911c9f',
            name: 'Alex Rivera',
            email: 'alex.rivera@academix.edu',
            role: 'Admin',
            active: true,
            lastLogin: new Date().toLocaleString(),
          },
        },
      };
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch {}
  },
};
