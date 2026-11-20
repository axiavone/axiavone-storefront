import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type ApiRequest = IncomingMessage & {
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};

export type ApiResponse = ServerResponse & {
  status?: (code: number) => ApiResponse;
  json?: (data: unknown) => void;
};

export const ADMIN_SESSION_COOKIE = 'axiavone_admin_session';
export const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
export const VALID_TIERS = ['free_lead', 'core_12', 'pro_19', 'flagship_29'] as const;
export const VALID_STATUSES = ['draft', 'qa_review', 'published', 'archived'] as const;

export function sendJson(res: ApiResponse, statusCode: number, data: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

export async function readJsonBody(req: ApiRequest): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object') {
    return req.body as Record<string, unknown>;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, unknown>;
}

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

export function isAdminAuthenticated(req: ApiRequest): boolean {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim();
    if (bearer && verifyAdminSessionToken(bearer)) return true;
  }
  const cookieHeader = req.headers.cookie;
  if (typeof cookieHeader === 'string') {
    for (const pair of cookieHeader.split(';')) {
      const eq = pair.indexOf('=');
      if (eq === -1) continue;
      if (pair.slice(0, eq).trim() === ADMIN_SESSION_COOKIE) {
        return verifyAdminSessionToken(decodeURIComponent(pair.slice(eq + 1).trim()));
      }
    }
  }
  return false;
}

export function getServiceSupabase(): SupabaseClient | null {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key || !url.startsWith('http')) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return value.startsWith('/');
  }
}

export function normalizeProductRow(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    tagline: String(row.tagline ?? ''),
    description_md: String(row.description_md ?? ''),
    tier: String(row.tier),
    price_usd: Number(row.price_usd ?? 0),
    checkout_url: String(row.checkout_url ?? 'https://polar.sh'),
    secondary_checkout_url:
      typeof row.secondary_checkout_url === 'string' && row.secondary_checkout_url.trim()
        ? row.secondary_checkout_url.trim()
        : null,
    preview_image_url:
      typeof row.preview_image_url === 'string' && row.preview_image_url.trim()
        ? row.preview_image_url.trim()
        : null,
    features_json: Array.isArray(row.features_json) ? row.features_json.map(String) : [],
    seo_title: String(row.seo_title ?? row.title ?? ''),
    seo_description: String(row.seo_description ?? row.tagline ?? ''),
    keywords: Array.isArray(row.keywords) ? row.keywords.map(String) : [],
    status: String(row.status ?? 'draft'),
    created_by_division: String(row.created_by_division ?? 'DIV-08'),
    published_at: String(row.published_at ?? row.created_at ?? ''),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}
