export const AXIAVONE_LOGO_URL = '/assets/aistudio/104017_238e6757.jpg';

/**
 * Curated high-resolution dark-mode product covers keyed by product slug.
 * Overrides legacy /images/products/*.svg paths while respecting any new custom URLs.
 */
export const PRODUCT_COVER_OVERRIDES: Record<string, string> = {
  'ai-micro-saas-launch-security-audit': '/assets/aistudio/105378_63d7123b.jpg',
  'humanized-b2b-cold-outreach-system': '/assets/aistudio/105367_b4d4a9b1.jpg',
  'zero-leak-supabase-rls-auth-boilerplate': '/assets/aistudio/105369_c4248328.jpg',
  'global-checkout-webhook-automation-kit': '/assets/aistudio/105371_8472fba0.jpg',
  'autonomous-solopreneur-multi-agent-blueprint': '/assets/aistudio/105373_1d2fee46.jpg',
};

export function resolveProductCoverUrl(slug: string, imageUrl: string | null): string | null {
  const override = PRODUCT_COVER_OVERRIDES[slug];
  const trimmed = imageUrl ? imageUrl.trim() : '';

  if (override && (!trimmed || trimmed.startsWith('/images/products/'))) {
    return override;
  }

  return trimmed || null;
}

export function sanitizeExternalUrl(url: string | null | undefined, fallback = 'https://polar.sh'): string {
  if (!url) return fallback;
  const trimmed = url.trim();
  if (trimmed.startsWith('/')) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
  } catch {
    return fallback;
  }
  return fallback;
}

export function formatUsdPrice(priceUsd: number): string {
  if (priceUsd === 0) return 'Free';
  return Number.isInteger(priceUsd) ? `$${priceUsd.toFixed(0)}` : `$${priceUsd.toFixed(2)}`;
}
