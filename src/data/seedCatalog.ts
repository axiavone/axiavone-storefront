import type { PublicProduct, PublicReview } from '../types/storefront.ts';

export const SEED_PRODUCTS: PublicProduct[] = [
  {
    id: '11111111-1111-4111-8111-111111111104',
    slug: 'production-saas-revenue-architecture',
    title: 'Production SaaS Launch & Revenue Architecture',
    tagline:
      'End-to-end Next.js App Router, Supabase RLS, Polar.sh checkout, transactional email, and programmatic SEO starter built for Tier-1 conversion.',
    description_md: `## Go From Zero to Revenue-Ready SaaS Architecture in One Afternoon

Stop burning three weeks wiring boilerplate auth, billing webhooks, dark-mode UI primitives, and technical SEO. **Production SaaS Launch & Revenue Architecture** is the complete reference codebase extracted from high-converting B2B software launches.

### Core Modules
- **App Router Foundation**: Server Components, strict TypeScript boundaries, and edge-cached public landing pages.
- **Merchant-of-Record Billing**: Pre-wired Polar.sh & Lemon Squeezy checkout links with USD pricing, VAT/GST handling, and webhook entitlement sync.
- **Programmatic SEO Engine**: Dynamic \`sitemap.ts\`, \`robots.ts\`, OpenGraph metadata generation, and structured JSON-LD product schemas.
- **Hardened Supabase Layer**: Complete SQL schema, strict RLS policies, and zero-leak server/client key separation.

### Licensing
Includes unlimited commercial deployment rights for solo founders and engineering teams.`,
    tier: 'flagship_29',
    price_usd: 29,
    checkout_url: 'https://buy.polar.sh/axiavone-flagship-saas-architecture',
    preview_image_url: '/src/assets/images/product_flagship_saas_1795141883162.jpg',
    features_json: [
      'Full Next.js App Router + TypeScript + Tailwind codebase',
      'Pre-wired Polar.sh / Lemon Squeezy checkout & webhook sync',
      'Hardened Supabase RLS schema + service-role separation',
      'Dynamic sitemap.xml, robots.txt & JSON-LD SEO suite',
      'Lifetime updates & unlimited commercial license',
    ],
    seo_title: 'Production SaaS Launch & Revenue Architecture ($29) | AXIAVONE',
    seo_description:
      'Complete Next.js App Router, Supabase RLS, Polar.sh checkout, and programmatic SEO architecture for Tier-1 software launches.',
    keywords: [
      'nextjs saas starter kit',
      'supabase polar.sh boilerplate',
      'production saas architecture',
      'typescript saas template',
    ],
    published_at: '2026-11-17T10:00:00.000Z',
    created_at: '2026-11-17T10:00:00.000Z',
    updated_at: '2026-11-17T10:00:00.000Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    slug: 'supabase-multi-tenant-rls-blueprint',
    title: 'Multi-Tenant Supabase RLS & RBAC Security Blueprint',
    tagline:
      'Zero-leak PostgreSQL Row Level Security policies, JWT custom claims, and automated pgTAP isolation tests for B2B SaaS.',
    description_md: `## Enforce Tenant Isolation at the Database Kernel

Application-layer \`WHERE org_id = ?\` checks are a single missed query away from a cross-tenant data breach. This blueprint moves authorization directly into PostgreSQL Row Level Security with zero N+1 performance penalties.

### What You Get
- **Indexed JWT Claim Helpers**: High-throughput \`auth.org_id()\` and \`auth.org_role()\` security-definer functions tuned for sub-millisecond RLS evaluation.
- **Role Matrix (Owner, Admin, Member, Billing)**: Granular \`SELECT\`, \`INSERT\`, \`UPDATE\`, and \`DELETE\` policies for organizations, invites, and audit logs.
- **pgTAP Automated Penetration Suite**: 28 automated SQL assertions proving anonymous and cross-tenant queries return zero rows.

### Engineered For
B2B SaaS teams passing SOC 2 Type I/II technical reviews in the US and UK.`,
    tier: 'pro_19',
    price_usd: 19,
    checkout_url: 'https://buy.polar.sh/axiavone-supabase-rls-blueprint',
    preview_image_url: '/src/assets/images/product_rls_blueprint_1795141883805.jpg',
    features_json: [
      'Complete multi-tenant orgs, memberships & invites SQL',
      'Sub-millisecond indexed RLS helper functions',
      '28-assertion pgTAP cross-tenant isolation test suite',
      'SOC 2 access-control documentation template',
    ],
    seo_title: 'Multi-Tenant Supabase RLS & RBAC Security Blueprint ($19) | AXIAVONE',
    seo_description:
      'Production PostgreSQL Row Level Security policies, RBAC schemas, and automated pgTAP isolation tests for B2B Supabase apps.',
    keywords: [
      'supabase rls multi tenant',
      'postgresql row level security blueprint',
      'supabase rbac schema',
      'b2b saas security',
    ],
    published_at: '2026-11-14T10:00:00.000Z',
    created_at: '2026-11-14T10:00:00.000Z',
    updated_at: '2026-11-14T10:00:00.000Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    slug: 'polar-webhook-idempotency-kit',
    title: 'Polar.sh & Lemon Squeezy Webhook Idempotency Kit',
    tagline:
      'Production-hardened TypeScript signature verification, replay protection, and entitlement ledger for global USD SaaS checkouts.',
    description_md: `## Never Drop or Double-Credit a Paid Webhook Again

Payment webhooks arrive out of order, retry unpredictably, and fail silently without strict idempotency. This kit provides battle-tested Next.js App Router handlers and PostgreSQL ledger tables ready for US, UK, CA, and AU tax-compliant merchant-of-record checkouts.

### Architecture Highlights
- **Timing-Safe HMAC Verification**: Constant-time cryptographic validation for Polar.sh and Lemon Squeezy webhook signatures.
- **Atomic Idempotency Ledger**: PostgreSQL \`webhook_events\` deduplication table preventing duplicate license provisioning.
- **Automatic Entitlement Sync**: Clean TypeScript state machine handling \`order.created\`, \`subscription.updated\`, and \`subscription.revoked\`.

### Deliverables
1. Complete TypeScript route handlers (\`app/api/webhooks/polar/route.ts\`)
2. SQL migration for atomic event locking
3. Vitest integration suite with signed mock payloads`,
    tier: 'core_12',
    price_usd: 12,
    checkout_url: 'https://buy.polar.sh/axiavone-webhook-idempotency-kit',
    preview_image_url: '/src/assets/images/product_webhook_kit_1795141883165.jpg',
    features_json: [
      'Timing-safe HMAC signature verifier (Polar.sh & Lemon Squeezy)',
      'PostgreSQL atomic idempotency ledger SQL',
      'Full Vitest webhook replay test suite',
      'Zero external runtime dependencies beyond Node crypto',
    ],
    seo_title: 'Polar.sh & Lemon Squeezy Webhook Idempotency Kit ($12) | AXIAVONE',
    seo_description:
      'Bulletproof TypeScript webhook signature verification, replay protection, and Postgres idempotency ledger for Polar.sh and Lemon Squeezy.',
    keywords: [
      'polar.sh webhook typescript',
      'lemon squeezy idempotency',
      'saas billing webhook handler',
      'nextjs payment security',
    ],
    published_at: '2026-11-11T10:00:00.000Z',
    created_at: '2026-11-11T10:00:00.000Z',
    updated_at: '2026-11-11T10:00:00.000Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111101',
    slug: 'edge-latency-audit-cli',
    title: 'Edge Latency & Core Web Vitals Audit CLI',
    tagline:
      'Zero-dependency CLI and 42-point diagnostic playbook to cut Next.js TTFB under 80ms across US and UK edge regions.',
    description_md: `## Ship Sub-80ms TTFB Across North America & Europe

Slow initial document responses silently erode paid acquisition ROAS. The **Edge Latency & Core Web Vitals Audit CLI** gives staff engineers and technical founders a deterministic checklist and automated waterfall profiler.

### What Is Included
- **TypeScript CLI Profiler (\`npx axiavone-audit\`)**: Measures DNS, TLS handshake, TTFB, and streaming SSR hydration timing from local or CI pipelines.
- **Cache-Control & ISR Matrix**: Copy-pasteable \`next.config.ts\` and route segment configs for Vercel Edge & CloudFront.
- **42-Point Remediation Playbook**: Concrete fixes for font layout shift, bundle bloat, and unindexed database reads.

### Requirements
- Node.js 20+ or Bun 1.1+
- Compatible with Next.js App Router, Remix, and Astro.`,
    tier: 'free_lead',
    price_usd: 0,
    checkout_url: 'https://buy.polar.sh/axiavone-edge-latency-cli',
    preview_image_url: '/src/assets/images/product_edge_audit_cli_1795141884317.jpg',
    features_json: [
      'Automated DNS/TLS/TTFB waterfall CLI',
      '42-point Next.js App Router performance audit',
      'Vercel Edge & CDN cache header templates',
      'MIT commercial license for unlimited client projects',
    ],
    seo_title: 'Edge Latency & Core Web Vitals Audit CLI (Free) | AXIAVONE',
    seo_description:
      'Download the free AXIAVONE Edge Latency Audit CLI and 42-point Core Web Vitals playbook to drop Next.js TTFB under 80ms.',
    keywords: [
      'nextjs performance cli',
      'core web vitals audit',
      'ttfb optimization',
      'vercel edge latency',
    ],
    published_at: '2026-11-07T10:00:00.000Z',
    created_at: '2026-11-07T10:00:00.000Z',
    updated_at: '2026-11-07T10:00:00.000Z',
  },
];

export const SEED_REVIEWS: PublicReview[] = [
  {
    id: '22222111-1111-4111-8111-111111111101',
    product_id: '11111111-1111-4111-8111-111111111104',
    buyer_name: 'Marcus Vance, Principal Engineer at Northstar Ops',
    buyer_country: 'United States',
    review_text:
      'Replaced three fragile internal scripts with the Flagship architecture. Deployed our US customer portal in 4 hours and passed security review on the first pass.',
    rating: 5,
    is_verified: true,
    created_at: '2026-11-18T14:20:00.000Z',
  },
  {
    id: '22222111-1111-4111-8111-111111111102',
    product_id: '11111111-1111-4111-8111-111111111103',
    buyer_name: 'Charlotte Hughes, CTO at LedgerFlow UK',
    buyer_country: 'United Kingdom',
    review_text:
      'The pgTAP isolation test suite alone saved our team at least two weeks of manual RLS auditing before our London enterprise pilot.',
    rating: 5,
    is_verified: true,
    created_at: '2026-11-16T09:45:00.000Z',
  },
  {
    id: '22222111-1111-4111-8111-111111111103',
    product_id: '11111111-1111-4111-8111-111111111102',
    buyer_name: 'Devon Tremblay, Staff Developer at Boreal Cloud',
    buyer_country: 'Canada',
    review_text:
      'Cleanest webhook idempotency handler I have bought. Zero bloat, pure TypeScript, and the Polar.sh signature check worked out of the box.',
    rating: 5,
    is_verified: true,
    created_at: '2026-11-13T18:10:00.000Z',
  },
  {
    id: '22222111-1111-4111-8111-111111111104',
    product_id: '11111111-1111-4111-8111-111111111101',
    buyer_name: 'Lachlan Reid, Founding Engineer at HarbourMetrics',
    buyer_country: 'Australia',
    review_text:
      'Ran the audit CLI against our Sydney edge deployment and immediately spotted two un-cached layout queries adding 210ms to TTFB.',
    rating: 5,
    is_verified: true,
    created_at: '2026-11-10T06:30:00.000Z',
  },
];
