import {
  getServiceSupabase,
  isAdminAuthenticated,
  isValidUrl,
  normalizeProductRow,
  readJsonBody,
  sendJson,
  VALID_STATUSES,
  VALID_TIERS,
  type ApiRequest,
  type ApiResponse,
} from '../_shared.ts';

function extractId(req: ApiRequest): string {
  const qId = req.query?.id;
  if (typeof qId === 'string' && qId.trim()) return qId.trim();
  if (Array.isArray(qId) && qId[0]) return qId[0].trim();
  const pathPart = (req.url || '').split('?')[0].split('/').pop() || '';
  return decodeURIComponent(pathPart).trim();
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (!isAdminAuthenticated(req)) {
    sendJson(res, 401, { error: 'Unauthorized: admin login required.' });
    return;
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    sendJson(res, 503, { error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' });
    return;
  }

  const id = extractId(req);
  if (!id) {
    sendJson(res, 400, { error: 'Missing product ID.' });
    return;
  }

  if (req.method === 'PATCH') {
    let body: Record<string, unknown>;
    try {
      body = await readJsonBody(req);
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON body.' });
      return;
    }

    const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const tagline = typeof body.tagline === 'string' ? body.tagline.trim() : '';
    const descriptionMd =
      (typeof body.description_md === 'string' ? body.description_md.trim() : '') || tagline;
    const tier = String(body.tier ?? '');
    const statusValue = VALID_STATUSES.includes(String(body.status) as (typeof VALID_STATUSES)[number])
      ? String(body.status)
      : 'draft';

    const parsedPrice =
      typeof body.price_usd === 'number'
        ? body.price_usd
        : typeof body.price_usd === 'string' && body.price_usd.trim() !== ''
          ? Number(body.price_usd)
          : NaN;

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      sendJson(res, 422, { error: 'Slug must use lowercase letters, numbers, and hyphens only.' });
      return;
    }
    if (
      !title ||
      !tagline ||
      !VALID_TIERS.includes(tier as (typeof VALID_TIERS)[number]) ||
      Number.isNaN(parsedPrice) ||
      parsedPrice < 0
    ) {
      sendJson(res, 422, {
        error: 'Title, slug, tagline, valid tier, and non-negative USD price are required.',
      });
      return;
    }

    const checkoutUrl =
      typeof body.checkout_url === 'string' && body.checkout_url.trim()
        ? body.checkout_url.trim()
        : 'https://polar.sh';
    if (!isValidUrl(checkoutUrl)) {
      sendJson(res, 422, { error: 'Invalid checkout URL format.' });
      return;
    }

    const secondaryCheckoutUrl =
      typeof body.secondary_checkout_url === 'string' && body.secondary_checkout_url.trim()
        ? body.secondary_checkout_url.trim()
        : null;
    if (secondaryCheckoutUrl && !isValidUrl(secondaryCheckoutUrl)) {
      sendJson(res, 422, { error: 'Invalid secondary checkout URL format.' });
      return;
    }

    const rawImage =
      typeof body.preview_image_url === 'string'
        ? body.preview_image_url.trim()
        : typeof body.image_url === 'string'
          ? body.image_url.trim()
          : '';
    const previewImageUrl = rawImage || null;
    if (previewImageUrl && !isValidUrl(previewImageUrl)) {
      sendJson(res, 422, { error: 'Invalid cover image URL format.' });
      return;
    }

    const { data: existing } = await supabase
      .from('storefront_products')
      .select('published_at')
      .eq('id', id)
      .maybeSingle();

    const updates: Record<string, unknown> = {
      slug,
      title,
      tagline,
      description_md: descriptionMd,
      tier,
      price_usd: Number(parsedPrice.toFixed(2)),
      checkout_url: checkoutUrl,
      secondary_checkout_url: secondaryCheckoutUrl,
      preview_image_url: previewImageUrl,
      features_json: Array.isArray(body.features_json)
        ? body.features_json.map((f) => String(f).trim()).filter(Boolean)
        : [],
      seo_title: `${title} | AXIAVONE`,
      seo_description: tagline,
      status: statusValue,
      updated_at: new Date().toISOString(),
    };

    if (statusValue === 'published' && !existing?.published_at) {
      updates.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('storefront_products')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      sendJson(res, error?.code === '23505' ? 409 : 500, {
        error: `Failed to update product: ${error?.message || 'Not found'}`,
      });
      return;
    }

    sendJson(res, 200, { product: normalizeProductRow(data as Record<string, unknown>) });
    return;
  }

  if (req.method === 'DELETE') {
    const { data, error } = await supabase
      .from('storefront_products')
      .delete()
      .eq('id', id)
      .select('id, slug, title')
      .maybeSingle();

    if (error) {
      sendJson(res, 500, { error: `Failed to delete product: ${error.message}` });
      return;
    }
    if (!data) {
      sendJson(res, 404, { error: 'Product not found.' });
      return;
    }

    sendJson(res, 200, { ok: true, deleted: data });
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed.' });
}
