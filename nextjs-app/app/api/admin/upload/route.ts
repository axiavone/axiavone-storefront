import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequestAuthenticated } from '@/lib/adminAuth';
import { createServiceRoleSupabaseClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

export async function POST(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized: admin login required.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const rawMime = typeof body.contentType === 'string' ? body.contentType.toLowerCase().trim() : '';
  const ext = ALLOWED_MIME_EXT[rawMime];
  if (!ext) {
    return NextResponse.json(
      { error: 'Unsupported image format. Please choose PNG, JPG, WebP, GIF, or SVG.' },
      { status: 422 }
    );
  }

  const rawBase64 = typeof body.base64 === 'string' ? body.base64.trim() : '';
  const cleanBase64 = rawBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  if (buffer.length === 0 || buffer.length > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'Image file must be non-empty and under 10 MB.' },
      { status: 422 }
    );
  }

  const rawSlug = typeof body.slug === 'string' ? body.slug : 'cover';
  const safePrefix =
    rawSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'cover';
  const filePath = `${safePrefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;

  const supabase = createServiceRoleSupabaseClient();
  const bucketName = 'product-covers';
  const { error: bucketErr } = await supabase.storage.getBucket(bucketName);
  if (bucketErr) {
    const { error: createErr } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
    });
    if (createErr && !createErr.message.toLowerCase().includes('already exists')) {
      return NextResponse.json(
        { error: `Failed to initialize "${bucketName}" bucket: ${createErr.message}` },
        { status: 500 }
      );
    }
  }

  const { error: uploadErr } = await supabase.storage
    .from(bucketName)
    .upload(filePath, buffer, {
      contentType: rawMime === 'image/jpg' ? 'image/jpeg' : rawMime,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadErr) {
    return NextResponse.json({ error: `Storage upload failed: ${uploadErr.message}` }, { status: 500 });
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
  return NextResponse.json(
    { ok: true, url: data.publicUrl, path: filePath, bucket: bucketName },
    { status: 201 }
  );
}
