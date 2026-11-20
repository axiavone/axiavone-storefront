export type SocialPlatform =
  | 'instagram'
  | 'threads'
  | 'tiktok'
  | 'x'
  | 'youtube'
  | 'linkedin'
  | 'pinterest';

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  href: string;
}

/**
 * Central AXIAVONE Storefront Social Links Configuration.
 * Add or uncomment platforms below to display them automatically in the Footer.
 */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/axiavone',
  },
  {
    platform: 'threads',
    label: 'Threads',
    href: 'https://www.threads.com/@axiavone',
  },
  {
    platform: 'tiktok',
    label: 'TikTok',
    href: 'https://www.tiktok.com/@axiavone.digital',
  },
  {
    platform: 'x',
    label: 'X (Twitter)',
    href: 'https://x.com/axiavonedigital',
  },
  // {
  //   platform: 'youtube',
  //   label: 'YouTube',
  //   href: 'https://www.youtube.com/@axiavone',
  // },
  // {
  //   platform: 'linkedin',
  //   label: 'LinkedIn',
  //   href: 'https://www.linkedin.com/company/axiavone',
  // },
  // {
  //   platform: 'pinterest',
  //   label: 'Pinterest',
  //   href: 'https://www.pinterest.com/axiavone',
  // },
];
