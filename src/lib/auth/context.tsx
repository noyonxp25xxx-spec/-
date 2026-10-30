'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (identifier: string, password: string, roleHint?: UserRole) => Promise<{ success: boolean; redirectUrl?: string; error?: string; user?: UserProfile }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load session from localStorage on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const stored = localStorage.getItem('bhaggo_auth_user');
        if (stored) {
          const parsed = JSON.parse(stored) as UserProfile;
          // Invalidate old demo users if they had old UIDs/roles
          if (parsed.uid === 'ceo-user-001' || parsed.email === 'ceo@bhaggounnayan.org') {
            localStorage.removeItem('bhaggo_auth_user');
            setUser(null);
          } else {
            setUser(parsed);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session load error', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = async (identifier: string, password: string, roleHint?: UserRole) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, roleHint }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLoading(false);
        return { success: false, error: data.error || 'লগইন ব্যর্থ হয়েছে।' };
      }

      setUser(data.user);
      localStorage.setItem('bhaggo_auth_user', JSON.stringify(data.user));
      setLoading(false);
      return { success: true, redirectUrl: data.redirectUrl, user: data.user };
    } catch {
      setLoading(false);
      return { success: false, error: 'সার্ভারে সংযোগ স্থাপন সম্ভব হয়নি।' };
    }
  };

  const refreshUser = async () => {
    try {
      const stored = localStorage.getItem('bhaggo_auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {
      // Ignore
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/session', { method: 'DELETE' });
    } catch {
      // Ignore
    }
    setUser(null);
    localStorage.removeItem('bhaggo_auth_user');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
