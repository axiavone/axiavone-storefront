import crypto from 'node:crypto';
import {
  getServiceSupabase,
  isAdminAuthenticated,
  readJsonBody,
  sendJson,
  type ApiRequest,
  type ApiResponse,
} from './_shared.ts';

const ALLOWED_MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  if (!isAdminAuthenticated(req)) {
    sendJson(res, 401, { error: 'Unauthorized: admin login required.' });
    return;
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    sendJson(res, 503, { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' });
    return;
  }

  let body: Record<string, unknown>;
  try {
    body = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON body.' });
    return;
  }

  const rawMime = typeof body.contentType === 'string' ? body.contentType.toLowerCase().trim() : '';
  const ext = ALLOWED_MIME_EXT[rawMime];
  if (!ext) {
    sendJson(res, 422, {
      error: 'Unsupported image format. Please choose PNG, JPG, WebP, GIF, or SVG.',
    });
    return;
  }

  const rawBase64 = typeof body.base64 === 'string' ? body.base64.trim() : '';
  const cleanBase64 = rawBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  if (buffer.length === 0 || buffer.length > 10 * 1024 * 1024) {
    sendJson(res, 422, { error: 'Image file must be non-empty and under 10 MB.' });
    return;
  }

  const rawSlug = typeof body.slug === 'string' ? body.slug : 'cover';
  const safePrefix =
    rawSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'cover';
  const filePath = `${safePrefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;

  const bucketName = 'product-covers';
  const { error: bucketErr } = await supabase.storage.getBucket(bucketName);
  if (bucketErr) {
    const { error: createErr } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    });
    if (createErr && !createErr.message.toLowerCase().includes('already exists')) {
      sendJson(res, 500, {
        error: `Could not prepare storage bucket "${bucketName}": ${createErr.message}`,
      });
      return;
    }
  }

  const { error: uploadErr } = await supabase.storage.from(bucketName).upload(filePath, buffer, {
    contentType: rawMime === 'image/jpg' ? 'image/jpeg' : rawMime,
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadErr) {
    sendJson(res, 500, { error: `Storage upload failed: ${uploadErr.message}` });
    return;
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  sendJson(res, 201, {
    ok: true,
    url: data.publicUrl,
    path: filePath,
    bucket: bucketName,
  });
}
