import type { PublicProduct, PublicReview } from '../types/storefront.ts';

export const SEED_PRODUCTS: PublicProduct[] = [
  {
    id: '11111111-1111-4111-8111-111111111105',
    slug: 'autonomous-solopreneur-multi-agent-blueprint',
    title: 'Autonomous Solopreneur Multi-Agent Operations Blueprint',
    tagline:
      'The complete operating architecture to run product engineering, QA, pricing, SEO, and storefront publishing with coordinated AI agents.',
    description_md: `## Operate Like a 10-Person Product Studio—Solo

Random single-prompt workflows break down the moment you manage multiple products, QA gates, and live customer storefronts. This flagship blueprint lays out the exact division-based agent architecture, JSON contracts, and human-in-the-loop guardrails for running an automated digital product business.

### What Is Included
- **Division Operating Charter**: Clear role boundaries across Engineering, QA Verification, Pricing & Packaging, Social Proof, and Programmatic SEO.
- **Headless Storefront Sync Protocol**: Complete webhook schemas and authentication patterns to push validated drafts straight to production without manual deploys.
- **Prompt & Rubric Library**: Structured evaluation prompts that reject low-quality copy, enforce brand tone, and validate technical accuracy before publishing.
- **Cost & Failure Guardrails**: Token budgets, retry backoffs, and audit logging patterns to keep autonomous runs predictable.

### Commercial License
Includes full rights to adapt the operating blueprint and codebase templates for your own ventures or client builds.`,
    tier: 'flagship_29',
    price_usd: 29,
    checkout_url: 'https://polar.sh',
    secondary_checkout_url: 'https://lemonsqueezy.com',
    preview_image_url: '/images/products/autonomous-solopreneur-multi-agent-blueprint.svg',
    features_json: [
      'Complete multi-agent division operating manual',
      'Headless storefront sync API & JSON contract specs',
      'QA gatekeeping rubrics & anti-slop prompt templates',
      'Token budget & failure-recovery guardrails',
      'Unlimited commercial deployment license',
    ],
    seo_title: 'Autonomous Solopreneur Multi-Agent Operations Blueprint ($29) | AXIAVONE',
    seo_description:
      'Complete multi-agent operating architecture, division prompts, QA gates, and headless storefront sync blueprint for solo technical founders.',
    keywords: [
      'multi-agent operations blueprint',
      'solopreneur ai operating system',
      'autonomous digital product studio',
      'ai division architecture',
    ],
    published_at: '2026-11-18T10:00:00.000Z',
    created_at: '2026-11-18T10:00:00.000Z',
    updated_at: '2026-11-18T10:00:00.000Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111104',
    slug: 'global-checkout-webhook-automation-kit',
    title: 'Global Checkout & Webhook Automation Kit (Polar.sh / Lemon Squeezy)',
    tagline:
      'Timing-safe HMAC signature verification, atomic idempotency ledgers, and instant license provisioning for USD global checkouts.',
    description_md: `## Bulletproof Merchant-of-Record Billing in One Afternoon

Selling digital products globally means handling out-of-order webhook retries, replay attacks, and subscription state transitions reliably. This kit gives you production-ready TypeScript handlers for Polar.sh and Lemon Squeezy.

### Architecture Included
- **Constant-Time Signature Verification**: Cryptographically verify every incoming webhook using Node \`crypto.timingSafeEqual\`.
- **PostgreSQL Idempotency Ledger**: Deduplicate retried \`order.created\` and \`subscription.updated\` events so customers are never double-provisioned.
- **Entitlement & License Sync**: Clean state transitions for one-time purchases, refunds, and recurring seats.
- **Local Test Harness**: Signed mock webhook payloads so you can verify edge cases before going live.

### Tax & Currency Ready
Built for USD checkouts across the US, UK, Canada, and Australia with full Merchant-of-Record support.`,
    tier: 'pro_19',
    price_usd: 19,
    checkout_url: 'https://polar.sh',
    secondary_checkout_url: 'https://lemonsqueezy.com',
    preview_image_url: '/images/products/global-checkout-webhook-automation-kit.svg',
    features_json: [
      'Timing-safe Polar.sh & Lemon Squeezy webhook verifiers',
      'Atomic PostgreSQL webhook_events idempotency SQL',
      'TypeScript entitlement & license provisioning handlers',
      'Local signed-payload test runner',
    ],
    seo_title: 'Global Checkout & Webhook Automation Kit ($19) | AXIAVONE',
    seo_description:
      'TypeScript webhook signature verification, Postgres idempotency ledger, and license automation for Polar.sh and Lemon Squeezy checkouts.',
    keywords: [
      'polar.sh webhook kit',
      'lemon squeezy typescript handler',
      'webhook idempotency postgres',
      'global saas checkout automation',
    ],
    published_at: '2026-11-16T10:00:00.000Z',
    created_at: '2026-11-16T10:00:00.000Z',
    updated_at: '2026-11-16T10:00:00.000Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    slug: 'zero-leak-supabase-rls-auth-boilerplate',
    title: 'Zero-Leak Supabase RLS & Auth Security Boilerplate',
    tagline:
      'Production-tested PostgreSQL Row Level Security policies, multi-tenant RBAC schemas, and automated isolation tests for serious SaaS apps.',
    description_md: `## Database-Level Tenant Isolation You Can Prove

Relying on \`WHERE user_id = ...\` inside application routes is brittle. One overlooked endpoint exposes customer data. This boilerplate puts tenant and role enforcement directly inside PostgreSQL.

### Core Components
- **Multi-Tenant Schema (\`orgs\`, \`memberships\`, \`invites\`, \`audit_logs\`)**: Clean foreign-key architecture with strict cascading and indexed lookups.
- **High-Speed RLS Policies**: Optimized \`security definer\` helper functions that avoid recursive query slowdowns.
- **Role-Based Access Matrix**: Pre-configured permissions for \`owner\`, \`admin\`, \`member\`, and \`readonly\` roles.
- **Automated Isolation Test Suite**: 25+ SQL verification checks confirming anonymous and cross-organization requests return zero rows.

### Compatibility
Drop directly into any Next.js, Vite, or Remix application backed by Supabase PostgreSQL.`,
    tier: 'pro_19',
    price_usd: 19,
    checkout_url: 'https://polar.sh',
    secondary_checkout_url: 'https://lemonsqueezy.com',
    preview_image_url: '/images/products/zero-leak-supabase-rls-auth-boilerplate.svg',
    features_json: [
      'Complete multi-tenant Postgres schema & migrations',
      'Indexed RLS policies for Owner, Admin, Member & Billing',
      '25+ automated SQL tenant-isolation verification tests',
      'Server vs. anon client separation reference code',
    ],
    seo_title: 'Zero-Leak Supabase RLS & Auth Security Boilerplate ($19) | AXIAVONE',
    seo_description:
      'Production PostgreSQL Row Level Security policies, multi-tenant RBAC schema, and automated isolation tests for Supabase SaaS applications.',
    keywords: [
      'supabase rls boilerplate',
      'multi-tenant postgres security',
      'supabase rbac auth',
      'zero-leak database schema',
    ],
    published_at: '2026-11-14T10:00:00.000Z',
    created_at: '2026-11-14T10:00:00.000Z',
    updated_at: '2026-11-14T10:00:00.000Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    slug: 'humanized-b2b-cold-outreach-system',
    title: 'Humanized B2B Cold-Outreach & Client Acquisition System',
    tagline:
      'Plain-English outbound sequences, signal-based prospect qualification rubrics, and deliverability setup for US and UK B2B founders.',
    description_md: `## Outbound That Reads Like a Peer—Not an Automated Drip

Enterprise and mid-market buyers in North America and the UK delete generic AI-written pitches on sight. This operational playbook gives technical founders a repeatable, low-volume outbound system built around real buyer triggers.

### What You Get
- **14 Signal-Based Email & LinkedIn Frameworks**: Written in concise, zero-fluff executive English for product launches, audits, and consulting retainers.
- **Domain & Inbox Deliverability SOP**: Exact SPF, DKIM, DMARC, and warm-up cadence settings to keep primary-inbox placement above 95%.
- **3-Tier Prospect Qualification Matrix**: Filter out low-fit leads before sending a single message.
- **Follow-Up & Objection Playbook**: Calm, respectful responses for timing, budget, and incumbent-vendor replies.

### Ideal For
B2B SaaS founders, technical consultants, and fractional operators booking 5–12 qualified discovery calls a month without ad spend.`,
    tier: 'core_12',
    price_usd: 12,
    checkout_url: 'https://polar.sh',
    secondary_checkout_url: 'https://lemonsqueezy.com',
    preview_image_url: '/images/products/humanized-b2b-cold-outreach-system.svg',
    features_json: [
      '14 plain-English B2B outreach & follow-up templates',
      'SPF/DKIM/DMARC & inbox deliverability SOP',
      'Signal-based lead scoring & qualification sheet',
      'Zero-hype objection handling scripts',
    ],
    seo_title: 'Humanized B2B Cold-Outreach & Client Acquisition System ($12) | AXIAVONE',
    seo_description:
      'Repeatable B2B cold email and LinkedIn acquisition playbook with deliverability SOPs and natural executive outreach frameworks for US and UK markets.',
    keywords: [
      'b2b cold outreach system',
      'founder led sales playbook',
      'cold email deliverability sop',
      'client acquisition system',
    ],
    published_at: '2026-11-12T10:00:00.000Z',
    created_at: '2026-11-12T10:00:00.000Z',
    updated_at: '2026-11-12T10:00:00.000Z',
  },
  {
    id: '11111111-1111-4111-8111-111111111101',
    slug: 'ai-micro-saas-launch-security-audit',
    title: 'AI & Micro-SaaS Launch Security Audit Checklist',
    tagline:
      'A 48-point pre-launch security and production readiness checklist built to stop API key leaks, open RLS tables, and runaway LLM spend.',
    description_md: `## Ship Without Leaving Your Database or AI Keys Exposed

Most micro-SaaS breaches happen in the first 72 hours after launch—usually from misconfigured Supabase policies, leaked service-role keys in client bundles, or unthrottled AI endpoints.

### What Is Inside
- **Supabase & Postgres Hardening**: Step-by-step verification for \`FORCE ROW LEVEL SECURITY\`, anon privilege stripping, and column-level revokes.
- **Client/Server Boundary Audit**: Exact checks to ensure zero secrets slip into \`VITE_*\` or \`NEXT_PUBLIC_*\` build artifacts.
- **API Rate-Limiting & Cost Caps**: Practical thresholds to block automated scraping and unexpected OpenAI/Gemini billing spikes.
- **Pre-Launch DNS & Headers**: Ready-to-paste CSP, HSTS, and CORS rules for Vercel and Cloudflare.

### Built For
Indie founders, technical operators, and small product teams preparing for Tier-1 commercial traffic.`,
    tier: 'free_lead',
    price_usd: 0,
    checkout_url: 'https://polar.sh',
    secondary_checkout_url: null,
    preview_image_url: '/images/products/ai-micro-saas-launch-security-audit.svg',
    features_json: [
      '48-point security & launch audit checklist (Markdown + Notion)',
      'Supabase RLS & column-revoke verification queries',
      'Client bundle secret-leak grep script',
      'Vercel & Cloudflare security header templates',
    ],
    seo_title: 'AI & Micro-SaaS Launch Security Audit Checklist (Free) | AXIAVONE',
    seo_description:
      'Free 48-point pre-launch security checklist for AI apps and micro-SaaS founders covering Supabase RLS, secret isolation, and rate limiting.',
    keywords: [
      'micro-saas security checklist',
      'supabase rls audit',
      'ai app launch security',
      'saas pre-launch checklist',
    ],
    published_at: '2026-11-10T10:00:00.000Z',
    created_at: '2026-11-10T10:00:00.000Z',
    updated_at: '2026-11-10T10:00:00.000Z',
  },
];

export const SEED_REVIEWS: PublicReview[] = [
  {
    id: '33333111-1111-4111-8111-111111111101',
    product_id: '11111111-1111-4111-8111-111111111105',
    buyer_name: 'Nathaniel Brooks, Founder at MetricLayer',
    buyer_country: 'United States',
    review_text:
      'The division handoff specs and QA gate rubrics cut our weekly content and product shipping time from three days to under two hours.',
    rating: 5,
    is_verified: true,
    created_at: '2026-11-18T14:20:00.000Z',
  },
  {
    id: '33333111-1111-4111-8111-111111111102',
    product_id: '11111111-1111-4111-8111-111111111103',
    buyer_name: 'Oliver Bennett, Principal Engineer at Finchley Systems',
    buyer_country: 'United Kingdom',
    review_text:
      'Cleanest Supabase RLS pattern I have used. We dropped the multi-tenant isolation tests straight into CI before our London fintech security audit.',
    rating: 5,
    is_verified: true,
    created_at: '2026-11-16T09:45:00.000Z',
  },
  {
    id: '33333111-1111-4111-8111-111111111103',
    product_id: '11111111-1111-4111-8111-111111111102',
    buyer_name: 'Claire Tremblay, Managing Partner at Northbridge Advisory',
    buyer_country: 'Canada',
    review_text:
      'Zero hype and zero spammy templates. We updated our outbound sequences using the signal-based rubric and booked 7 qualified calls in our first three weeks.',
    rating: 5,
    is_verified: true,
    created_at: '2026-11-13T18:10:00.000Z',
  },
];
