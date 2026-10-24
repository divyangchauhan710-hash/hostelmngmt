import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api, setToken, removeToken, getToken } from '../services/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    hostelBlock?: string;
    roomNumber?: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  switchDemoAccount: (role: UserRole) => Promise<void>;
}

const DEMO_ACCOUNTS: Record<UserRole, { email: string; pass: string }> = {
  student: { email: 'student@hostelhub.local', pass: 'Student@123' },
  rector: { email: 'rector@hostelhub.local', pass: 'Rector@123' },
  housekeeping: { email: 'housekeeping@hostelhub.local', pass: 'Staff@123' },
  mess_staff: { email: 'mess@hostelhub.local', pass: 'Staff@123' },
  canteen_staff: { email: 'canteen@hostelhub.local', pass: 'Staff@123' },
  admin: { email: 'admin@hostelhub.local', pass: 'Admin@123' },
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth on load
  useEffect(() => {
    async function initAuth() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get<{ success: boolean; user: User }>('/auth/me');
        if (res.user) {
          setUser(res.user);
        } else {
          removeToken();
        }
      } catch (err) {
        removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post<{ success: boolean; token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    hostelBlock?: string;
    roomNumber?: string;
    phone?: string;
  }): Promise<User> => {
    const res = await api.post<{ success: boolean; token: string; user: User }>('/auth/register', data);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    }
    removeToken();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    const res = await api.put<{ success: boolean; user: User }>('/auth/profile', data);
    setUser(res.user);
    return res.user;
  };

  const switchDemoAccount = async (role: UserRole): Promise<void> => {
    const account = DEMO_ACCOUNTS[role];
    if (account) {
      await login(account.email, account.pass);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
