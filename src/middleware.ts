import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname;
  
  // Reroute any local development host requests to the live production domain
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const destination = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      'https://rupalconvene.vercel.app'
    );
    return NextResponse.redirect(destination, 307);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
