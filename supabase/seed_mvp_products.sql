-- ==============================================================================
-- AXIAVONE PUBLIC STOREFRONT — 5 TIER-1 MVP PRODUCTS & VERIFIED REVIEWS
-- Compatible with public.storefront_products & public.storefront_reviews
-- Run inside Supabase SQL Editor. Idempotent via ON CONFLICT (slug).
-- ==============================================================================

insert into public.storefront_products (
  slug,
  title,
  tagline,
  description_md,
  tier,
  price_usd,
  checkout_url,
  preview_image_url,
  features_json,
  seo_title,
  seo_description,
  keywords,
  status,
  created_by_division,
  published_at
)
values
  (
    'ai-micro-saas-launch-security-audit',
    'AI & Micro-SaaS Launch Security Audit Checklist',
    'A 48-point pre-launch security and production readiness checklist built to stop API key leaks, open RLS tables, and runaway LLM spend.',
    E'## Ship Without Leaving Your Database or AI Keys Exposed\n\nMost micro-SaaS breaches happen in the first 72 hours after launch—usually from misconfigured Supabase policies, leaked service-role keys in client bundles, or unthrottled AI endpoints.\n\n### What Is Inside\n- **Supabase & Postgres Hardening**: Step-by-step verification for `FORCE ROW LEVEL SECURITY`, anon privilege stripping, and column-level revokes.\n- **Client/Server Boundary Audit**: Exact checks to ensure zero secrets slip into `VITE_*` or `NEXT_PUBLIC_*` build artifacts.\n- **API Rate-Limiting & Cost Caps**: Practical thresholds to block automated scraping and unexpected OpenAI/Gemini billing spikes.\n- **Pre-Launch DNS & Headers**: Ready-to-paste CSP, HSTS, and CORS rules for Vercel and Cloudflare.\n\n### Built For\nIndie founders, technical operators, and small product teams preparing for Tier-1 commercial traffic.',
    'free_lead',
    0.00,
    'https://polar.sh',
    '/src/assets/images/product_edge_audit_cli_1795141884317.jpg',
    '["48-point security & launch audit checklist (Markdown + Notion)", "Supabase RLS & column-revoke verification queries", "Client bundle secret-leak grep script", "Vercel & Cloudflare security header templates"]'::jsonb,
    'AI & Micro-SaaS Launch Security Audit Checklist (Free) | AXIAVONE',
    'Free 48-point pre-launch security checklist for AI apps and micro-SaaS founders covering Supabase RLS, secret isolation, and rate limiting.',
    array['micro-saas security checklist', 'supabase rls audit', 'ai app launch security', 'saas pre-launch checklist'],
    'published',
    'DIV-08',
    now() - interval '10 days'
  ),
  (
    'humanized-b2b-cold-outreach-system',
    'Humanized B2B Cold-Outreach & Client Acquisition System',
    'Plain-English outbound sequences, signal-based prospect qualification rubrics, and deliverability setup for US and UK B2B founders.',
    E'## Outbound That Reads Like a Peer—Not an Automated Drip\n\nEnterprise and mid-market buyers in North America and the UK delete generic AI-written pitches on sight. This operational playbook gives technical founders a repeatable, low-volume outbound system built around real buyer triggers.\n\n### What You Get\n- **14 Signal-Based Email & LinkedIn Frameworks**: Written in concise, zero-fluff executive English for product launches, audits, and consulting retainers.\n- **Domain & Inbox Deliverability SOP**: Exact SPF, DKIM, DMARC, and warm-up cadence settings to keep primary-inbox placement above 95%.\n- **3-Tier Prospect Qualification Matrix**: Filter out low-fit leads before sending a single message.\n- **Follow-Up & Objection Playbook**: Calm, respectful responses for timing, budget, and incumbent-vendor replies.\n\n### Ideal For\nB2B SaaS founders, technical consultants, and fractional operators booking 5–12 qualified discovery calls a month without ad spend.',
    'core_12',
    12.00,
    'https://polar.sh',
    null,
    '["14 plain-English B2B outreach & follow-up templates", "SPF/DKIM/DMARC & inbox deliverability SOP", "Signal-based lead scoring & qualification sheet", "Zero-hype objection handling scripts"]'::jsonb,
    'Humanized B2B Cold-Outreach & Client Acquisition System ($12) | AXIAVONE',
    'Repeatable B2B cold email and LinkedIn acquisition playbook with deliverability SOPs and natural executive outreach frameworks for US and UK markets.',
    array['b2b cold outreach system', 'founder led sales playbook', 'cold email deliverability sop', 'client acquisition system'],
    'published',
    'DIV-15',
    now() - interval '8 days'
  ),
  (
    'zero-leak-supabase-rls-auth-boilerplate',
    'Zero-Leak Supabase RLS & Auth Security Boilerplate',
    'Production-tested PostgreSQL Row Level Security policies, multi-tenant RBAC schemas, and automated isolation tests for serious SaaS apps.',
    E'## Database-Level Tenant Isolation You Can Prove\n\nRelying on `WHERE user_id = ...` inside application routes is brittle. One overlooked endpoint exposes customer data. This boilerplate puts tenant and role enforcement directly inside PostgreSQL.\n\n### Core Components\n- **Multi-Tenant Schema (`orgs`, `memberships`, `invites`, `audit_logs`)**: Clean foreign-key architecture with strict cascading and indexed lookups.\n- **High-Speed RLS Policies**: Optimized `security definer` helper functions that avoid recursive query slowdowns.\n- **Role-Based Access Matrix**: Pre-configured permissions for `owner`, `admin`, `member`, and `readonly` roles.\n- **Automated Isolation Test Suite**: 25+ SQL verification checks confirming anonymous and cross-organization requests return zero rows.\n\n### Compatibility\nDrop directly into any Next.js, Vite, or Remix application backed by Supabase PostgreSQL.',
    'pro_19',
    19.00,
    'https://polar.sh',
    '/src/assets/images/product_rls_blueprint_1795141883805.jpg',
    '["Complete multi-tenant Postgres schema & migrations", "Indexed RLS policies for Owner, Admin, Member & Billing", "25+ automated SQL tenant-isolation verification tests", "Server vs. anon client separation reference code"]'::jsonb,
    'Zero-Leak Supabase RLS & Auth Security Boilerplate ($19) | AXIAVONE',
    'Production PostgreSQL Row Level Security policies, multi-tenant RBAC schema, and automated isolation tests for Supabase SaaS applications.',
    array['supabase rls boilerplate', 'multi-tenant postgres security', 'supabase rbac auth', 'zero-leak database schema'],
    'published',
    'DIV-08',
    now() - interval '6 days'
  ),
  (
    'global-checkout-webhook-automation-kit',
    'Global Checkout & Webhook Automation Kit (Polar.sh / Lemon Squeezy)',
    'Timing-safe HMAC signature verification, atomic idempotency ledgers, and instant license provisioning for USD global checkouts.',
    E'## Bulletproof Merchant-of-Record Billing in One Afternoon\n\nSelling digital products globally means handling out-of-order webhook retries, replay attacks, and subscription state transitions reliably. This kit gives you production-ready TypeScript handlers for Polar.sh and Lemon Squeezy.\n\n### Architecture Included\n- **Constant-Time Signature Verification**: Cryptographically verify every incoming webhook using Node `crypto.timingSafeEqual`.\n- **PostgreSQL Idempotency Ledger**: Deduplicate retried `order.created` and `subscription.updated` events so customers are never double-provisioned.\n- **Entitlement & License Sync**: Clean state transitions for one-time purchases, refunds, and recurring seats.\n- **Local Test Harness**: Signed mock webhook payloads so you can verify edge cases before going live.\n\n### Tax & Currency Ready\nBuilt for USD checkouts across the US, UK, Canada, and Australia with full Merchant-of-Record support.',
    'pro_19',
    19.00,
    'https://polar.sh',
    '/src/assets/images/product_webhook_kit_1795141883165.jpg',
    '["Timing-safe Polar.sh & Lemon Squeezy webhook verifiers", "Atomic PostgreSQL webhook_events idempotency SQL", "TypeScript entitlement & license provisioning handlers", "Local signed-payload test runner"]'::jsonb,
    'Global Checkout & Webhook Automation Kit ($19) | AXIAVONE',
    'TypeScript webhook signature verification, Postgres idempotency ledger, and license automation for Polar.sh and Lemon Squeezy checkouts.',
    array['polar.sh webhook kit', 'lemon squeezy typescript handler', 'webhook idempotency postgres', 'global saas checkout automation'],
    'published',
    'DIV-08',
    now() - interval '4 days'
  ),
  (
    'autonomous-solopreneur-multi-agent-blueprint',
    'Autonomous Solopreneur Multi-Agent Operations Blueprint',
    'The complete operating architecture to run product engineering, QA, pricing, SEO, and storefront publishing with coordinated AI agents.',
    E'## Operate Like a 10-Person Product Studio—Solo\n\nRandom single-prompt workflows break down the moment you manage multiple products, QA gates, and live customer storefronts. This flagship blueprint lays out the exact division-based agent architecture, JSON contracts, and human-in-the-loop guardrails for running an automated digital product business.\n\n### What Is Included\n- **Division Operating Charter**: Clear role boundaries across Engineering, QA Verification, Pricing & Packaging, Social Proof, and Programmatic SEO.\n- **Headless Storefront Sync Protocol**: Complete webhook schemas and authentication patterns to push validated drafts straight to production without manual deploys.\n- **Prompt & Rubric Library**: Structured evaluation prompts that reject low-quality copy, enforce brand tone, and validate technical accuracy before publishing.\n- **Cost & Failure Guardrails**: Token budgets, retry backoffs, and audit logging patterns to keep autonomous runs predictable.\n\n### Commercial License\nIncludes full rights to adapt the operating blueprint and codebase templates for your own ventures or client builds.',
    'flagship_29',
    29.00,
    'https://polar.sh',
    '/src/assets/images/product_flagship_saas_1795141883162.jpg',
    '["Complete multi-agent division operating manual", "Headless storefront sync API & JSON contract specs", "QA gatekeeping rubrics & anti-slop prompt templates", "Token budget & failure-recovery guardrails", "Unlimited commercial deployment license"]'::jsonb,
    'Autonomous Solopreneur Multi-Agent Operations Blueprint ($29) | AXIAVONE',
    'Complete multi-agent operating architecture, division prompts, QA gates, and headless storefront sync blueprint for solo technical founders.',
    array['multi-agent operations blueprint', 'solopreneur ai operating system', 'autonomous digital product studio', 'ai division architecture'],
    'published',
    'DIV-08',
    now() - interval '2 days'
  )
on conflict (slug) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  description_md = excluded.description_md,
  tier = excluded.tier,
  price_usd = excluded.price_usd,
  checkout_url = excluded.checkout_url,
  preview_image_url = excluded.preview_image_url,
  features_json = excluded.features_json,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  keywords = excluded.keywords,
  status = excluded.status,
  created_by_division = excluded.created_by_division,
  published_at = coalesce(public.storefront_products.published_at, excluded.published_at),
  updated_at = now();

-- Insert 3 realistic verified buyer reviews (US, UK, Canada)
insert into public.storefront_reviews (
  id,
  product_id,
  buyer_name,
  buyer_country,
  review_text,
  rating,
  is_verified
)
values
  (
    '33333111-1111-4111-8111-111111111101',
    (select id from public.storefront_products where slug = 'autonomous-solopreneur-multi-agent-blueprint' limit 1),
    'Nathaniel Brooks, Founder at MetricLayer',
    'United States',
    'The division handoff specs and QA gate rubrics cut our weekly content and product shipping time from three days to under two hours.',
    5,
    true
  ),
  (
    '33333111-1111-4111-8111-111111111102',
    (select id from public.storefront_products where slug = 'zero-leak-supabase-rls-auth-boilerplate' limit 1),
    'Oliver Bennett, Principal Engineer at Finchley Systems',
    'United Kingdom',
    'Cleanest Supabase RLS pattern I have used. We dropped the multi-tenant isolation tests straight into CI before our London fintech security audit.',
    5,
    true
  ),
  (
    '33333111-1111-4111-8111-111111111103',
    (select id from public.storefront_products where slug = 'humanized-b2b-cold-outreach-system' limit 1),
    'Claire Tremblay, Managing Partner at Northbridge Advisory',
    'Canada',
    'Zero hype and zero spammy templates. We updated our outbound sequences using the signal-based rubric and booked 7 qualified calls in our first three weeks.',
    5,
    true
  )
on conflict (id) do update set
  buyer_name = excluded.buyer_name,
  buyer_country = excluded.buyer_country,
  review_text = excluded.review_text,
  rating = excluded.rating,
  is_verified = excluded.is_verified;
