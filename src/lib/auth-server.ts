import crypto from 'node:crypto';
import { dbCreateUser, dbFindUserByEmail, dbFindUserById } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'rupal_convene_super_secret_jwt_key_2026';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
}

export function generateToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function authenticateOAuthUser(provider: 'google' | 'github' | 'discord', profile: {
  email: string;
  name: string;
  avatar?: string;
  role?: string;
  organization?: string;
  jobTitle?: string;
}) {
  let existingUser = await dbFindUserByEmail(profile.email);

  if (!existingUser) {
    const id = `user_${provider}_` + crypto.randomUUID().slice(0, 8);
    existingUser = await dbCreateUser({
      id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar || '',
      provider,
      role: profile.role || (provider === 'github' ? 'developer' : 'business-partner'),
      organization: profile.organization || 'Rupal Tech Solutions',
      jobTitle: profile.jobTitle || (provider === 'github' ? 'Senior Full-Stack Engineer' : 'Syndicate Member'),
      tier: provider === 'google' ? 'Enterprise Partner' : 'Developer Pro',
      isVerified: true,
    });
  }

  if (!existingUser) {
    throw new Error('OAuth user creation failed');
  }

  const token = generateToken({
    sub: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
    role: existingUser.role,
    provider: existingUser.provider,
  });

  return { user: existingUser, token };
}
