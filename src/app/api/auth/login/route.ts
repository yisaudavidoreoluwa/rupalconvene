import { NextRequest, NextResponse } from 'next/server';
import { dbFindUserByEmail, dbCreateUser } from '@/lib/db';
import { verifyPassword, generateToken, authenticateOAuthUser } from '@/lib/auth-server';
import { getUserAvatar } from '@/lib/avatar';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, provider, profile } = body;

    // OAuth provider login (Google, GitHub, Discord)
    if (provider && ['google', 'github', 'discord'].includes(provider)) {
      const userProfile = profile || {
        email: email || `${provider}_user@rupalconvene.io`,
        name: body.name || `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        avatar: getUserAvatar(undefined, body.name || provider),
      };

      const result = await authenticateOAuthUser(provider, userProfile);
      return NextResponse.json({
        success: true,
        user: result.user,
        token: result.token,
      });
    }

    // Email/password login
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await dbFindUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found. Please register.' }, { status: 404 });
    }

    if (password && user.passwordHash) {
      const isValid = verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    const token = generateToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      user,
      token,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Authentication error' }, { status: 500 });
  }
}
