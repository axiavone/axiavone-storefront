'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, ShieldCheck, Star } from 'lucide-react';
import {
  TIER_LABELS,
  type ProductTier,
  type StorefrontProduct,
  type StorefrontReview,
} from '@/lib/types';

interface StorefrontCatalogProps {
  products: StorefrontProduct[];
  reviews: StorefrontReview[];
}

const VALUE_LADDER_TABS: Array<{ id: 'all' | ProductTier; label: string }> = [
  { id: 'all', label: 'All Products' },
  { id: 'free_lead', label: 'Free Tools' },
  { id: 'core_12', label: 'Core $12' },
  { id: 'pro_19', label: 'Pro $19' },
  { id: 'flagship_29', label: 'Flagship $29' },
];

export default function StorefrontCatalog({ products, reviews }: StorefrontCatalogProps) {
  const [selectedTier, setSelectedTier] = useState<'all' | ProductTier>('all');
  const [legalDoc, setLegalDoc] = useState<'terms' | 'privacy' | 'license' | null>(null);

  const filteredProducts = useMemo(() => {
    if (selectedTier === 'all') return products;
    return products.filter((item) => item.tier === selectedTier);
  }, [products, selectedTier]);

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA]">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#09090B]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
          <Link
            href="/"
            className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            AXIAVONE
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <a
              href="#catalog"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Catalog
            </a>
            <a
              href="#architecture"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Architecture
            </a>
            <a
              href="#reviews"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Reviews
            </a>
            <button
              type="button"
              onClick={() => setLegalDoc('license')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Licensing
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#catalog"
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
            >
              Browse Kits
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Proposition */}
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 border-b border-white/10">
          <div className="max-w-3xl">
            <p className="text-xs font-medium tracking-wide text-zinc-400 mb-4">
              United States · United Kingdom · Canada · Australia · USD Checkout
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-white leading-[1.1] [text-wrap:balance]">
              Production software blueprints engineered for immediate commercial deployment.
            </h1>
            <p className="mt-6 text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl">
              Battle-tested TypeScript starter architectures, PostgreSQL security matrices, and
              idempotent billing handlers. Instant digital delivery with full commercial rights.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#catalog"
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap"
              >
                Explore Value Ladder
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#reviews"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#111113] px-5 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-white/25 hover:text-white whitespace-nowrap"
              >
                Verified Buyer Proof
              </a>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/10">
            <div>
              <div className="font-mono text-2xl font-semibold text-white tabular-nums">$0–$29</div>
              <div className="mt-1 text-xs text-zinc-400">Transparent USD pricing</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-semibold text-white tabular-nums">&lt; 5 min</div>
              <div className="mt-1 text-xs text-zinc-400">Repository setup time</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-semibold text-white tabular-nums">100%</div>
              <div className="mt-1 text-xs text-zinc-400">Strict TypeScript & SQL</div>
            </div>
            <div>
              <div className="font-mono text-2xl font-semibold text-white tabular-nums">4.9 / 5</div>
              <div className="mt-1 text-xs text-zinc-400">Across Tier-1 teams</div>
            </div>
          </div>
        </section>

        {/* Value Ladder Filter + Dynamic Product Grid */}
        <section id="catalog" className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                Digital Engineering Catalog
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Select a tier across our value ladder—from free diagnostic tools to flagship SaaS foundations.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filter products by price tier"
              className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-[#111113] p-1"
            >
              {VALUE_LADDER_TABS.map((tab) => {
                const isActive = selectedTier === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedTier(tab.id)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#2563EB] text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#111113] p-12 text-center">
              <p className="text-sm text-zinc-400">
                No published products currently match this tier filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111113] transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/20"
                >
                  <Link href={`/products/${product.slug}`} className="block aspect-[4/3] overflow-hidden bg-[#18181B]">
                    <img
                      src={product.preview_image_url}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between gap-4 text-xs text-zinc-400">
                      <span>
                        {TIER_LABELS[product.tier]} · Instant Download · Commercial License
                      </span>
                      <span className="font-mono text-base font-semibold text-white tabular-nums shrink-0">
                        {product.price_usd === 0 ? 'Free' : `$${product.price_usd.toFixed(0)} USD`}
                      </span>
                    </div>

                    <Link href={`/products/${product.slug}`} className="mt-3 block">
                      <h3 className="font-display text-xl font-semibold tracking-tight text-white group-hover:text-[#60A5FA] transition-colors">
                        {product.title}
                      </h3>
                    </Link>

                    <p className="mt-2 text-sm text-zinc-400 leading-relaxed line-clamp-2">
                      {product.tagline}
                    </p>

                    <ul className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-zinc-300">
                      {product.features_json.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-3.5 w-3.5 text-[#3B82F6] mt-0.5 shrink-0" aria-hidden="true" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-xs font-medium text-zinc-300 hover:text-white transition-colors whitespace-nowrap"
                      >
                        Read Specification
                      </Link>
                      <a
                        href={product.checkout_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] whitespace-nowrap shrink-0"
                      >
                        {product.price_usd === 0 ? 'Get Free Kit' : `Buy Now — $${product.price_usd.toFixed(0)}`}
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Architecture Guarantees */}
        <section id="architecture" className="border-y border-white/10 bg-[#111113]/50">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="max-w-2xl mb-10">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
                Built for Tier-1 Production Standards
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Every release ships with strict type safety, zero unnecessary runtime dependencies, and Merchant-of-Record tax compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border-t border-white/15 pt-5">
                <h3 className="font-display text-base font-semibold text-white">
                  01. Zero-Leak Security Defaults
                </h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  Database schemas ship with explicit Row Level Security and strict server/client boundary isolation from day one.
                </p>
              </div>
              <div className="border-t border-white/15 pt-5">
                <h3 className="font-display text-base font-semibold text-white">
                  02. Merchant-of-Record Checkout
                </h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  Payments process via Polar.sh and Lemon Squeezy with automated US sales tax, UK VAT, Canadian GST, and invoice generation.
                </p>
              </div>
              <div className="border-t border-white/15 pt-5">
                <h3 className="font-display text-base font-semibold text-white">
                  03. Perpetual Commercial Rights
                </h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  One-time USD purchase grants unlimited commercial deployments for your internal products or client engagements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Verified Global Buyer Social Proof */}
        <section id="reviews" className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
                Verified Global Buyer Reviews
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                Feedback from verified engineering buyers across the US, UK, Canada, and Australia.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border border-white/10 bg-[#111113] p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 text-xs text-zinc-400 mb-4">
                    <span className="inline-flex items-center gap-1.5 text-zinc-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#3B82F6]" aria-hidden="true" />
                      Verified Purchase · {review.buyer_country}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono text-zinc-300 tabular-nums">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                      {review.rating}.0
                    </span>
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed">
                    &ldquo;{review.review_text}&rdquo;
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-white/10 text-xs font-medium text-zinc-400">
                  {review.buyer_name}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Clean Legal & Brand Footer */}
      <footer className="border-t border-white/10 bg-[#09090B]">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-6 py-10 text-xs text-zinc-400">
          <div>
            <span className="font-display font-semibold text-white">AXIAVONE</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()} AXIAVONE Digital Products. All rights reserved.</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => setLegalDoc('terms')}
              className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setLegalDoc('privacy')}
              className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setLegalDoc('license')}
              className="hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Commercial License
            </button>
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      {legalDoc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg rounded-xl border border-white/15 bg-[#111113] p-6 text-sm text-zinc-300 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-display text-lg font-semibold text-white">
                {legalDoc === 'terms' && 'Terms of Service'}
                {legalDoc === 'privacy' && 'Privacy Policy'}
                {legalDoc === 'license' && 'Commercial Software License'}
              </h3>
              <button
                type="button"
                onClick={() => setLegalDoc(null)}
                className="rounded-md px-2.5 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="mt-4 space-y-3 leading-relaxed text-zinc-400">
              {legalDoc === 'terms' && (
                <>
                  <p>
                    All digital engineering kits sold by AXIAVONE are delivered instantaneously via
                    Polar.sh or Lemon Squeezy upon USD payment authorization.
                  </p>
                  <p>
                    Due to the irrevocable nature of source-code downloads, refunds are evaluated on a
                    case-by-case basis within 14 days if a documented technical defect cannot be resolved.
                  </p>
                </>
              )}
              {legalDoc === 'privacy' && (
                <>
                  <p>
                    AXIAVONE collects zero third-party advertising trackers on this storefront. Payment
                    processing, VAT/GST compliance, and buyer receipts are handled directly by our
                    Merchant-of-Record partners (Polar.sh / Lemon Squeezy).
                  </p>
                </>
              )}
              {legalDoc === 'license' && (
                <>
                  <p>
                    Every AXIAVONE purchase grants a non-exclusive, perpetual, worldwide commercial
                    license to modify and deploy the source code inside unlimited personal or client
                    production applications.
                  </p>
                  <p>
                    Redistribution or resale of the unmodified boilerplate or starter kit as a competing
                    template product is strictly prohibited.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
