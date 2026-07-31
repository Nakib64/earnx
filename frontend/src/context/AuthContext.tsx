'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

export interface UserProfile {
  id: string;
  phone: string;
  full_name: string | null;
  referral_code: string;
  status: 'DISABLED' | 'ACTIVE' | 'BLOCKED';
  wallet_balance: number | string;
  designation_id?: string | null;
  designation?: {
    id: string;
    name: string;
    max_level: number;
  } | null;
  referred_by?: {
    id: string;
    phone: string;
    full_name: string | null;
    referral_code: string;
  } | null;
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: UserProfile | null;
  admin: AdminProfile | null;
  userToken: string | null;
  adminToken: string | null;
  isLoading: boolean;
  loginUser: (token: string, userData: UserProfile) => void;
  loginAdmin: (token: string, adminData: AdminProfile) => void;
  logoutUser: () => void;
  logoutAdmin: () => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUserProfile = async () => {
    const token = userToken || localStorage.getItem('earnx_user_token');
    if (!token) return;

    try {
      const data = await apiFetch<UserProfile>('/auth/me', { token });
      setUser(data);
    } catch (e) {
      console.error('Failed to refresh user profile:', e);
      logoutUser();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const uToken = localStorage.getItem('earnx_user_token');
      const aToken = localStorage.getItem('earnx_admin_token');

      if (uToken) {
        setUserToken(uToken);
        try {
          const userData = await apiFetch<UserProfile>('/auth/me', { token: uToken });
          setUser(userData);
        } catch {
          localStorage.removeItem('earnx_user_token');
        }
      }

      if (aToken) {
        setAdminToken(aToken);
        try {
          const adminData = await apiFetch<AdminProfile>('/admin/auth/me', { token: aToken, isAdmin: true });
          setAdmin(adminData);
        } catch {
          localStorage.removeItem('earnx_admin_token');
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = (token: string, userData: UserProfile) => {
    localStorage.setItem('earnx_user_token', token);
    setUserToken(token);
    setUser(userData);
  };

  const loginAdmin = (token: string, adminData: AdminProfile) => {
    localStorage.setItem('earnx_admin_token', token);
    setAdminToken(token);
    setAdmin(adminData);
  };

  const logoutUser = () => {
    localStorage.removeItem('earnx_user_token');
    setUserToken(null);
    setUser(null);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('earnx_admin_token');
    setAdminToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        userToken,
        adminToken,
        isLoading,
        loginUser,
        loginAdmin,
        logoutUser,
        logoutAdmin,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
