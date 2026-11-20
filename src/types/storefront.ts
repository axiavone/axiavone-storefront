export type ProductTier = 'free_lead' | 'core_12' | 'pro_19' | 'flagship_29';

export type ProductStatus = 'draft' | 'qa_review' | 'published' | 'archived';

export interface PublicProduct {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description_md: string;
  tier: ProductTier;
  price_usd: number;
  checkout_url: string;
  secondary_checkout_url: string | null;
  preview_image_url: string | null;
  features_json: string[];
  seo_title: string;
  seo_description: string;
  keywords: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface PublicReview {
  id: string;
  product_id: string;
  buyer_name: string;
  buyer_country: string;
  review_text: string;
  rating: number;
  is_verified: boolean;
  created_at: string;
}

export interface ProductDetailResponse {
  product: PublicProduct;
  reviews: PublicReview[];
}

export const TIER_LABELS: Record<ProductTier, string> = {
  free_lead: 'Free Tool',
  core_12: 'Core',
  pro_19: 'Pro',
  flagship_29: 'Flagship',
};

export const TIER_FILTERS: Array<{ id: 'all' | ProductTier; label: string }> = [
  { id: 'all', label: 'All Products' },
  { id: 'free_lead', label: 'Free Tools' },
  { id: 'core_12', label: 'Core $12' },
  { id: 'pro_19', label: 'Pro $19' },
  { id: 'flagship_29', label: 'Flagship $29' },
];
