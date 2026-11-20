import { ADMIN_SESSION_COOKIE, sendJson, type ApiRequest, type ApiResponse } from './_shared.ts';

export default function handler(_req: ApiRequest, res: ApiResponse) {
  res.setHeader('Set-Cookie', `${ADMIN_SESSION_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`);
  sendJson(res, 200, { ok: true });
}
