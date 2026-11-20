# AXIAVONE Public Storefront — AI Sync & Vercel Deployment Guide

## 1. Environment Variables (Vercel Project Settings)

Configure these in **Vercel Dashboard -> Project -> Settings -> Environment Variables**:

| Variable | Scope | Visibility | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Public | Read-only anon key (enforced by RLS) |
| `NEXT_PUBLIC_SITE_URL` | Production | Public | Canonical domain for `sitemap.ts` and `robots.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | Production only | **Secret** | Server-side upsert inside `/api/ai-sync` |
| `AXIAVONE_INTERNAL_SECRET` | Production only | **Secret** | 64-char hex bearer secret (`openssl rand -hex 32`) |

---

## 2. Step-by-Step Deployment Checklist

1. **Provision Supabase Schema & RLS**:
   - Open your Supabase SQL Editor and run `supabase/schema.sql`.
   - Confirm RLS is enabled on `storefront_products` and `storefront_reviews` and that `anon` can only `SELECT` rows where `status = 'published'` and `is_verified = true`.
2. **Generate Internal Webhook Secret**:
   ```bash
   openssl rand -hex 32
   ```
   Store the exact same secret in your private **AXIAVONE HQ** environment and as `AXIAVONE_INTERNAL_SECRET` in Vercel.
3. **Copy Next.js App Files into `axiavone-storefront`**:
   - Copy `nextjs-app/app/`, `nextjs-app/components/`, `nextjs-app/lib/`, and `.env.example` into your Next.js App Router repository (`npx create-next-app@latest` with TypeScript + Tailwind CSS + `lucide-react` + `@supabase/supabase-js` + `react-markdown` + `@tailwindcss/typography`).
4. **Deploy to Vercel**:
   - Connect the `axiavone-storefront` repository to Vercel.
   - Add all 5 environment variables above.
   - Deploy to production and verify `https://store.axiavone.com/sitemap.xml` and `https://store.axiavone.com/robots.txt`.

---

## 3. Calling `/api/ai-sync` from AXIAVONE HQ Divisions

### Example A: Upsert / Publish a Product (DIV-08 + DIV-09 + DIV-15 + DIV-21)

```bash
curl -X POST "https://store.axiavone.com/api/ai-sync" \
  -H "Authorization: Bearer YOUR_AXIAVONE_INTERNAL_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "upsert_product",
    "product": {
      "slug": "nextjs-edge-rate-limiter-pro",
      "title": "Next.js Edge Rate Limiter & Abuse Shield",
      "tagline": "Distributed sliding-window rate limiting and bot mitigation middleware for Vercel Edge.",
      "description_md": "## Production Edge Protection\n\nDrop-in TypeScript middleware preventing credential stuffing and API scraping.",
      "tier": "pro_19",
      "price_usd": 19,
      "checkout_url": "https://buy.polar.sh/axiavone-edge-rate-limiter",
      "preview_image_url": "https://store.axiavone.com/images/rate-limiter.jpg",
      "features_json": [
        "Sliding-window Redis & Upstash adapter",
        "Zero cold-start Edge Middleware",
        "Automated IP reputation & burst rules"
      ],
      "seo_title": "Next.js Edge Rate Limiter ($19) | AXIAVONE",
      "seo_description": "Distributed sliding-window rate limiting middleware for Next.js App Router and Vercel Edge.",
      "keywords": ["nextjs rate limiter", "vercel edge security", "api abuse protection"],
      "status": "published",
      "created_by_division": "DIV-08"
    }
  }'
```

### Example B: Add a Verified Buyer Review (DIV-19 Social Proof)

```bash
curl -X POST "https://store.axiavone.com/api/ai-sync" \
  -H "Authorization: Bearer YOUR_AXIAVONE_INTERNAL_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add_review",
    "review": {
      "product_slug": "nextjs-edge-rate-limiter-pro",
      "buyer_name": "Elena Rostova, VP Engineering at FinStack",
      "buyer_country": "United Kingdom",
      "review_text": "Blocked an automated credential-stuffing spike within 10 minutes of deploying to production.",
      "rating": 5,
      "is_verified": true
    }
  }'
```
