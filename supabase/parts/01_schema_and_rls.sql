-- ==============================================================================
-- PART 1 OF 3: TABLES, INDEXES, TRIGGERS & STRICT ZERO-LEAK RLS
-- Run this first in Supabase SQL Editor (149 lines).
-- ==============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.storefront_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text not null,
  description_md text not null,
  tier text not null check (tier in ('free_lead', 'core_12', 'pro_19', 'flagship_29')),
  price_usd numeric(10, 2) not null default 0 check (price_usd >= 0),
  checkout_url text not null default 'https://polar.sh',
  secondary_checkout_url text,
  preview_image_url text,
  features_json jsonb not null default '[]'::jsonb,
  seo_title text not null default '',
  seo_description text not null default '',
  keywords text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'qa_review', 'published', 'archived')),
  created_by_division text not null default 'DIV-08',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.storefront_products
  add column if not exists secondary_checkout_url text;

create table if not exists public.storefront_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.storefront_products(id) on delete cascade,
  buyer_name text not null,
  buyer_country text not null,
  review_text text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_storefront_products_status_tier
  on public.storefront_products (status, tier, published_at desc);

create index if not exists idx_storefront_products_slug
  on public.storefront_products (slug)
  where status = 'published';

create index if not exists idx_storefront_reviews_product_verified
  on public.storefront_reviews (product_id, is_verified, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_storefront_products_updated_at on public.storefront_products;
create trigger trg_storefront_products_updated_at
  before insert or update on public.storefront_products
  for each row
  execute function public.set_updated_at();

alter table public.storefront_products enable row level security;
alter table public.storefront_products force row level security;

alter table public.storefront_reviews enable row level security;
alter table public.storefront_reviews force row level security;

drop policy if exists "Public can read published products only" on public.storefront_products;
drop policy if exists "Public can read verified reviews of published products only" on public.storefront_reviews;

create policy "Public can read published products only"
  on public.storefront_products
  for select
  to anon, authenticated
  using (status = 'published');

create policy "Public can read verified reviews of published products only"
  on public.storefront_reviews
  for select
  to anon, authenticated
  using (
    is_verified = true
    and exists (
      select 1
      from public.storefront_products p
      where p.id = storefront_reviews.product_id
        and p.status = 'published'
    )
  );

revoke all on public.storefront_products from anon, authenticated;
revoke all on public.storefront_reviews from anon, authenticated;

grant select (
  id,
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
  published_at,
  created_at,
  updated_at
) on public.storefront_products to anon, authenticated;

grant select (
  id,
  product_id,
  buyer_name,
  buyer_country,
  review_text,
  rating,
  is_verified,
  created_at
) on public.storefront_reviews to anon, authenticated;
