import { useEffect } from 'react';
import { X } from 'lucide-react';

export type LegalDocType = 'terms' | 'privacy' | 'license' | null;

interface LegalModalProps {
  doc: LegalDocType;
  onClose: () => void;
}

export function LegalModal({ doc, onClose }: LegalModalProps) {
  useEffect(() => {
    if (!doc) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [doc, onClose]);

  if (!doc) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-white/15 bg-[#111113] p-6 text-sm text-zinc-300 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 id="legal-modal-title" className="font-display text-lg font-semibold text-white">
            {doc === 'terms' && 'Terms of Service'}
            {doc === 'privacy' && 'Privacy Policy'}
            {doc === 'license' && 'Commercial Software License'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close legal dialog"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 space-y-3 leading-relaxed text-zinc-400">
          {doc === 'terms' && (
            <>
              <p>
                All digital engineering kits, source templates, and architectural playbooks sold by
                AXIAVONE are delivered instantaneously upon USD payment authorization via Polar.sh or
                Lemon Squeezy.
              </p>
              <p>
                Because source repositories are irrevocably delivered upon download, refunds are
                reviewed within 14 days strictly for verified technical defects that cannot be
                remediated via support.
              </p>
            </>
          )}
          {doc === 'privacy' && (
            <>
              <p>
                This public storefront operates with zero third-party ad trackers or behavioral
                profiling cookies.
              </p>
              <p>
                Checkout, tax calculation (US sales tax, UK VAT, Canadian GST, Australian GST), and
                invoicing are executed directly by our Merchant-of-Record payment partners.
              </p>
            </>
          )}
          {doc === 'license' && (
            <>
              <p>
                Each purchase grants a non-exclusive, perpetual, worldwide commercial license to
                modify, compile, and deploy the delivered code inside unlimited personal or client
                production software applications.
              </p>
              <p>
                Redistribution, sublicensing, or resale of the unmodified starter kit as a competing
                boilerplate or developer template is prohibited.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
