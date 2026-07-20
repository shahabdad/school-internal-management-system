import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';

export function useAuth() {
  const { user, token, isAuthenticated, is2FAPending, pendingUserId, setAuth, set2FAPending, clear2FA, logout } = useAuthStore();

  const login = async (email: string, password: string) => {
    const res = await authService.login(email, password);
    if (res.twoFactorRequired) {
      set2FAPending(res.userId || '6a5b24325aac955ace911c9f');
      return { twoFactorRequired: true };
    }
    if (res.accessToken && res.data?.user) {
      setAuth(res.data.user, res.accessToken);
    }
    return res;
  };

  const verify2FA = async (otp: string) => {
    const userId = pendingUserId || '6a5b24325aac955ace911c9f';
    const res = await authService.verify2FA(userId, otp);
    if (res.accessToken && res.data?.user) {
      setAuth(res.data.user, res.accessToken);
      return true;
    }
    return false;
  };

  return {
    user,
    token,
    isAuthenticated,
    is2FAPending,
    pendingUserId,
    login,
    verify2FA,
    logout: () => {
      authService.logout();
      logout();
    },
    cancel2FA: clear2FA,
  };
}
