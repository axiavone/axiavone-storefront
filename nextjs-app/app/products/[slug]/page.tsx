import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, ArrowUpRight, Check, ShieldCheck, Star } from 'lucide-react';
import { createPublicSupabaseClient } from '@/lib/supabase';
import { TIER_LABELS, type StorefrontProduct, type StorefrontReview } from '@/lib/types';
import ProductCover from '@/components/ProductCover';
import SocialLinks from '@/components/SocialLinks';
import {
  AXIAVONE_LOGO_URL,
  formatUsdPrice,
  sanitizeExternalUrl,
} from '@/config/productCovers';

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getPublishedProductBySlug(slug: string): Promise<{
  product: StorefrontProduct | null;
  reviews: StorefrontReview[];
}> {
  const supabase = createPublicSupabaseClient();

  const { data: product } = await supabase
    .from('storefront_products')
    .select(
      'id, slug, title, tagline, description_md, tier, price_usd, checkout_url, secondary_checkout_url, preview_image_url, features_json, seo_title, seo_description, keywords, status, published_at, created_at, updated_at'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!product) {
    return { product: null, reviews: [] };
  }

  const { data: reviews } = await supabase
    .from('storefront_reviews')
    .select('id, product_id, buyer_name, buyer_country, review_text, rating, is_verified, created_at')
    .eq('product_id', product.id)
    .eq('is_verified', true)
    .order('created_at', { ascending: false });

  return {
    product: {
      ...(product as StorefrontProduct),
      price_usd: Number(product.price_usd),
      secondary_checkout_url: (product as StorefrontProduct).secondary_checkout_url || null,
      features_json: Array.isArray(product.features_json) ? product.features_json : [],
      keywords: Array.isArray(product.keywords) ? product.keywords : [],
    },
    reviews: (reviews ?? []) as StorefrontReview[],
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getPublishedProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | AXIAVONE',
      robots: { index: false, follow: false },
    };
  }

  const images = product.preview_image_url
    ? [
        {
          url: product.preview_image_url,
          width: 1200,
          height: 900,
          alt: product.title,
        },
      ]
    : undefined;

  return {
    title: product.seo_title || `${product.title} | AXIAVONE`,
    description: product.seo_description || product.tagline,
    keywords: product.keywords,
    openGraph: {
      title: product.seo_title || `${product.title} | AXIAVONE`,
      description: product.seo_description || product.tagline,
      type: 'website',
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seo_title || `${product.title} | AXIAVONE`,
      description: product.seo_description || product.tagline,
      ...(product.preview_image_url ? { images: [product.preview_image_url] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { product, reviews } = await getPublishedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090B]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
          >
            <span className="h-9 w-9 overflow-hidden rounded-lg border border-white/15 bg-[#0D1117] shrink-0">
              <img
                src={AXIAVONE_LOGO_URL}
                alt="AXIAVONE logo"
                className="h-full w-full object-cover object-[50%_20%] scale-[1.55]"
              />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white group-hover:text-[#60A5FA] transition-colors">
              AXIAVONE
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="/#catalog" className="hover:text-white transition-colors whitespace-nowrap">
              Catalog
            </Link>
            <Link href="/#architecture" className="hover:text-white transition-colors whitespace-nowrap">
              Architecture
            </Link>
            <Link href="/#reviews" className="hover:text-white transition-colors whitespace-nowrap">
              Reviews
            </Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={sanitizeExternalUrl(product.checkout_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
            >
              {product.price_usd === 0 ? 'Download Free' : `Buy — ${formatUsdPrice(product.price_usd)}`}
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Visual Showcase, Full Markdown Spec, Verified Reviews */}
          <div className="lg:col-span-7 space-y-10">
            <div>
              <p className="text-xs text-zinc-400 mb-3">
                {TIER_LABELS[product.tier]} · Instant Digital Delivery · USD
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white [text-wrap:balance]">
                {product.title}
              </h1>
              <p className="mt-4 text-base text-zinc-400 leading-relaxed">{product.tagline}</p>
            </div>

            <div className="aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-[#111113]">
              <ProductCover
                slug={product.slug}
                title={product.title}
                tier={product.tier}
                priceUsd={product.price_usd}
                imageUrl={product.preview_image_url}
              />
            </div>

            <article className="space-y-4 border-t border-white/10 pt-8 text-[15px] leading-relaxed text-zinc-300">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="font-display text-2xl font-semibold tracking-tight text-white pt-4 pb-1 [text-wrap:balance]">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-display text-lg font-semibold tracking-tight text-white pt-3 pb-1">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => <p className="text-zinc-300 leading-7">{children}</p>,
                  ul: ({ children }) => (
                    <ul className="space-y-2.5 pl-5 list-disc marker:text-[#3B82F6]">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="space-y-2.5 pl-5 list-decimal marker:text-zinc-400 marker:font-mono">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="text-zinc-300 leading-relaxed">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                  code: ({ children }) => (
                    <code className="rounded bg-[#18181B] px-1.5 py-0.5 font-mono text-[13px] text-zinc-100 border border-white/10">
                      {children}
                    </code>
                  ),
                }}
              >
                {(product.description_md || '').replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n')}
              </ReactMarkdown>
            </article>

            {/* Product-Specific Verified Reviews */}
            <section className="border-t border-white/10 pt-8">
              <h2 className="font-display text-xl font-semibold text-white mb-6">
                Verified Buyer Reviews
              </h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Verified customer reviews appear here once confirmed via checkout.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-white/10 bg-[#111113] p-5"
                    >
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
                        <span className="inline-flex items-center gap-1.5 text-zinc-300">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#3B82F6]" aria-hidden="true" />
                          Verified Buyer · {review.buyer_country}
                        </span>
                        <span className="inline-flex items-center gap-1 font-mono text-zinc-300 tabular-nums">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                          {review.rating}.0
                        </span>
                      </div>
                      <p className="text-sm text-zinc-200 leading-relaxed">
                        &ldquo;{review.review_text}&rdquo;
                      </p>
                      <div className="mt-3 text-xs font-medium text-zinc-400">
                        {review.buyer_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Sticky Contiguous Purchase Card */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="rounded-xl border border-white/15 bg-[#111113] p-6 sm:p-8">
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <div className="text-xs text-zinc-400">{TIER_LABELS[product.tier]} License</div>
                  <div className="mt-1 font-mono text-3xl font-semibold text-white tabular-nums">
                    {product.price_usd === 0 ? '$0' : formatUsdPrice(product.price_usd)}
                    <span className="ml-1.5 text-sm font-normal text-zinc-400">USD</span>
                  </div>
                </div>
                <span className="text-xs text-zinc-400">One-time payment</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                {product.features_json.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-[#3B82F6] mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-3">
                <a
                  href={sanitizeExternalUrl(product.checkout_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
                >
                  {product.price_usd === 0
                    ? 'Download Free Package (Polar.sh)'
                    : `Pay with Card / Apple Pay — ${formatUsdPrice(product.price_usd)} USD`}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>

                {product.secondary_checkout_url && (
                  <a
                    href={sanitizeExternalUrl(product.secondary_checkout_url, 'https://lemonsqueezy.com')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#18181B] px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-white/30 hover:text-white"
                  >
                    {product.price_usd === 0
                      ? 'Mirror Download (Lemon Squeezy)'
                      : 'Pay with PayPal / Card (Lemon Squeezy)'}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-zinc-400">
                Instant delivery via Polar.sh &amp; Lemon Squeezy · Card, Apple Pay, PayPal &amp; US/UK/CA/AU tax invoices supported
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-[#09090B]">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-8 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <img
              src={AXIAVONE_LOGO_URL}
              alt="AXIAVONE"
              className="h-9 w-9 rounded-lg border border-white/10 object-cover shrink-0"
            />
            <div>
              <span className="font-display font-semibold text-white">AXIAVONE</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>© {new Date().getFullYear()} AXIAVONE Digital Products. All rights reserved.</span>
            </div>
          </div>
          <SocialLinks />
        </div>
      </footer>
    </div>
  );
}
