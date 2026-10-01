'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, AuthProvider } from '@/types/auth';
import { generateInitialsAvatar, getUserAvatar } from '@/lib/avatar';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface AuthContextType {
  user: UserProfile | null;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'rupal_convene_auth_profile';
const TOKEN_KEY = 'rupal_convene_auth_token';

export function AuthProviderComponent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const supabase = getSupabaseBrowserClient();

      if (supabase && isSupabaseConfigured()) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!mounted) return;

          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const profile: UserProfile = {
              id: session.user.id,
              name: meta.name || meta.full_name || session.user.email?.split('@')[0] || 'Convene User',
              email: session.user.email || '',
              avatar: getUserAvatar(meta.avatar_url, meta.name || session.user.email),
              provider: (session.user.app_metadata?.provider as AuthProvider) || 'email',
              role: meta.role || 'developer',
              organization: meta.organization || 'Rupal Tech Solutions',
              jobTitle: meta.job_title || 'Software Engineer',
              tier: 'Developer Pro',
              isVerified: true,
              createdAt: session.user.created_at,
            };
            setUser(profile);
            setToken(session.access_token);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (e) {
          console.error('Supabase session load error:', e);
        }

        // Listen for live auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!mounted) return;
          if (session?.user) {
            const meta = session.user.user_metadata || {};
            const profile: UserProfile = {
              id: session.user.id,
              name: meta.name || meta.full_name || session.user.email?.split('@')[0] || 'Convene User',
              email: session.user.email || '',
              avatar: getUserAvatar(meta.avatar_url, meta.name || session.user.email),
              provider: (session.user.app_metadata?.provider as AuthProvider) || 'email',
              role: meta.role || 'developer',
              organization: meta.organization || 'Rupal Tech Solutions',
              jobTitle: meta.job_title || 'Software Engineer',
              tier: 'Developer Pro',
              isVerified: true,
              createdAt: session.user.created_at,
            };
            setUser(profile);
            setToken(session.access_token);
            setIsAuthenticated(true);
            setIsAuthModalOpen(false);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        });

        setIsLoading(false);
        return () => subscription.unsubscribe();
      } else {
        // Fallback: check localStorage for local/demo session
        try {
          const savedUser = localStorage.getItem(STORAGE_KEY);
          const savedToken = localStorage.getItem(TOKEN_KEY);
          if (savedUser && savedToken) {
            const parsed = JSON.parse(savedUser);
            parsed.avatar = getUserAvatar(parsed.avatar, parsed.name);
            setUser(parsed);
            setToken(savedToken);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch {
          setIsAuthenticated(false);
          setUser(null);
        }
        setIsLoading(false);
      }
    }

    initSession();

    return () => {
      mounted = false;
    };
  }, []);

  const loginWithProvider = async (
    provider: AuthProvider,
    custom?: Partial<UserProfile> & { password?: string }
  ) => {
    setIsLoading(true);

    try {
      const supabase = getSupabaseBrowserClient();

      // If Supabase is configured and this is an OAuth provider
      if (supabase && isSupabaseConfigured() && (provider === 'google' || provider === 'github' || provider === 'discord')) {
        const prodUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rupalconvene.vercel.app';
        const targetRedirect = 
          typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
            ? `${window.location.origin}/auth/callback`
            : `${prodUrl.replace(/\/$/, '')}/auth/callback`;

        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider as 'google' | 'github' | 'discord',
          options: {
            redirectTo: targetRedirect,
          },
        });
        if (error) throw error;
        return;
      }

      // If Supabase is configured and email password login
      if (supabase && isSupabaseConfigured() && provider === 'email' && custom?.email && custom?.password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: custom.email,
          password: custom.password,
        });
        if (error) throw error;
        if (data.session && data.user) {
          const meta = data.user.user_metadata || {};
          const profile: UserProfile = {
            id: data.user.id,
            name: meta.name || custom.name || data.user.email?.split('@')[0] || 'Convene User',
            email: data.user.email || '',
            avatar: getUserAvatar(meta.avatar_url, meta.name || custom.name),
            provider: 'email',
            role: meta.role || 'developer',
            organization: meta.organization || 'Rupal Tech Solutions',
            jobTitle: meta.job_title || 'Software Engineer',
            tier: 'Developer Pro',
            isVerified: true,
            createdAt: data.user.created_at,
          };
          setUser(profile);
          setToken(data.session.access_token);
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
          return;
        }
      }

      // API Fallback
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
        } catch {}
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (name: string, email: string, password?: string) => {
    setIsLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();

      if (supabase && isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: password || 'SecurePass123!',
          options: {
            data: {
              name,
              role: 'developer',
              organization: 'Rupal Tech Solutions',
            },
          },
        });

        if (error) throw error;

        if (data.session && data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            name,
            email,
            avatar: getUserAvatar(undefined, name),
            provider: 'email',
            role: 'developer',
            organization: 'Rupal Tech Solutions',
            jobTitle: 'Software Engineer',
            tier: 'Developer Pro',
            isVerified: true,
            createdAt: data.user.created_at,
          };
          setUser(profile);
          setToken(data.session.access_token);
          setIsAuthenticated(true);
          setIsAuthModalOpen(false);
          return;
        }
      }

      // API Fallback
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
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (e) {
      console.error('Registration failed:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase sign out error:', e);
      }
    }

    setIsAuthenticated(false);
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
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
