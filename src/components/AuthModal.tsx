'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthProvider } from '@/types/auth';
import { X, ShieldCheck, Lock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, loginWithProvider, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(authModalMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleProviderLogin = async (provider: AuthProvider) => {
    try {
      await loginWithProvider(provider);
      setSuccessMessage(`Successfully connected with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`);
      setTimeout(() => {
        setSuccessMessage(null);
        closeAuthModal();
      }, 800);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    await loginWithProvider('email', {
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      role: 'developer',
      organization: email.split('@')[1] ? `${email.split('@')[1].split('.')[0].toUpperCase()} Corp` : 'Rupal Tech Solutions',
      jobTitle: 'Senior Software Engineer',
    });

    setSuccessMessage('Welcome! Signed in successfully.');
    setTimeout(() => {
      setSuccessMessage(null);
      closeAuthModal();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-7 md:p-8 text-slate-800 border border-slate-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-md mb-3">
            <span className="text-xl font-bold tracking-tight text-white">R</span>
          </div>
          <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
            {activeTab === 'login' ? 'Welcome to Rupal Convene' : 'Create Developer Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Real-time conference suite with live in-call IDE, whiteboard, and confidential pitch decks.
          </p>

          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl mt-4 w-full max-w-xs">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-[#0f172a] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'signup'
                  ? 'bg-white text-[#0f172a] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successMessage ? (
          <div className="my-6 p-4 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center gap-2 text-sm font-medium animate-in zoom-in-95">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        ) : (
          <>
            {/* Social OAuth Buttons */}
            <div className="space-y-2.5">
              {/* Google */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleProviderLogin('google')}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all hover:border-slate-300 shadow-xs group"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.39 7.35 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.16 0 9.99 0 12s.45 3.84 1.25 5.42l4.03-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* GitHub */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleProviderLogin('github')}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-medium text-sm transition-all shadow-xs group"
              >
                <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>Continue with GitHub</span>
              </button>

              {/* Discord */}
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleProviderLogin('discord')}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-medium text-sm transition-all shadow-xs group"
              >
                <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                <span>Continue with Discord</span>
              </button>
            </div>

            {/* Subtle Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs text-slate-400 uppercase tracking-wider font-semibold">
                <span className="bg-white px-3">or with work email</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {activeTab === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. David Oreoluwa"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0f172a]/20 focus:border-[#0f172a] transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#0f172a]/20 focus:border-[#0f172a] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>{activeTab === 'login' ? 'Sign In with Email' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        {/* Footer Security Badges */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit E2EE</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>OAuth 2.0 PKCE</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Rupal Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
}
