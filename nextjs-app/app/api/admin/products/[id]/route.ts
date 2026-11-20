import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminRequestAuthenticated, isValidUrl } from '@/lib/adminAuth';
import { createServiceRoleSupabaseClient } from '@/lib/supabase';
import type { ProductStatus, ProductTier } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_TIERS: ProductTier[] = ['free_lead', 'core_12', 'pro_19', 'flagship_29'];
const VALID_STATUSES: ProductStatus[] = ['draft', 'qa_review', 'published', 'archived'];

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized: admin login required.' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : '';
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const tagline = typeof body.tagline === 'string' ? body.tagline.trim() : '';
  const descriptionMd = (typeof body.description_md === 'string' ? body.description_md.trim() : '') || tagline;
  const tier = body.tier as ProductTier;
  const statusValue: ProductStatus =
    typeof body.status === 'string' && VALID_STATUSES.includes(body.status as ProductStatus)
      ? (body.status as ProductStatus)
      : 'draft';

  const parsedPrice =
    typeof body.price_usd === 'number'
      ? body.price_usd
      : typeof body.price_usd === 'string' && body.price_usd.trim() !== ''
        ? Number(body.price_usd)
        : NaN;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ error: 'Slug must use lowercase kebab-case.' }, { status: 422 });
  }
  if (!title || !tagline || !VALID_TIERS.includes(tier) || Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return NextResponse.json(
      { error: 'Title, slug, tagline, valid tier, and non-negative price are required.' },
      { status: 422 }
    );
  }

  const checkoutUrl =
    typeof body.checkout_url === 'string' && body.checkout_url.trim()
      ? body.checkout_url.trim()
      : 'https://polar.sh';
  if (!isValidUrl(checkoutUrl)) {
    return NextResponse.json({ error: 'Invalid checkout URL format.' }, { status: 422 });
  }

  const secondaryCheckoutUrl =
    typeof body.secondary_checkout_url === 'string' && body.secondary_checkout_url.trim()
      ? body.secondary_checkout_url.trim()
      : null;
  if (secondaryCheckoutUrl && !isValidUrl(secondaryCheckoutUrl)) {
    return NextResponse.json({ error: 'Invalid secondary checkout URL format.' }, { status: 422 });
  }

  const rawImage =
    typeof body.preview_image_url === 'string'
      ? body.preview_image_url.trim()
      : typeof body.image_url === 'string'
        ? body.image_url.trim()
        : '';
  const previewImageUrl = rawImage || null;
  if (previewImageUrl && !isValidUrl(previewImageUrl)) {
    return NextResponse.json({ error: 'Invalid cover image URL format.' }, { status: 422 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const { data: existing } = await supabase
    .from('storefront_products')
    .select('published_at, slug')
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
    return NextResponse.json(
      { error: `Failed to update product: ${error?.message || 'Not found'}` },
      { status: error?.code === '23505' ? 409 : 500 }
    );
  }

  revalidatePath('/');
  revalidatePath(`/products/${data.slug}`);
  if (existing?.slug && existing.slug !== data.slug) {
    revalidatePath(`/products/${existing.slug}`);
  }
  revalidatePath('/sitemap.xml');

  return NextResponse.json({ product: { ...data, price_usd: Number(data.price_usd) } });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized: admin login required.' }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from('storefront_products')
    .delete()
    .eq('id', id)
    .select('id, slug, title')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: `Failed to delete product: ${error.message}` }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  revalidatePath('/');
  revalidatePath(`/products/${data.slug}`);
  revalidatePath('/sitemap.xml');

  return NextResponse.json({ ok: true, deleted: data });
}
