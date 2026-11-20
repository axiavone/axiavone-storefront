declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __AXIAVONE_GA_ID__?: string;
  }
}

let lastTrackedPath: string | null = null;

function upsertMetaTag(
  selector: string,
  createAttr: 'name' | 'property',
  attrValue: string,
  content: string
): void {
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(createAttr, attrValue);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function syncRobotsAndCanonical(isAdminRoute: boolean, pathname: string): void {
  if (typeof document === 'undefined') return;

  upsertMetaTag(
    'meta[name="robots"]',
    'name',
    'robots',
    isAdminRoute ? 'noindex, nofollow' : 'index, follow'
  );

  if (isAdminRoute || typeof window === 'undefined') return;

  const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const canonicalHref = `${window.location.origin}${cleanPath}`;

  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalHref);

  upsertMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalHref);
}

export function trackSpaPageView(pathname: string): void {
  if (typeof window === 'undefined') return;
  const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');

  // Never track internal admin views in public GA4 reporting
  if (/^\/admin$/.test(cleanPath)) return;

  // Initial load is already recorded by gtag('config', ...) in <head>
  if (lastTrackedPath === null) {
    lastTrackedPath = cleanPath;
    return;
  }

  if (lastTrackedPath === cleanPath) return;
  lastTrackedPath = cleanPath;

  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: cleanPath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
}
