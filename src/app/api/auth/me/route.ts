import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-server';
import { dbFindUserById } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = dbFindUserById(payload.sub);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 404 });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Auth check error' }, { status: 500 });
  }
}
