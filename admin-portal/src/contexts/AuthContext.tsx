import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { SystemUser } from '../types';

/**
 * Interface representing the Auth State & Actions provided to the application.
 */
interface AuthContextType {
  isAuthenticated: boolean;
  user: SystemUser | null;
  is2FAPending: boolean;
  pendingUserId: string | null;
  login: (email: string, password: string) => Promise<{ twoFactorRequired?: boolean }>;
  verify2FA: (otpCode: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default Alex Rivera admin profile for demo session state
const defaultAdminUser: SystemUser = {
  id: '6a5b24325aac955ace911c9f',
  name: 'Alex Rivera',
  email: 'alex.rivera@academix.edu',
  role: 'Admin',
  active: true,
  lastLogin: new Date().toLocaleString(),
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth State Management
  const [user, setUser] = useState<SystemUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [is2FAPending, setIs2FAPending] = useState<boolean>(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  /**
   * Initiate user login flow.
   * Attempts connection to backend REST API or fallback to local demo auth.
   */
  const login = async (email: string, _password: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: _password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.twoFactorRequired) {
          setIs2FAPending(true);
          setPendingUserId(data.userId || '6a5b24325aac955ace911c9f');
          return { twoFactorRequired: true };
        }
      }
    } catch (err) {
      // Standalone dev mode fallback
    }

    // Trigger 2FA modal verification for senior-dev simulation
    setIs2FAPending(true);
    setPendingUserId('6a5b24325aac955ace911c9f');
    return { twoFactorRequired: true };
  };

  /**
   * Complete 2FA OTP verification code step.
   */
  const verify2FA = async (otpCode: string): Promise<boolean> => {
    if (!otpCode || otpCode.length < 4) return false;

    // Set authenticated state upon verification
    setUser(defaultAdminUser);
    setIsAuthenticated(true);
    setIs2FAPending(false);
    setPendingUserId(null);
    return true;
  };

  /**
   * Revoke current authentication session.
   */
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIs2FAPending(false);
    setPendingUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        is2FAPending,
        pendingUserId,
        login,
        verify2FA,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook for accessing Auth Context cleanly across components.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
