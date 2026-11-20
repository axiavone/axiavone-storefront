import crypto from 'node:crypto';
import type { NextRequest } from 'next/server';

export const ADMIN_SESSION_COOKIE = 'axiavone_admin_session';
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export function getAdminPasscode(): string {
  return (process.env.AXIAVONE_ADMIN_PASSCODE || process.env.AXIAVONE_INTERNAL_SECRET || '').trim();
}

export function verifyAdminPasscode(provided: string): boolean {
  const expected = getAdminPasscode();
  if (!expected || !provided) return false;
  const a = crypto.createHash('sha256').update(provided, 'utf8').digest();
  const b = crypto.createHash('sha256').update(expected, 'utf8').digest();
  return crypto.timingSafeEqual(a, b);
}

function getSigningKey(): Buffer {
  return crypto
    .createHash('sha256')
    .update(`axiavone-admin-session:${getAdminPasscode()}`, 'utf8')
    .digest();
}

export function createAdminSessionToken(): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_MS;
  const payload = Buffer.from(
    JSON.stringify({ exp: expiresAt, nonce: crypto.randomBytes(8).toString('hex') }),
    'utf8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', getSigningKey()).update(payload).digest('base64url');
  return { token: `${payload}.${sig}`, expiresAt };
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token || !getAdminPasscode()) return false;
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return false;
  const payload = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  if (!payload || !sig) return false;

  const expectedSig = crypto
    .createHmac('sha256', getSigningKey())
    .update(payload)
    .digest('base64url');

  const a = Buffer.from(sig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: number;
    };
    return typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export function isAdminRequestAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer && verifyAdminSessionToken(bearer)) return true;
  }
  const cookieToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(cookieToken);
}

export function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return value.startsWith('/');
  }
}
