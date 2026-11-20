import { useEffect, useState } from 'react';
import { TIER_LABELS, type ProductTier } from '../types/storefront.ts';
import { resolveProductCoverUrl } from '../config/productCovers.ts';

interface ProductCoverProps {
  slug: string;
  title: string;
  tier: ProductTier;
  priceUsd: number;
  imageUrl: string | null;
  className?: string;
}

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function ProductCover({
  slug,
  title,
  tier,
  priceUsd,
  imageUrl,
  className = '',
}: ProductCoverProps) {
  const [failed, setFailed] = useState(false);
  const resolvedUrl = resolveProductCoverUrl(slug, imageUrl);

  useEffect(() => {
    setFailed(false);
  }, [resolvedUrl, slug]);

  if (resolvedUrl && !failed) {
    return (
      <img
        src={resolvedUrl}
        alt={title}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const seed = hashSeed(slug || title);
  const accentX = 55 + (seed % 30);
  const barWidthA = 48 + (seed % 38);
  const barWidthB = 34 + ((seed >> 3) % 44);
  const barWidthC = 58 + ((seed >> 6) % 30);
  const tierLabel = TIER_LABELS[tier];

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#09090B] p-6 ${className}`}
    >
      {/* Deterministic Architectural Grid & Cobalt Glow */}
      <svg
        aria-hidden="true"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <pattern
            id={`grid-${seed}`}
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 36 0 L 0 0 0 36"
              fill="none"
              stroke="#FFFFFF"
              strokeOpacity="0.045"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id={`glow-${seed}`} cx={`${accentX}%`} cy="35%" r="55%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#09090B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="800" height="600" fill={`url(#grid-${seed})`} />
        <rect width="800" height="600" fill={`url(#glow-${seed})`} />
        <rect
          x="36"
          y="36"
          width="728"
          height="528"
          rx="14"
          fill="#111113"
          fillOpacity="0.72"
          stroke="#FFFFFF"
          strokeOpacity="0.1"
          strokeWidth="1"
        />
        <rect
          x="68"
          y="210"
          width={`${barWidthA * 5.2}`}
          height="10"
          rx="5"
          fill="#3B82F6"
          fillOpacity="0.65"
        />
        <rect
          x="68"
          y="236"
          width={`${barWidthB * 5.2}`}
          height="10"
          rx="5"
          fill="#E4E4E7"
          fillOpacity="0.16"
        />
        <rect
          x="68"
          y="262"
          width={`${barWidthC * 5.2}`}
          height="10"
          rx="5"
          fill="#E4E4E7"
          fillOpacity="0.1"
        />
        <circle cx="670" cy="140" r="46" stroke="#3B82F6" strokeOpacity="0.35" strokeWidth="1.5" />
        <circle cx="670" cy="140" r="22" fill="#2563EB" fillOpacity="0.22" stroke="#60A5FA" strokeWidth="1.5" />
      </svg>

      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span>AXIAVONE · {tierLabel.toUpperCase()}</span>
        <span className="tabular-nums text-zinc-300">
          {priceUsd === 0 ? '$0 USD' : `$${priceUsd.toFixed(0)} USD`}
        </span>
      </div>

      <div className="relative z-10 mt-auto pt-12">
        <div className="font-mono text-[11px] text-[#60A5FA] truncate mb-2">
          /{slug}
        </div>
        <div className="font-display text-lg sm:text-xl font-semibold tracking-tight text-white leading-snug line-clamp-2 [text-wrap:balance]">
          {title}
        </div>
      </div>
    </div>
  );
}
