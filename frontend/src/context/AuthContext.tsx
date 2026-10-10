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
  refreshAdminProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('earnx_user_data');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredAdmin = (): Admin | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('earnx_admin_data');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const getStoredToken = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return getCookie(key) || localStorage.getItem(key);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [admin, setAdmin] = useState<Admin | null>(getStoredAdmin);
  const [userToken, setUserToken] = useState<string | null>(() => getStoredToken('earnx_user_token'));
  const [adminToken, setAdminToken] = useState<string | null>(() => getStoredToken('earnx_admin_token'));

  // Instant hydration: If user data exists in storage or there's no token, loading is false immediately (0ms delay)
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const uToken = getStoredToken('earnx_user_token');
    const aToken = getStoredToken('earnx_admin_token');
    const hasToken = Boolean(uToken || aToken);
    const hasData = Boolean(getStoredUser() || getStoredAdmin());
    return hasToken && !hasData;
  });

  const refreshUserProfile = async () => {
    const token = userToken || getStoredToken('earnx_user_token');
    if (!token) return;

    const res = await apiFetch<User>('/auth/me', { token, skipCache: true });
    if (res.success && res.data) {
      setUser(res.data);
      try {
        localStorage.setItem('earnx_user_data', JSON.stringify(res.data));
      } catch {}
    } else {
      console.error('Failed to refresh user profile:', res.error?.message);
      if (res.statusCode === 401) {
        logoutUser();
      }
    }
  };

  const refreshAdminProfile = async () => {
    const token = adminToken || getStoredToken('earnx_admin_token');
    if (!token) return;

    const res = await apiFetch<Admin>('/admin/auth/me', { token, isAdmin: true, skipCache: true });
    if (res.success && res.data) {
      setAdmin(res.data);
      try {
        localStorage.setItem('earnx_admin_data', JSON.stringify(res.data));
      } catch {}
    } else {
      console.error('Failed to refresh admin profile:', res.error?.message);
      if (res.statusCode === 401) {
        logoutAdmin();
      }
    }
  };

  // Silent background revalidation (Stale-While-Revalidate)
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const uToken = getStoredToken('earnx_user_token');
      const aToken = getStoredToken('earnx_admin_token');

      // 1. Silently revalidate User Session
      if (uToken) {
        setUserToken(uToken);
        const res = await apiFetch<User>('/auth/me', { token: uToken, skipCache: true });
        if (!isMounted) return;

        if (res.success && res.data) {
          setUser(res.data);
          try {
            localStorage.setItem('earnx_user_data', JSON.stringify(res.data));
          } catch {}
        } else if (res.statusCode === 401) {
          deleteCookie('earnx_user_token');
          localStorage.removeItem('earnx_user_token');
          localStorage.removeItem('earnx_user_data');
          setUserToken(null);
          setUser(null);
        }
      }

      // 2. Silently revalidate Admin Session
      if (aToken) {
        setAdminToken(aToken);
        const res = await apiFetch<Admin>('/admin/auth/me', { token: aToken, isAdmin: true, skipCache: true });
        if (!isMounted) return;

        if (res.success && res.data) {
          setAdmin(res.data);
          try {
            localStorage.setItem('earnx_admin_data', JSON.stringify(res.data));
          } catch {}
        } else if (res.statusCode === 401) {
          deleteCookie('earnx_admin_token');
          localStorage.removeItem('earnx_admin_token');
          localStorage.removeItem('earnx_admin_data');
          setAdminToken(null);
          setAdmin(null);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const loginUser = (token: string, userData: User) => {
    setCookie('earnx_user_token', token, 7);
    localStorage.setItem('earnx_user_token', token);
    localStorage.setItem('earnx_user_data', JSON.stringify(userData));
    setUserToken(token);
    setUser(userData);
    setIsLoading(false);

    // Fetch fresh live user profile to guarantee immediate synchronization
    apiFetch<User>('/auth/me', { token, skipCache: true }).then((res) => {
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('earnx_user_data', JSON.stringify(res.data));
      }
    });
  };

  const loginAdmin = (token: string, adminData: Admin) => {
    setCookie('earnx_admin_token', token, 7);
    localStorage.setItem('earnx_admin_token', token);
    localStorage.setItem('earnx_admin_data', JSON.stringify(adminData));
    setAdminToken(token);
    setAdmin(adminData);
    setIsLoading(false);
  };

  const logoutUser = () => {
    deleteCookie('earnx_user_token');
    localStorage.removeItem('earnx_user_token');
    localStorage.removeItem('earnx_user_data');
    setUserToken(null);
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
  };

  const logoutAdmin = () => {
    deleteCookie('earnx_admin_token');
    localStorage.removeItem('earnx_admin_token');
    localStorage.removeItem('earnx_admin_data');
    setAdminToken(null);
    setAdmin(null);
    if (typeof window !== 'undefined') {
      window.location.replace('/');
    }
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
        refreshAdminProfile,
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
