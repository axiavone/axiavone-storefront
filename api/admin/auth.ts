import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_MS,
  createAdminSessionToken,
  getAdminPasscode,
  isAdminAuthenticated,
  readJsonBody,
  sendJson,
  verifyAdminPasscode,
  type ApiRequest,
  type ApiResponse,
} from './_shared.ts';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === 'GET') {
    sendJson(res, 200, {
      configured: Boolean(getAdminPasscode()),
      authenticated: isAdminAuthenticated(req),
    });
    return;
  }

  if (req.method === 'POST') {
    if (!getAdminPasscode()) {
      sendJson(res, 503, {
        error: 'Admin passcode is not configured on the server (set AXIAVONE_ADMIN_PASSCODE).',
      });
      return;
    }

    let body: Record<string, unknown>;
    try {
      body = await readJsonBody(req);
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON body.' });
      return;
    }

    const passcode = typeof body.passcode === 'string' ? body.passcode.trim() : '';
    if (!verifyAdminPasscode(passcode)) {
      sendJson(res, 401, { error: 'Invalid admin passcode.' });
      return;
    }

    const { token, expiresAt } = createAdminSessionToken();
    const isHttps = req.headers['x-forwarded-proto'] === 'https';
    res.setHeader(
      'Set-Cookie',
      `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${Math.floor(
        ADMIN_SESSION_TTL_MS / 1000
      )}; SameSite=Lax${isHttps ? '; Secure' : ''}`
    );
    sendJson(res, 200, { authenticated: true, token, expiresAt });
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed.' });
}
