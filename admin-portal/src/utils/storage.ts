const TOKEN_KEY = 'academix_access_token';
const USER_KEY = 'academix_user_profile';

export const storage = {
  getToken: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
  },
  removeToken: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  },
  getUser: <T>(): T | null => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: <T>(user: T): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {}
  },
  removeUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {}
  },
  clearAll: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  },
};
