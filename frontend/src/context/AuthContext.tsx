'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { setCookie, getCookie, deleteCookie } from '../lib/cookies';
import { User, Admin } from '../types';

interface AuthContextType {
  user: User | null;
  admin: Admin | null;
  userToken: string | null;
  adminToken: string | null;
  isLoading: boolean;
  loginUser: (token: string, userData: User) => void;
  loginAdmin: (token: string, adminData: Admin) => void;
  logoutUser: () => void;
  logoutAdmin: () => void;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUserProfile = async () => {
    const token = userToken || getCookie('earnx_user_token') || localStorage.getItem('earnx_user_token');
    if (!token) return;

    const res = await apiFetch<User>('/auth/me', { token });
    if (res.success && res.data) {
      setUser(res.data);
    } else {
      console.error('Failed to refresh user profile:', res.error?.message);
      logoutUser();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const uToken = getCookie('earnx_user_token') || localStorage.getItem('earnx_user_token');
      const aToken = getCookie('earnx_admin_token') || localStorage.getItem('earnx_admin_token');

      if (uToken) {
        setUserToken(uToken);
        const res = await apiFetch<User>('/auth/me', { token: uToken });
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          deleteCookie('earnx_user_token');
          localStorage.removeItem('earnx_user_token');
          setUserToken(null);
        }
      }

      if (aToken) {
        setAdminToken(aToken);
        const res = await apiFetch<Admin>('/admin/auth/me', { token: aToken, isAdmin: true });
        if (res.success && res.data) {
          setAdmin(res.data);
        } else {
          deleteCookie('earnx_admin_token');
          localStorage.removeItem('earnx_admin_token');
          setAdminToken(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const loginUser = (token: string, userData: User) => {
    setCookie('earnx_user_token', token, 7);
    localStorage.setItem('earnx_user_token', token);
    setUserToken(token);
    setUser(userData);
  };

  const loginAdmin = (token: string, adminData: Admin) => {
    setCookie('earnx_admin_token', token, 7);
    localStorage.setItem('earnx_admin_token', token);
    setAdminToken(token);
    setAdmin(adminData);
  };

  const logoutUser = () => {
    deleteCookie('earnx_user_token');
    localStorage.removeItem('earnx_user_token');
    setUserToken(null);
    setUser(null);
  };

  const logoutAdmin = () => {
    deleteCookie('earnx_admin_token');
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
