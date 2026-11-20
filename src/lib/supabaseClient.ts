import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { PublicProduct, PublicReview } from '../types/storefront.ts';

const PUBLIC_PRODUCT_COLUMNS =
  'id, slug, title, tagline, description_md, tier, price_usd, checkout_url, secondary_checkout_url, preview_image_url, features_json, seo_title, seo_description, keywords, published_at, created_at, updated_at';

const LEGACY_PRODUCT_COLUMNS =
  'id, slug, title, tagline, description_md, tier, price_usd, checkout_url, preview_image_url, features_json, seo_title, seo_description, keywords, published_at, created_at, updated_at';

function getBrowserSupabaseClient(): SupabaseClient | null {
  const url = (
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  ).trim();
  const anonKey = (
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  ).trim();

  if (!url || !anonKey || url.includes('your-project-ref') || !url.startsWith('http')) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function normalizeProduct(row: Record<string, unknown>): PublicProduct {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    tagline: String(row.tagline),
    description_md: String(row.description_md ?? ''),
    tier: row.tier as PublicProduct['tier'],
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
    features_json: Array.isArray(row.features_json)
      ? row.features_json.map((f) => String(f))
      : [],
    seo_title: String(row.seo_title ?? row.title ?? ''),
    seo_description: String(row.seo_description ?? row.tagline ?? ''),
    keywords: Array.isArray(row.keywords) ? row.keywords.map((k) => String(k)) : [],
    published_at: String(row.published_at ?? row.created_at ?? ''),
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

export async function fetchPublishedCatalogClient(): Promise<{
  products: PublicProduct[];
  reviews: PublicReview[];
}> {
  const supabase = getBrowserSupabaseClient();

  if (supabase) {
    let { data: products, error: pErr } = await supabase
      .from('storefront_products')
      .select(PUBLIC_PRODUCT_COLUMNS)
      .eq('status', 'published')
      .order('price_usd', { ascending: false });

    if (pErr && pErr.message.includes('secondary_checkout_url')) {
      const retry = await supabase
        .from('storefront_products')
        .select(LEGACY_PRODUCT_COLUMNS)
        .eq('status', 'published')
        .order('price_usd', { ascending: false });
      products = retry.data as typeof products;
      pErr = retry.error;
    }

    const { data: reviews, error: rErr } = await supabase
      .from('storefront_reviews')
      .select(
        'id, product_id, buyer_name, buyer_country, review_text, rating, is_verified, created_at'
      )
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(8);

    if (!pErr && Array.isArray(products)) {
      return {
        products: products.map((p) => normalizeProduct(p as Record<string, unknown>)),
        reviews: !rErr && Array.isArray(reviews) ? (reviews as PublicReview[]) : [],
      };
    }

    if (pErr) {
      throw new Error(`Supabase catalog query failed: ${pErr.message}`);
    }
  }

  const res = await fetch('/api/products');
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      'Supabase client environment variables (VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL) are not configured.'
    );
  }
  const payload = (await res.json()) as {
    products?: PublicProduct[];
    reviews?: PublicReview[];
    error?: string;
  };
  if (!res.ok) {
    throw new Error(payload.error || 'Unable to load published catalog.');
  }
  return {
    products: Array.isArray(payload.products) ? payload.products : [],
    reviews: Array.isArray(payload.reviews) ? payload.reviews : [],
  };
}

export async function fetchPublishedProductBySlugClient(slug: string): Promise<{
  product: PublicProduct;
  reviews: PublicReview[];
}> {
  const cleanSlug = slug.trim().toLowerCase();
  const supabase = getBrowserSupabaseClient();

  if (supabase) {
    let { data: product, error: pErr } = await supabase
      .from('storefront_products')
      .select(PUBLIC_PRODUCT_COLUMNS)
      .eq('slug', cleanSlug)
      .eq('status', 'published')
      .maybeSingle();

    if (pErr && pErr.message.includes('secondary_checkout_url')) {
      const retry = await supabase
        .from('storefront_products')
        .select(LEGACY_PRODUCT_COLUMNS)
        .eq('slug', cleanSlug)
        .eq('status', 'published')
        .maybeSingle();
      product = retry.data as typeof product;
      pErr = retry.error;
    }

    if (pErr) {
      throw new Error(`Supabase product query failed: ${pErr.message}`);
    }
    if (!product) {
      throw new Error('Product not found.');
    }

    const { data: reviews } = await supabase
      .from('storefront_reviews')
      .select(
        'id, product_id, buyer_name, buyer_country, review_text, rating, is_verified, created_at'
      )
      .eq('product_id', product.id)
      .eq('is_verified', true)
      .order('created_at', { ascending: false });

    return {
      product: normalizeProduct(product as Record<string, unknown>),
      reviews: Array.isArray(reviews) ? (reviews as PublicReview[]) : [],
    };
  }

  const res = await fetch(`/api/products/${encodeURIComponent(cleanSlug)}`);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      'Supabase client environment variables (VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL) are not configured.'
    );
  }
  if (!res.ok) {
    throw new Error(res.status === 404 ? 'Product not found.' : 'Unable to load product.');
  }
  return (await res.json()) as { product: PublicProduct; reviews: PublicReview[] };
}
