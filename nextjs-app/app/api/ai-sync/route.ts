import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'node:crypto';
import { createServiceRoleSupabaseClient } from '@/lib/supabase';
import type { ProductStatus, ProductTier } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_TIERS: ProductTier[] = ['free_lead', 'core_12', 'pro_19', 'flagship_29'];
const VALID_STATUSES: ProductStatus[] = ['draft', 'qa_review', 'published', 'archived'];
const VALID_DIVISIONS = ['DIV-08', 'DIV-09', 'DIV-15', 'DIV-19', 'DIV-21'] as const;

interface SyncProductPayload {
  action?: 'upsert_product';
  product: {
    slug: string;
    title: string;
    tagline: string;
    description_md: string;
    tier: ProductTier;
    price_usd: number;
    checkout_url: string;
    preview_image_url: string;
    features_json: string[];
    seo_title: string;
    seo_description: string;
    keywords?: string[];
    status: ProductStatus;
    created_by_division: string;
  };
}

interface SyncReviewPayload {
  action: 'add_review';
  review: {
    product_slug: string;
    buyer_name: string;
    buyer_country: string;
    review_text: string;
    rating: number;
    is_verified: boolean;
  };
}

type SyncPayload = SyncProductPayload | SyncReviewPayload;

function verifyBearerSecret(authHeader: string | null): boolean {
  const expectedSecret = process.env.AXIAVONE_INTERNAL_SECRET;
  if (!expectedSecret || !authHeader) return false;

  const prefix = 'Bearer ';
  if (!authHeader.startsWith(prefix)) return false;

  const provided = authHeader.slice(prefix.length).trim();
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expectedSecret, 'utf8');

  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return value.startsWith('/');
  }
}

export async function POST(request: NextRequest) {
  // 1. Constant-time Bearer authentication check
  if (!verifyBearerSecret(request.headers.get('authorization'))) {
    return NextResponse.json(
      { error: 'Unauthorized: invalid or missing bearer credential.' },
      { status: 401 }
    );
  }

  let body: SyncPayload;
  try {
    body = (await request.json()) as SyncPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();

  // 2. Handle verified review ingestion (DIV-19 Social Proof)
  if (body.action === 'add_review') {
    const { review } = body;
    if (
      !review ||
      typeof review.product_slug !== 'string' ||
      typeof review.buyer_name !== 'string' ||
      typeof review.buyer_country !== 'string' ||
      typeof review.review_text !== 'string' ||
      typeof review.rating !== 'number' ||
      review.rating < 1 ||
      review.rating > 5
    ) {
      return NextResponse.json(
        { error: 'Validation failed for add_review payload.' },
        { status: 422 }
      );
    }

    const { data: product, error: lookupError } = await supabase
      .from('storefront_products')
      .select('id, slug')
      .eq('slug', review.product_slug.trim())
      .single();

    if (lookupError || !product) {
      return NextResponse.json(
        { error: `Product not found for slug: ${review.product_slug}` },
        { status: 404 }
      );
    }

    const { data: insertedReview, error: insertError } = await supabase
      .from('storefront_reviews')
      .insert({
        product_id: product.id,
        buyer_name: review.buyer_name.trim(),
        buyer_country: review.buyer_country.trim(),
        review_text: review.review_text.trim(),
        rating: Math.round(review.rating),
        is_verified: Boolean(review.is_verified),
      })
      .select('id, created_at')
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to insert verified review.' },
        { status: 500 }
      );
    }

    revalidatePath('/');
    revalidatePath(`/products/${product.slug}`);

    return NextResponse.json(
      {
        ok: true,
        action: 'add_review',
        review_id: insertedReview.id,
        revalidated: ['/', `/products/${product.slug}`],
      },
      { status: 201 }
    );
  }

  // 3. Handle product upsert by slug (DIV-08 / DIV-09 / DIV-15 / DIV-21)
  const product = (body as SyncProductPayload).product;
  if (!product) {
    return NextResponse.json(
      { error: 'Missing required product payload.' },
      { status: 422 }
    );
  }

  const slug = typeof product.slug === 'string' ? product.slug.trim().toLowerCase() : '';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json(
      { error: 'Invalid slug format. Use lowercase kebab-case (e.g. my-product-kit).' },
      { status: 422 }
    );
  }

  if (
    !product.title?.trim() ||
    !product.tagline?.trim() ||
    !product.description_md?.trim() ||
    !VALID_TIERS.includes(product.tier) ||
    typeof product.price_usd !== 'number' ||
    product.price_usd < 0 ||
    !isValidUrl(product.checkout_url) ||
    !isValidUrl(product.preview_image_url) ||
    !Array.isArray(product.features_json) ||
    !product.seo_title?.trim() ||
    !product.seo_description?.trim() ||
    !VALID_STATUSES.includes(product.status)
  ) {
    return NextResponse.json(
      { error: 'Validation failed: check required product fields, tier, price_usd, URLs, and status.' },
      { status: 422 }
    );
  }

  const division = VALID_DIVISIONS.includes(
    product.created_by_division as (typeof VALID_DIVISIONS)[number]
  )
    ? product.created_by_division
    : 'DIV-08';

  const record = {
    slug,
    title: product.title.trim(),
    tagline: product.tagline.trim(),
    description_md: product.description_md,
    tier: product.tier,
    price_usd: Number(product.price_usd.toFixed(2)),
    checkout_url: product.checkout_url.trim(),
    preview_image_url: product.preview_image_url.trim(),
    features_json: product.features_json.map((f) => String(f).trim()).filter(Boolean),
    seo_title: product.seo_title.trim(),
    seo_description: product.seo_description.trim(),
    keywords: Array.isArray(product.keywords)
      ? product.keywords.map((k) => String(k).trim()).filter(Boolean)
      : [],
    status: product.status,
    created_by_division: division,
    published_at: product.status === 'published' ? new Date().toISOString() : null,
  };

  const { data: upserted, error: upsertError } = await supabase
    .from('storefront_products')
    .upsert(record, { onConflict: 'slug' })
    .select('id, slug, status, updated_at')
    .single();

  if (upsertError || !upserted) {
    return NextResponse.json(
      { error: 'Database upsert failed.' },
      { status: 500 }
    );
  }

  // Trigger instant ISR cache invalidation across storefront routes
  revalidatePath('/');
  revalidatePath(`/products/${upserted.slug}`);
  revalidatePath('/sitemap.xml');

  return NextResponse.json(
    {
      ok: true,
      action: 'upsert_product',
      id: upserted.id,
      slug: upserted.slug,
      status: upserted.status,
      updated_at: upserted.updated_at,
      revalidated: ['/', `/products/${upserted.slug}`, '/sitemap.xml'],
    },
    { status: 200 }
  );
}
