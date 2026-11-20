import { createPublicSupabaseClient } from '@/lib/supabase';
import type { StorefrontProduct, StorefrontReview } from '@/lib/types';
import StorefrontCatalog from '@/components/StorefrontCatalog';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createPublicSupabaseClient();

  // Strictly query ONLY public columns via NEXT_PUBLIC_SUPABASE_ANON_KEY.
  // RLS guarantees only status = 'published' and is_verified = true rows are returned.
  const [{ data: products }, { data: reviews }] = await Promise.all([
    supabase
      .from('storefront_products')
      .select(
        'id, slug, title, tagline, description_md, tier, price_usd, checkout_url, preview_image_url, features_json, seo_title, seo_description, keywords, status, published_at, created_at, updated_at'
      )
      .eq('status', 'published')
      .order('price_usd', { ascending: false }),
    supabase
      .from('storefront_reviews')
      .select('id, product_id, buyer_name, buyer_country, review_text, rating, is_verified, created_at')
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  const safeProducts = ((products ?? []) as StorefrontProduct[]).map((p) => ({
    ...p,
    price_usd: Number(p.price_usd),
    features_json: Array.isArray(p.features_json) ? p.features_json : [],
    keywords: Array.isArray(p.keywords) ? p.keywords : [],
  }));

  const safeReviews = (reviews ?? []) as StorefrontReview[];

  return <StorefrontCatalog products={safeProducts} reviews={safeReviews} />;
}
