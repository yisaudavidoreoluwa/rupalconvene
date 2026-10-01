'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthProvider } from '@/types/auth';
import { generateInitialsAvatar, getUserAvatar } from '@/lib/avatar';

interface AuthContextType {
  user: UserProfile;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  loginWithProvider: (provider: AuthProvider, custom?: Partial<UserProfile> & { password?: string }) => Promise<void>;
  registerWithEmail: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'user_host',
  name: 'Developer Host',
  email: 'host@rupalconvene.io',
  avatar: generateInitialsAvatar('Developer Host'),
  provider: 'google',
  role: 'tech-lead',
  organization: 'Rupal Tech Solutions',
  jobTitle: 'Lead Platform Architect',
  tier: 'Developer Pro',
  isVerified: true,
  createdAt: '2026-10-01T00:00:00Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'rupal_convene_auth_profile';
const TOKEN_KEY = 'rupal_convene_auth_token';

export function AuthProviderComponent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Load saved session on startup
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      const savedToken = localStorage.getItem(TOKEN_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // Ensure avatar doesn't use old unsplash demo images
        parsed.avatar = getUserAvatar(parsed.avatar, parsed.name);
        setUser(parsed);
        setIsAuthenticated(true);
      }
      if (savedToken) {
        setToken(savedToken);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const loginWithProvider = async (
    provider: AuthProvider,
    custom?: Partial<UserProfile> & { password?: string }
  ) => {
    setIsLoading(true);

    try {
      const payload = {
        provider,
        email: custom?.email,
        password: custom?.password,
        name: custom?.name,
        profile: {
          email: custom?.email || `${provider}_developer@rupalconvene.io`,
          name: custom?.name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} Engineer`,
          avatar: getUserAvatar(custom?.avatar, custom?.name || provider),
          role: custom?.role || (provider === 'github' ? 'developer' : 'tech-lead'),
          organization: custom?.organization || 'Rupal Tech Solutions',
          jobTitle: custom?.jobTitle || (provider === 'github' ? 'Senior Full-Stack Engineer' : 'Lead Architect'),
        },
      };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.user) {
        const updatedUser: UserProfile = {
          ...data.user,
          avatar: getUserAvatar(data.user.avatar, data.user.name),
        };
        setUser(updatedUser);
        setToken(data.token);
        setIsAuthenticated(true);
        setIsAuthModalOpen(false);

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
          if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
        } catch {
          // Ignore
        }
      } else {
        // Fallback local update if offline
        const localUser: UserProfile = {
          id: `user_${provider}_` + Date.now().toString(36),
          name: custom?.name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} Developer`,
          email: custom?.email || `${provider}@rupalconvene.io`,
          avatar: getUserAvatar(custom?.avatar, custom?.name || provider),
          provider,
          role: custom?.role || 'developer',
          organization: custom?.organization || 'Rupal Tech Solutions',
          jobTitle: custom?.jobTitle || 'Software Engineer',
          tier: 'Developer Pro',
          isVerified: true,
          createdAt: new Date().toISOString(),
        };
        setUser(localUser);
        setIsAuthenticated(true);
        setIsAuthModalOpen(false);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(localUser));
        } catch {}
      }
    } catch {
      // Offline fallback
      const fallbackUser: UserProfile = {
        id: `user_${provider}_` + Date.now().toString(36),
        name: custom?.name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} Member`,
        email: custom?.email || `${provider}@rupalconvene.io`,
        avatar: getUserAvatar(undefined, custom?.name || provider),
        provider,
        role: custom?.role || 'developer',
        organization: 'Rupal Tech Solutions',
        jobTitle: 'Software Engineer',
        tier: 'Developer Pro',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
      setUser(fallbackUser);
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (name: string, email: string, password?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        const u = { ...data.user, avatar: getUserAvatar(data.user.avatar, data.user.name) };
        setUser(u);
        setToken(data.token);
        setIsAuthenticated(true);
        setIsAuthModalOpen(false);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
          if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
        } catch {}
      }
    } catch (e) {
      console.error('Registration failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken(null);
    const guestUser: UserProfile = {
      ...DEFAULT_USER,
      id: 'guest_' + Date.now().toString(36),
      name: 'Guest Participant',
      email: 'guest@rupalconvene.io',
      avatar: generateInitialsAvatar('Guest Participant'),
      provider: 'guest',
      role: 'guest',
      isVerified: false,
    };
    setUser(guestUser);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        loginWithProvider,
        registerWithEmail,
        logout,
        updateProfile,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProviderComponent');
  }
  return context;
}
