import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://store.axiavone.com').replace(
    /\/+$/,
    ''
  );

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/products/'],
        disallow: ['/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
