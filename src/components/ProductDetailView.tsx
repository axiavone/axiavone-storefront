import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, ShieldCheck, Star } from 'lucide-react';
import {
  TIER_LABELS,
  type PublicProduct,
  type PublicReview,
} from '../types/storefront.ts';
import { fetchPublishedProductBySlugClient } from '../lib/supabaseClient.ts';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';
import { ProductCover } from './ProductCover.tsx';

interface ProductDetailViewProps {
  slug: string;
  onNavigateHome: () => void;
}

export function ProductDetailView({ slug, onNavigateHome }: ProductDetailViewProps) {
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchPublishedProductBySlugClient(slug)
      .then((data) => {
        if (!active) return;
        setProduct(data.product);
        setReviews(data.reviews);
        document.title = data.product.seo_title || `${data.product.title} | AXIAVONE`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', data.product.seo_description || data.product.tagline);
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!active) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="h-4 w-32 rounded bg-[#18181B] animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-10 w-3/4 rounded bg-[#18181B] animate-pulse" />
            <div className="aspect-[4/3] rounded-xl bg-[#111113] border border-white/10 animate-pulse" />
          </div>
          <div className="lg:col-span-5">
            <div className="h-80 rounded-xl bg-[#111113] border border-white/10 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-white">
          {error || 'Product unavailable'}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          This release may have been archived or is not currently published.
        </p>
        <button
          type="button"
          onClick={onNavigateHome}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Return to Catalog
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <button
        type="button"
        onClick={onNavigateHome}
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-8 cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Back to Catalog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
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

          <div className="border-t border-white/10 pt-8">
            <MarkdownRenderer
              content={(product.description_md || '').replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n')}
            />
          </div>

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

        <aside className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="rounded-xl border border-white/15 bg-[#111113] p-6 sm:p-8">
            <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="text-xs text-zinc-400">{TIER_LABELS[product.tier]} License</div>
                <div className="mt-1 font-mono text-3xl font-semibold text-white tabular-nums">
                  {product.price_usd === 0 ? '$0' : `$${product.price_usd.toFixed(0)}`}
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
                href={product.checkout_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8]"
              >
                {product.price_usd === 0
                  ? 'Download Free Package (Polar.sh)'
                  : `Pay with Card / Apple Pay — $${product.price_usd.toFixed(0)} USD`}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>

              {product.secondary_checkout_url && (
                <a
                  href={product.secondary_checkout_url}
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
  );
}
