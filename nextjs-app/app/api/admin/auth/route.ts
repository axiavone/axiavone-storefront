import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_MS,
  createAdminSessionToken,
  getAdminPasscode,
  isAdminRequestAuthenticated,
  verifyAdminPasscode,
} from '@/lib/adminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      configured: Boolean(getAdminPasscode()),
      authenticated: isAdminRequestAuthenticated(request),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: NextRequest) {
  if (!getAdminPasscode()) {
    return NextResponse.json(
      { error: 'Admin passcode is not configured on the server (set AXIAVONE_ADMIN_PASSCODE).' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let body: { passcode?: string };
  try {
    body = (await request.json()) as { passcode?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const passcode = typeof body.passcode === 'string' ? body.passcode.trim() : '';
  if (!verifyAdminPasscode(passcode)) {
    return NextResponse.json(
      { error: 'Invalid admin passcode.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const { token, expiresAt } = createAdminSessionToken();
  const res = NextResponse.json(
    { authenticated: true, token, expiresAt },
    { headers: { 'Cache-Control': 'no-store' } }
  );
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  res.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
