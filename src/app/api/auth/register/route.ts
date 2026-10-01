import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { dbCreateUser, dbFindUserByEmail } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth-server';
import { getUserAvatar } from '@/lib/avatar';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, organization, jobTitle } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const existing = await dbFindUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const id = 'user_' + crypto.randomUUID().slice(0, 8);
    const passwordHash = password ? hashPassword(password) : undefined;
    const avatar = getUserAvatar(undefined, name);

    const newUser = await dbCreateUser({
      id,
      name,
      email,
      avatar,
      provider: 'email',
      role: role || 'developer',
      organization: organization || 'Rupal Tech Solutions',
      jobTitle: jobTitle || 'Software Engineer',
      passwordHash,
      tier: 'Developer Pro',
      isVerified: true,
    });

    if (!newUser) {
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
    }

    const token = generateToken({
      sub: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    return NextResponse.json({
      success: true,
      user: newUser,
      token,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Registration error' }, { status: 500 });
  }
}
