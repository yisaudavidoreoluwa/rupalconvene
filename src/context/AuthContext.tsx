'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthProvider } from '@/types/auth';

interface AuthContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  loginWithProvider: (provider: AuthProvider, custom?: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'user-self',
  name: 'Alex Vance',
  email: 'alex.vance@rupaltech.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  provider: 'google',
  role: 'tech-lead',
  organization: 'Rupal Tech Solutions',
  jobTitle: 'VP of Platform Engineering',
  githubUsername: 'alexvance-tech',
  discordTag: 'AlexV#0001',
  tier: 'Developer Pro',
  isVerified: true,
  createdAt: '2026-01-15T09:00:00Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'rupal_convene_auth_profile';

export function AuthProviderComponent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Load saved profile from localStorage if exists
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setIsAuthenticated(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const loginWithProvider = async (provider: AuthProvider, custom?: Partial<UserProfile>) => {
    setIsLoading(true);

    // Simulate authentic OAuth handshake
    await new Promise((resolve) => setTimeout(resolve, 600));

    let newUser: UserProfile;

    if (provider === 'google') {
      newUser = {
        id: 'user-google-' + Date.now().toString().slice(-4),
        name: custom?.name || 'Alex Vance (Google)',
        email: custom?.email || 'alex.vance@gmail.com',
        avatar: custom?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        provider: 'google',
        role: custom?.role || 'tech-lead',
        organization: custom?.organization || 'Rupal Tech Solutions',
        jobTitle: custom?.jobTitle || 'Google Partner & Systems Lead',
        githubUsername: custom?.githubUsername || 'alexvance-tech',
        tier: 'Developer Pro',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
    } else if (provider === 'github') {
      newUser = {
        id: 'user-github-' + Date.now().toString().slice(-4),
        name: custom?.name || 'Alex Vance (GitHub)',
        email: custom?.email || 'alex.vance@github.users.noreply',
        avatar: custom?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        provider: 'github',
        role: custom?.role || 'developer',
        organization: custom?.organization || 'Rupal Open Source Ecosystem',
        jobTitle: custom?.jobTitle || 'Principal Systems Architect',
        githubUsername: custom?.githubUsername || 'rupal-lead-dev',
        tier: 'Developer Pro',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
    } else if (provider === 'discord') {
      newUser = {
        id: 'user-discord-' + Date.now().toString().slice(-4),
        name: custom?.name || 'Vance_Convene',
        email: custom?.email || 'alex.vance@discord.gg',
        avatar: custom?.avatar || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        provider: 'discord',
        role: custom?.role || 'host',
        organization: custom?.organization || 'Rupal Developer Guild',
        jobTitle: custom?.jobTitle || 'Lead Community Architect',
        discordTag: custom?.discordTag || 'Vance#1337',
        tier: 'Founding Member',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
    } else {
      newUser = {
        id: 'user-custom-' + Date.now().toString().slice(-4),
        name: custom?.name || 'Partner Guest',
        email: custom?.email || 'guest@rupaltech.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        provider: provider,
        role: custom?.role || 'business-partner',
        organization: custom?.organization || 'Enterprise Syndicate',
        jobTitle: custom?.jobTitle || 'Executive Delegate',
        tier: 'Enterprise Partner',
        isVerified: false,
        createdAt: new Date().toISOString(),
      };
    }

    setUser(newUser);
    setIsAuthenticated(true);
    setIsLoading(false);
    setIsAuthModalOpen(false);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // Ignore
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    const guestUser: UserProfile = {
      ...DEFAULT_USER,
      id: 'guest-' + Date.now().toString().slice(-4),
      name: 'Guest Participant',
      email: 'guest@rupalconvene.io',
      provider: 'guest',
      role: 'guest',
      isVerified: false,
    };
    setUser(guestUser);
    try {
      localStorage.removeItem(STORAGE_KEY);
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
        isAuthenticated,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        loginWithProvider,
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
