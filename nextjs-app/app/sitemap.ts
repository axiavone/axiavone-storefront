import type { MetadataRoute } from 'next';
import { createPublicSupabaseClient } from '@/lib/supabase';

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://store.axiavone.com').replace(
    /\/+$/,
    ''
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  try {
    const supabase = createPublicSupabaseClient();
    const { data: products } = await supabase
      .from('storefront_products')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: new Date(product.updated_at || product.published_at || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.9,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
