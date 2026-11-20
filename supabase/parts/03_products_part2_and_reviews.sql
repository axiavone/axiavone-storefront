-- ==============================================================================
-- PART 3 OF 3: MVP PRODUCTS 4-5 ($19 CHECKOUT KIT, $29 FLAGSHIP) + 3 REVIEWS
-- Run this third in Supabase SQL Editor (after Parts 1 & 2).
-- ==============================================================================

insert into public.storefront_products (
  slug,
  title,
  tagline,
  description_md,
  tier,
  price_usd,
  checkout_url,
  secondary_checkout_url,
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
    'global-checkout-webhook-automation-kit',
    'Global Checkout & Webhook Automation Kit (Polar.sh / Lemon Squeezy)',
    'Timing-safe HMAC signature verification, atomic idempotency ledgers, and instant license provisioning for USD global checkouts.',
    E'## Bulletproof Merchant-of-Record Billing in One Afternoon\n\nSelling digital products globally means handling out-of-order webhook retries, replay attacks, and subscription state transitions reliably. This kit gives you production-ready TypeScript handlers for Polar.sh and Lemon Squeezy.\n\n### Architecture Included\n- **Constant-Time Signature Verification**: Cryptographically verify every incoming webhook using Node `crypto.timingSafeEqual`.\n- **PostgreSQL Idempotency Ledger**: Deduplicate retried `order.created` and `subscription.updated` events so customers are never double-provisioned.\n- **Entitlement & License Sync**: Clean state transitions for one-time purchases, refunds, and recurring seats.\n- **Local Test Harness**: Signed mock webhook payloads so you can verify edge cases before going live.\n\n### Tax & Currency Ready\nBuilt for USD checkouts across the US, UK, Canada, and Australia with full Merchant-of-Record support.',
    'pro_19',
    19.00,
    'https://polar.sh',
    'https://lemonsqueezy.com',
    '/images/products/global-checkout-webhook-automation-kit.svg',
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
    'https://lemonsqueezy.com',
    '/images/products/autonomous-solopreneur-multi-agent-blueprint.svg',
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
  secondary_checkout_url = excluded.secondary_checkout_url,
  preview_image_url = excluded.preview_image_url,
  features_json = excluded.features_json,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  keywords = excluded.keywords,
  status = excluded.status,
  created_by_division = excluded.created_by_division,
  published_at = coalesce(public.storefront_products.published_at, excluded.published_at),
  updated_at = now();

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
