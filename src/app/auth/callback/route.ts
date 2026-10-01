import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = 
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
    '';

  if (code && supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      await supabase.auth.exchangeCodeForSession(code);
    } catch (e) {
      console.error('Error exchanging auth code:', e);
    }
  }

  // Always route to production domain unless already running on a custom Vercel preview domain
  const prodUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rupalconvene.vercel.app';
  const targetBase = requestUrl.origin.includes('vercel.app') 
    ? requestUrl.origin 
    : prodUrl;

  return NextResponse.redirect(new URL(next, targetBase));
}
