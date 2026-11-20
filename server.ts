import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { type Request, type Response } from 'express';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';
import { SEED_PRODUCTS, SEED_REVIEWS } from './src/data/seedCatalog.ts';
import type { ProductStatus, ProductTier, PublicProduct, PublicReview } from './src/types/storefront.ts';

interface InternalProductRecord extends PublicProduct {
  status: ProductStatus;
  created_by_division: string;
}

const VALID_TIERS: ProductTier[] = ['free_lead', 'core_12', 'pro_19', 'flagship_29'];
const VALID_STATUSES: ProductStatus[] = ['draft', 'qa_review', 'published', 'archived'];

// In-memory store initialized from seeded published products for immediate preview
const localProducts: InternalProductRecord[] = SEED_PRODUCTS.map((p) => ({
  ...p,
  status: 'published',
  created_by_division: 'DIV-08',
}));
const localReviews: PublicReview[] = [...SEED_REVIEWS];

function getSupabasePublic(): SupabaseClient | null {
  try {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
    const anonKey = (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      ''
    ).trim();
    if (!url || !anonKey || url.includes('your-project-ref') || !url.startsWith('http')) {
      return null;
    }
    return createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  } catch (err) {
    console.error('[supabase-public] client init failed:', err);
    return null;
  }
}

function getSupabaseAdmin(): SupabaseClient | null {
  try {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    if (!url || !serviceKey || url.includes('your-project-ref') || !url.startsWith('http')) {
      return null;
    }
    return createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err) {
    console.error('[supabase-admin] client init failed:', err);
    return null;
  }
}

function toPublicProduct(record: InternalProductRecord): PublicProduct {
  const { status: _status, created_by_division: _div, ...publicFields } = record;
  return publicFields;
}

function verifyBearerSecret(authHeader: string | undefined): boolean {
  const expectedSecret = process.env.AXIAVONE_INTERNAL_SECRET;
  if (!expectedSecret || !authHeader) return false;
  if (!authHeader.startsWith('Bearer ')) return false;
  const provided = authHeader.slice(7).trim();
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

const PUBLIC_COLS =
  'id, slug, title, tagline, description_md, tier, price_usd, checkout_url, secondary_checkout_url, preview_image_url, features_json, seo_title, seo_description, keywords, published_at, created_at, updated_at';
const LEGACY_COLS =
  'id, slug, title, tagline, description_md, tier, price_usd, checkout_url, preview_image_url, features_json, seo_title, seo_description, keywords, published_at, created_at, updated_at';

async function fetchPublishedCatalog(): Promise<{
  products: PublicProduct[];
  reviews: PublicReview[];
}> {
  const supabase = getSupabasePublic();
  if (supabase) {
    let { data: products, error: pErr } = await supabase
      .from('storefront_products')
      .select(PUBLIC_COLS)
      .eq('status', 'published')
      .order('price_usd', { ascending: false });

    if (pErr && pErr.message.includes('secondary_checkout_url')) {
      const retry = await supabase
        .from('storefront_products')
        .select(LEGACY_COLS)
        .eq('status', 'published')
        .order('price_usd', { ascending: false });
      products = retry.data as typeof products;
      pErr = retry.error;
    }

    const { data: reviews, error: rErr } = await supabase
      .from('storefront_reviews')
      .select('id, product_id, buyer_name, buyer_country, review_text, rating, is_verified, created_at')
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(8);

    if (pErr) {
      console.error('[storefront] Supabase storefront_products query error:', pErr.message);
    }
    if (rErr) {
      console.error('[storefront] Supabase storefront_reviews query error:', rErr.message);
    }

    if (!pErr && Array.isArray(products)) {
      return {
        products: products.map((p) => ({
          ...(p as PublicProduct),
          price_usd: Number(p.price_usd),
          secondary_checkout_url: (p as { secondary_checkout_url?: string | null }).secondary_checkout_url || null,
          preview_image_url: p.preview_image_url || null,
          features_json: Array.isArray(p.features_json) ? p.features_json : [],
          keywords: Array.isArray(p.keywords) ? p.keywords : [],
        })),
        reviews: !rErr && Array.isArray(reviews) ? (reviews as PublicReview[]) : [],
      };
    }
  }

  const published = localProducts
    .filter((p) => p.status === 'published')
    .sort((a, b) => b.price_usd - a.price_usd)
    .map(toPublicProduct);

  const publishedIds = new Set(published.map((p) => p.id));
  const verifiedReviews = localReviews.filter(
    (r) => r.is_verified && publishedIds.has(r.product_id)
  );

  return { products: published, reviews: verifiedReviews };
}

async function fetchPublishedBySlug(
  slug: string
): Promise<{ product: PublicProduct; reviews: PublicReview[] } | null> {
  const supabase = getSupabasePublic();
  if (supabase) {
    let { data: product, error: pErr } = await supabase
      .from('storefront_products')
      .select(PUBLIC_COLS)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (pErr && pErr.message.includes('secondary_checkout_url')) {
      const retry = await supabase
        .from('storefront_products')
        .select(LEGACY_COLS)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      product = retry.data as typeof product;
      pErr = retry.error;
    }

    if (pErr) {
      console.error('[storefront] Supabase product detail query error:', pErr.message);
    }

    if (!pErr) {
      if (!product) return null;

      const { data: reviews, error: rErr } = await supabase
        .from('storefront_reviews')
        .select('id, product_id, buyer_name, buyer_country, review_text, rating, is_verified, created_at')
        .eq('product_id', product.id)
        .eq('is_verified', true)
        .order('created_at', { ascending: false });

      if (rErr) {
        console.error('[storefront] Supabase product reviews query error:', rErr.message);
      }

      return {
        product: {
          ...(product as PublicProduct),
          price_usd: Number(product.price_usd),
          secondary_checkout_url: (product as { secondary_checkout_url?: string | null }).secondary_checkout_url || null,
          preview_image_url: product.preview_image_url || null,
          features_json: Array.isArray(product.features_json) ? product.features_json : [],
          keywords: Array.isArray(product.keywords) ? product.keywords : [],
        },
        reviews: !rErr && Array.isArray(reviews) ? (reviews as PublicReview[]) : [],
      };
    }
  }

  const found = localProducts.find((p) => p.slug === slug && p.status === 'published');
  if (!found) return null;

  const reviews = localReviews.filter((r) => r.product_id === found.id && r.is_verified);
  return { product: toPublicProduct(found), reviews };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Public read-only catalog endpoint (strictly published & verified)
  app.get('/api/products', async (_req: Request, res: Response) => {
    try {
      const data = await fetchPublishedCatalog();
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      res.json(data);
    } catch {
      res.status(500).json({ error: 'Unable to load storefront catalog.' });
    }
  });

  // Public read-only product detail endpoint
  app.get('/api/products/:slug', async (req: Request, res: Response) => {
    try {
      const slug = String(req.params.slug || '').trim().toLowerCase();
      const detail = await fetchPublishedBySlug(slug);
      if (!detail) {
        res.status(404).json({ error: 'Product not found.' });
        return;
      }
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      res.json(detail);
    } catch {
      res.status(500).json({ error: 'Unable to load product details.' });
    }
  });

  // Protected AI Division Sync endpoint
  app.post('/api/ai-sync', async (req: Request, res: Response) => {
    if (!verifyBearerSecret(req.headers.authorization)) {
      res.status(401).json({ error: 'Unauthorized: invalid or missing bearer credential.' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid JSON request body.' });
      return;
    }

    const adminSupabase = getSupabaseAdmin();

    if (body.action === 'add_review') {
      const review = body.review as Record<string, unknown> | undefined;
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
        res.status(422).json({ error: 'Validation failed for add_review payload.' });
        return;
      }

      const productSlug = review.product_slug.trim().toLowerCase();

      if (adminSupabase) {
        const { data: prod } = await adminSupabase
          .from('storefront_products')
          .select('id, slug')
          .eq('slug', productSlug)
          .single();

        if (!prod) {
          res.status(404).json({ error: `Product not found for slug: ${productSlug}` });
          return;
        }

        const { data: inserted, error: err } = await adminSupabase
          .from('storefront_reviews')
          .insert({
            product_id: prod.id,
            buyer_name: review.buyer_name.trim(),
            buyer_country: review.buyer_country.trim(),
            review_text: review.review_text.trim(),
            rating: Math.round(review.rating),
            is_verified: Boolean(review.is_verified),
          })
          .select('id, created_at')
          .single();

        if (err || !inserted) {
          res.status(500).json({ error: 'Failed to insert verified review.' });
          return;
        }

        res.status(201).json({
          ok: true,
          action: 'add_review',
          review_id: inserted.id,
          revalidated: ['/', `/products/${prod.slug}`],
        });
        return;
      }

      const target = localProducts.find((p) => p.slug === productSlug);
      if (!target) {
        res.status(404).json({ error: `Product not found for slug: ${productSlug}` });
        return;
      }

      const newReview: PublicReview = {
        id: crypto.randomUUID(),
        product_id: target.id,
        buyer_name: review.buyer_name.trim(),
        buyer_country: review.buyer_country.trim(),
        review_text: review.review_text.trim(),
        rating: Math.round(review.rating),
        is_verified: Boolean(review.is_verified),
        created_at: new Date().toISOString(),
      };
      localReviews.unshift(newReview);

      res.status(201).json({
        ok: true,
        action: 'add_review',
        review_id: newReview.id,
        revalidated: ['/', `/products/${target.slug}`],
      });
      return;
    }

    // Support both { action: 'upsert_product', product: { ... } } and top-level product payload
    const product = (
      body.product && typeof body.product === 'object' ? body.product : body
    ) as Record<string, unknown>;

    const slug = typeof product.slug === 'string' ? product.slug.trim().toLowerCase() : '';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      res.status(422).json({ error: 'Invalid slug format. Use lowercase kebab-case.' });
      return;
    }

    const parsedPrice =
      typeof product.price_usd === 'number'
        ? product.price_usd
        : typeof product.price_usd === 'string' && product.price_usd.trim() !== ''
          ? Number(product.price_usd)
          : NaN;

    const rawPreview =
      typeof product.preview_image_url === 'string' ? product.preview_image_url.trim() : '';
    const previewImageUrl = rawPreview ? rawPreview : null;

    if (previewImageUrl && !isValidUrl(previewImageUrl)) {
      res.status(422).json({ error: 'Invalid preview_image_url format.' });
      return;
    }

    const checkoutUrl =
      typeof product.checkout_url === 'string' && product.checkout_url.trim()
        ? product.checkout_url.trim()
        : 'https://polar.sh';

    if (!isValidUrl(checkoutUrl)) {
      res.status(422).json({ error: 'Invalid checkout_url format.' });
      return;
    }

    const statusValue: ProductStatus =
      typeof product.status === 'string' && VALID_STATUSES.includes(product.status as ProductStatus)
        ? (product.status as ProductStatus)
        : 'draft';

    if (
      typeof product.title !== 'string' ||
      !product.title.trim() ||
      typeof product.tagline !== 'string' ||
      !product.tagline.trim() ||
      typeof product.description_md !== 'string' ||
      !product.description_md.trim() ||
      !VALID_TIERS.includes(product.tier as ProductTier) ||
      Number.isNaN(parsedPrice) ||
      parsedPrice < 0
    ) {
      res.status(422).json({
        error:
          'Validation failed: required fields are slug, title, tagline, description_md, tier, and non-negative price_usd.',
      });
      return;
    }

    const now = new Date().toISOString();
    const title = product.title.trim();
    const tagline = product.tagline.trim();
    const seoTitle =
      typeof product.seo_title === 'string' && product.seo_title.trim()
        ? product.seo_title.trim()
        : `${title} | AXIAVONE`;
    const seoDescription =
      typeof product.seo_description === 'string' && product.seo_description.trim()
        ? product.seo_description.trim()
        : tagline;

    const rawSecondary =
      typeof product.secondary_checkout_url === 'string'
        ? product.secondary_checkout_url.trim()
        : '';
    const secondaryCheckoutUrl = rawSecondary ? rawSecondary : null;

    if (secondaryCheckoutUrl && !isValidUrl(secondaryCheckoutUrl)) {
      res.status(422).json({ error: 'Invalid secondary_checkout_url format.' });
      return;
    }

    const record = {
      slug,
      title,
      tagline,
      description_md: product.description_md,
      tier: product.tier as ProductTier,
      price_usd: Number(parsedPrice.toFixed(2)),
      checkout_url: checkoutUrl,
      secondary_checkout_url: secondaryCheckoutUrl,
      preview_image_url: previewImageUrl,
      features_json: Array.isArray(product.features_json)
        ? product.features_json.map((f) => String(f).trim()).filter(Boolean)
        : [],
      seo_title: seoTitle,
      seo_description: seoDescription,
      keywords: Array.isArray(product.keywords)
        ? product.keywords.map((k) => String(k).trim()).filter(Boolean)
        : [],
      status: statusValue,
      created_by_division:
        typeof product.created_by_division === 'string' && product.created_by_division.trim()
          ? product.created_by_division.trim()
          : 'DIV-08',
      published_at: statusValue === 'published' ? now : null,
    };

    if (adminSupabase) {
      const { data: upserted, error: upsertError } = await adminSupabase
        .from('storefront_products')
        .upsert(record, { onConflict: 'slug' })
        .select('id, slug, status, updated_at')
        .single();

      if (upsertError || !upserted) {
        console.error('[ai-sync] Supabase upsert failed:', upsertError?.message);
        res.status(500).json({ error: 'Database upsert failed.' });
        return;
      }

      res.json({
        ok: true,
        action: 'upsert_product',
        id: upserted.id,
        slug: upserted.slug,
        status: upserted.status,
        updated_at: upserted.updated_at,
        revalidated: ['/', `/products/${upserted.slug}`, '/sitemap.xml'],
      });
      return;
    }

    const existingIdx = localProducts.findIndex((p) => p.slug === slug);
    const id = existingIdx >= 0 ? localProducts[existingIdx].id : crypto.randomUUID();
    const createdAt = existingIdx >= 0 ? localProducts[existingIdx].created_at : now;

    const fullRecord: InternalProductRecord = {
      id,
      slug: record.slug,
      title: record.title,
      tagline: record.tagline,
      description_md: record.description_md,
      tier: record.tier,
      price_usd: record.price_usd,
      checkout_url: record.checkout_url,
      secondary_checkout_url: record.secondary_checkout_url,
      preview_image_url: record.preview_image_url,
      features_json: record.features_json,
      seo_title: record.seo_title,
      seo_description: record.seo_description,
      keywords: record.keywords,
      status: record.status,
      created_by_division: record.created_by_division,
      published_at: record.published_at || createdAt,
      created_at: createdAt,
      updated_at: now,
    };

    if (existingIdx >= 0) {
      localProducts[existingIdx] = fullRecord;
    } else {
      localProducts.unshift(fullRecord);
    }

    res.json({
      ok: true,
      action: 'upsert_product',
      id: fullRecord.id,
      slug: fullRecord.slug,
      status: fullRecord.status,
      updated_at: fullRecord.updated_at,
      revalidated: ['/', `/products/${fullRecord.slug}`, '/sitemap.xml'],
    });
  });

  // Dynamic XML Sitemap from published products
  app.get('/sitemap.xml', async (req: Request, res: Response) => {
    const baseUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.APP_URL ||
      `https://${req.get('host') || 'store.axiavone.com'}`
    ).replace(/\/+$/, '');

    const { products } = await fetchPublishedCatalog();
    const urls = [
      `<url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      ...products.map(
        (p) =>
          `<url><loc>${baseUrl}/products/${p.slug}</loc><lastmod>${new Date(
            p.updated_at || p.published_at
          ).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>`
      ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  });

  // Dynamic robots.txt blocking /api/
  app.get('/robots.txt', (req: Request, res: Response) => {
    const baseUrl = (
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.APP_URL ||
      `https://${req.get('host') || 'store.axiavone.com'}`
    ).replace(/\/+$/, '');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(
      `User-agent: *\nAllow: /\nAllow: /products/\nDisallow: /api/\n\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`AXIAVONE Storefront running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AXIAVONE Storefront server:', err);
  process.exit(1);
});
