'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function CallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function processAuth() {
      try {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          window.location.replace('https://rupalconvene.vercel.app');
          return;
        }

        const error = searchParams.get('error_description') || searchParams.get('error');
        if (error) {
          setErrorMessage(error);
          setStatus('error');
          setTimeout(() => {
            window.location.replace('https://rupalconvene.vercel.app');
          }, 2000);
          return;
        }

        const code = searchParams.get('code');
        if (code) {
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            console.error('Code exchange failed:', exchangeErr);
          }
        }

        // Verify session in browser storage
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
        }

        // Direct to production lobby
        setTimeout(() => {
          window.location.replace('https://rupalconvene.vercel.app');
        }, 300);
      } catch (err: unknown) {
        console.error('Callback handler error:', err);
        const msg = err instanceof Error ? err.message : 'Authentication error';
        setErrorMessage(msg);
        setStatus('error');
        setTimeout(() => {
          window.location.replace('https://rupalconvene.vercel.app');
        }, 1500);
      }
    }

    processAuth();
  }, [searchParams]);

  return (
    <div className="min-h-screen w-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 font-sans select-none">
      <div className="w-full max-w-sm p-8 bg-white border border-slate-100 rounded-3xl shadow-xl flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center text-xl font-extrabold shadow-md">
          R
        </div>

        {status === 'processing' && (
          <>
            <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
            <div>
              <h2 className="text-base font-bold text-[#0f172a]">Connecting Your Session...</h2>
              <p className="text-xs text-slate-500 mt-1">
                Authenticating credentials and routing to your conference lobby.
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            <div>
              <h2 className="text-base font-bold text-[#0f172a]">Authentication Verified!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Redirecting to Rupal Convene lobby...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-7 h-7 text-amber-500" />
            <div>
              <h2 className="text-base font-bold text-[#0f172a]">Notice</h2>
              <p className="text-xs text-slate-500 mt-1">
                {errorMessage || 'Redirecting to Rupal Convene...'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
