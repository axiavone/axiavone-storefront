import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  STATUS_LABELS,
  TIER_DEFAULT_PRICES,
  TIER_LABELS,
  type AdminProduct,
  type ProductStatus,
  type ProductTier,
} from '../types/storefront.ts';
import {
  AXIAVONE_LOGO_URL,
  formatUsdPrice,
  resolveProductCoverUrl,
  sanitizeExternalUrl,
} from '../config/productCovers.ts';
import {
  checkAdminSession,
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminProducts,
  loginAdmin,
  logoutAdmin,
  updateAdminProduct,
  uploadProductCover,
  type AdminProductInput,
} from '../lib/adminClient.ts';
import { ProductCover } from './ProductCover.tsx';

interface AdminPanelProps {
  onNavigateHome: () => void;
}

type StatusFilter = 'all' | ProductStatus;

interface ToastState {
  id: number;
  type: 'success' | 'error';
  message: string;
}

interface FormState {
  id: string | null;
  title: string;
  slug: string;
  tagline: string;
  description_md: string;
  tier: ProductTier;
  price_usd: string;
  checkout_url: string;
  secondary_checkout_url: string;
  preview_image_url: string;
  features_text: string;
  status: ProductStatus;
}

const EMPTY_FORM: FormState = {
  id: null,
  title: '',
  slug: '',
  tagline: '',
  description_md: '',
  tier: 'core_12',
  price_usd: '12',
  checkout_url: 'https://polar.sh',
  secondary_checkout_url: '',
  preview_image_url: '',
  features_text: '',
  status: 'draft',
};

function slugifyTitle(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getHostnameLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function AdminPanel({ onNavigateHome }: AdminPanelProps) {
  const [authChecking, setAuthChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [serverConfigured, setServerConfigured] = useState(true);

  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [slugLocked, setSlugLocked] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ id: Date.now(), type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.title = 'Admin Console | AXIAVONE';
  }, []);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setLoadError(null);
    try {
      const items = await fetchAdminProducts();
      setProducts(items);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to fetch storefront products.';
      if (msg.toLowerCase().includes('unauthorized')) {
        setAuthenticated(false);
      }
      setLoadError(msg);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    checkAdminSession()
      .then((res) => {
        if (!active) return;
        setServerConfigured(res.configured);
        setAuthenticated(res.authenticated);
        setAuthChecking(false);
        if (res.authenticated) {
          void loadProducts();
        }
      })
      .catch((err: Error) => {
        if (!active) return;
        setAuthError(err.message);
        setAuthChecking(false);
      });
    return () => {
      active = false;
    };
  }, [loadProducts]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setAuthError('Enter your admin passcode.');
      return;
    }
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      await loginAdmin(passcode);
      setPasscode('');
      setAuthenticated(true);
      showToast('success', 'Admin session unlocked.');
      await loadProducts();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Invalid passcode.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAuthenticated(false);
    setProducts([]);
    showToast('success', 'Signed out of AXIAVONE Admin.');
  };

  const openCreateForm = () => {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(null);
    setForm(EMPTY_FORM);
    setSlugLocked(false);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (product: AdminProduct) => {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(null);
    setForm({
      id: product.id,
      title: product.title,
      slug: product.slug,
      tagline: product.tagline,
      description_md: product.description_md.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n'),
      tier: product.tier,
      price_usd: String(product.price_usd),
      checkout_url: product.checkout_url || 'https://polar.sh',
      secondary_checkout_url: product.secondary_checkout_url || '',
      preview_image_url: product.preview_image_url || '',
      features_text: (product.features_json || []).join('\n'),
      status: product.status || 'draft',
    });
    setSlugLocked(true);
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (savingProduct || uploadingImage) return;
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(null);
    setFormOpen(false);
    setFormError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      setFormError('Selected image exceeds 12 MB. Please choose a smaller photo.');
      showToast('error', 'Image file is too large (max 12 MB).');
      return;
    }

    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    const preview = URL.createObjectURL(file);
    setLocalPreviewUrl(preview);
    setUploadingImage(true);
    setFormError(null);

    try {
      const publicUrl = await uploadProductCover(file, form.slug || form.title || 'cover');
      setForm((prev) => ({ ...prev, preview_image_url: publicUrl }));
      showToast('success', 'Cover uploaded to Supabase product-covers.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Image upload failed.';
      setFormError(msg);
      showToast('error', msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedPrice = Number(form.price_usd);
    if (!form.title.trim() || !form.slug.trim() || !form.tagline.trim()) {
      setFormError('Title, slug, and tagline are required.');
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError('Price must be a valid non-negative USD number.');
      return;
    }

    const payload: AdminProductInput = {
      title: form.title.trim(),
      slug: form.slug.trim().toLowerCase(),
      tagline: form.tagline.trim(),
      description_md: form.description_md.trim() || form.tagline.trim(),
      tier: form.tier,
      price_usd: parsedPrice,
      checkout_url: form.checkout_url.trim() || 'https://polar.sh',
      secondary_checkout_url: form.secondary_checkout_url.trim() || null,
      preview_image_url: form.preview_image_url.trim() || null,
      features_json: form.features_text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      status: form.status,
    };

    setSavingProduct(true);
    try {
      if (form.id) {
        const updated = await updateAdminProduct(form.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast('success', `Saved changes to "${updated.title}".`);
      } else {
        const created = await createAdminProduct(payload);
        setProducts((prev) => [created, ...prev]);
        showToast('success', `Created "${created.title}".`);
      }
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
      setFormOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save product.';
      setFormError(msg);
      showToast('error', msg);
    } finally {
      setSavingProduct(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast('success', `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product.';
      showToast('error', msg);
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        item.tagline.toLowerCase().includes(query)
      );
    });
  }, [products, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      total: products.length,
      published: products.filter((p) => p.status === 'published').length,
      drafts: products.filter((p) => p.status === 'draft' || p.status === 'qa_review').length,
      archived: products.filter((p) => p.status === 'archived').length,
    };
  }, [products]);

  const liveFormPreviewSrc =
    localPreviewUrl ||
    (form.preview_image_url.trim()
      ? form.preview_image_url.trim()
      : form.slug
        ? resolveProductCoverUrl(form.slug, null)
        : null);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin text-[#3B82F6]" aria-hidden="true" />
          <span>Verifying admin session...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col justify-between p-4 sm:p-6 overflow-x-hidden">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex min-h-[44px] items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Storefront
          </button>
        </header>

        <main className="mx-auto w-full max-w-md my-auto py-8">
          <div className="rounded-2xl border border-white/10 bg-[#111113] p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-10 w-10 overflow-hidden rounded-lg border border-white/15 bg-[#0D1117] shrink-0">
                <img
                  src={AXIAVONE_LOGO_URL}
                  alt="AXIAVONE logo"
                  className="h-full w-full object-cover object-[50%_20%] scale-[1.55]"
                />
              </span>
              <div>
                <h1 className="font-display text-lg font-semibold tracking-tight text-white">
                  AXIAVONE Admin
                </h1>
                <p className="text-xs text-zinc-400">Catalog &amp; Cover Management</p>
              </div>
            </div>

            {!serverConfigured ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200 leading-relaxed">
                Server passcode is not configured. Set{' '}
                <code className="font-mono text-white">AXIAVONE_ADMIN_PASSCODE</code> or{' '}
                <code className="font-mono text-white">AXIAVONE_INTERNAL_SECRET</code> in your
                environment secrets to enable admin login.
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="admin-passcode"
                    className="block text-xs font-medium text-zinc-300 mb-2"
                  >
                    Admin Passcode
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      <Lock className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <input
                      id="admin-passcode"
                      type={showPasscode ? 'text' : 'password'}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter admin passcode"
                      autoComplete="current-password"
                      autoFocus
                      className="min-h-[44px] w-full rounded-lg border border-white/15 bg-[#09090B] pl-10 pr-12 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-[#2563EB] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode((prev) => !prev)}
                      aria-label={showPasscode ? 'Hide passcode' : 'Show passcode'}
                      className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-md text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {showPasscode ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {authError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-200"
                  >
                    <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60 cursor-pointer"
                >
                  {authSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {authSubmitting ? 'Verifying...' : 'Unlock Admin Panel'}
                </button>
              </form>
            )}
          </div>
        </main>

        <footer className="mx-auto w-full max-w-5xl text-center text-[11px] text-zinc-500">
          Protected AXIAVONE Storefront Console
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col overflow-x-hidden">
      {/* Compact Sticky Admin Bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#09090B]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-8 w-8 overflow-hidden rounded-lg border border-white/15 bg-[#0D1117] shrink-0">
              <img
                src={AXIAVONE_LOGO_URL}
                alt="AXIAVONE logo"
                className="h-full w-full object-cover object-[50%_20%] scale-[1.55]"
              />
            </span>
            <span className="font-display text-base font-semibold tracking-tight text-white truncate">
              AXIAVONE Admin
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hidden sm:inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-white/15 bg-[#111113] px-3 py-2 text-xs font-medium text-zinc-300 hover:border-white/30 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Storefront
            </button>
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex min-h-[44px] sm:min-h-[40px] items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Product
            </button>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Sign out"
              title="Sign out"
              className="inline-flex min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] items-center justify-center rounded-lg border border-white/15 bg-[#111113] text-zinc-400 hover:border-white/30 hover:text-white transition-colors shrink-0 cursor-pointer"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        {/* Metrics Summary */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-white/10 bg-[#111113] p-4">
            <div className="text-xs text-zinc-400">Total Products</div>
            <div className="mt-1 font-mono text-2xl font-semibold text-white tabular-nums">
              {counts.total}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#111113] p-4">
            <div className="text-xs text-zinc-400">Published Live</div>
            <div className="mt-1 font-mono text-2xl font-semibold text-emerald-400 tabular-nums">
              {counts.published}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#111113] p-4">
            <div className="text-xs text-zinc-400">Draft &amp; QA</div>
            <div className="mt-1 font-mono text-2xl font-semibold text-amber-300 tabular-nums">
              {counts.drafts}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#111113] p-4">
            <div className="text-xs text-zinc-400">Archived</div>
            <div className="mt-1 font-mono text-2xl font-semibold text-zinc-400 tabular-nums">
              {counts.archived}
            </div>
          </div>
        </section>

        {/* Search + Status Filter Controls */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, slug, or tagline..."
              className="min-h-[44px] w-full rounded-lg border border-white/15 bg-[#111113] pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div
            role="tablist"
            aria-label="Filter products by status"
            className="flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-[#111113] p-1"
          >
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'published', label: 'Published' },
                { id: 'draft', label: 'Draft' },
                { id: 'qa_review', label: 'QA Review' },
                { id: 'archived', label: 'Archived' },
              ] as Array<{ id: StatusFilter; label: string }>
            ).map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`min-h-[36px] rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active ? 'bg-[#2563EB] text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* Product List / Table */}
        {loadingProducts ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-white/10 bg-[#111113] animate-pulse"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-red-500/30 bg-[#111113] p-6 text-center space-y-3">
            <p className="text-sm text-red-200">{loadError}</p>
            <button
              type="button"
              onClick={() => void loadProducts()}
              className="min-h-[44px] rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] cursor-pointer"
            >
              Retry Fetch
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-[#111113] p-10 text-center space-y-3">
            <p className="text-sm text-zinc-400">
              {products.length === 0
                ? 'No products found in Supabase storefront_products.'
                : 'No products match the current search or status filter.'}
            </p>
            {products.length === 0 && (
              <button
                type="button"
                onClick={openCreateForm}
                className="min-h-[44px] inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] cursor-pointer"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add First Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile-First Cards (< md) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="rounded-xl border border-white/10 bg-[#111113] overflow-hidden"
                >
                  <div className="flex gap-3.5 p-4">
                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#18181B]">
                      <ProductCover
                        slug={product.slug}
                        title={product.title}
                        tier={product.tier}
                        priceUsd={product.price_usd}
                        imageUrl={product.preview_image_url}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
                        <span
                          className={
                            product.status === 'published'
                              ? 'text-emerald-400 font-medium'
                              : product.status === 'archived'
                                ? 'text-zinc-500 font-medium'
                                : 'text-amber-300 font-medium'
                          }
                        >
                          {STATUS_LABELS[product.status]} · {TIER_LABELS[product.tier]}
                        </span>
                        <span className="font-mono font-semibold text-white tabular-nums shrink-0">
                          {product.price_usd === 0 ? '$0' : formatUsdPrice(product.price_usd)}
                        </span>
                      </div>
                      <h2 className="mt-1 font-display text-sm font-semibold text-white line-clamp-2">
                        {product.title}
                      </h2>
                      <div className="mt-1 font-mono text-[11px] text-zinc-400 truncate">
                        /{product.slug}
                      </div>
                      <div className="mt-1 text-[11px] text-zinc-500 truncate">
                        Checkout: {getHostnameLabel(product.checkout_url)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 border-t border-white/10 divide-x divide-white/10">
                    <button
                      type="button"
                      onClick={() => openEditForm(product)}
                      className="min-h-[44px] inline-flex items-center justify-center gap-2 text-xs font-medium text-zinc-200 hover:bg-white/[0.04] hover:text-white transition-colors cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#60A5FA]" aria-hidden="true" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(product)}
                      className="min-h-[44px] inline-flex items-center justify-center gap-2 text-xs font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Desktop High-Density Table (md+) */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-[#111113]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-medium text-zinc-400">
                    <th className="py-3.5 pl-4 pr-3">Product</th>
                    <th className="py-3.5 px-3">Tier &amp; Price</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Checkout Link</th>
                    <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-sm">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pl-4 pr-3 max-w-md">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#18181B]">
                            <ProductCover
                              slug={product.slug}
                              title={product.title}
                              tier={product.tier}
                              priceUsd={product.price_usd}
                              imageUrl={product.preview_image_url}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-display font-medium text-white truncate">
                              {product.title}
                            </div>
                            <div className="mt-0.5 font-mono text-xs text-zinc-400 truncate">
                              /{product.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-mono text-sm font-semibold text-white tabular-nums">
                          {product.price_usd === 0
                            ? '$0 USD'
                            : `${formatUsdPrice(product.price_usd)} USD`}
                        </div>
                        <div className="text-xs text-zinc-400">{TIER_LABELS[product.tier]}</div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={`text-xs font-medium ${
                            product.status === 'published'
                              ? 'text-emerald-400'
                              : product.status === 'archived'
                                ? 'text-zinc-500'
                                : 'text-amber-300'
                          }`}
                        >
                          {STATUS_LABELS[product.status]}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 max-w-[220px]">
                        <a
                          href={sanitizeExternalUrl(product.checkout_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-xs text-[#60A5FA] hover:underline truncate max-w-full"
                          title={product.checkout_url}
                        >
                          <span className="truncate">{product.checkout_url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                        </a>
                      </td>
                      <td className="py-3.5 pl-3 pr-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(product)}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-white/15 bg-[#18181B] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-white/30 hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-[#60A5FA]" aria-hidden="true" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* Add / Edit Product Slide-Over Drawer / Modal */}
      {formOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-form-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4"
          onClick={closeForm}
        >
          <div
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-white/15 bg-[#111113] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 shrink-0">
              <h2 id="product-form-title" className="font-display text-base font-semibold text-white">
                {form.id ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form
              id="admin-product-form"
              onSubmit={handleSaveProduct}
              className="flex-1 overflow-y-auto px-5 py-5 space-y-5"
            >
              {/* Cover Upload & Live Preview */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-zinc-300">
                  Product Cover Image (Supabase Storage: product-covers)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5 aspect-[4/3] overflow-hidden rounded-xl border border-white/15 bg-[#09090B]">
                    {liveFormPreviewSrc ? (
                      <img
                        src={liveFormPreviewSrc}
                        alt={form.title || 'Product cover preview'}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ProductCover
                        slug={form.slug || 'new-product'}
                        title={form.title || 'Cover Preview'}
                        tier={form.tier}
                        priceUsd={Number(form.price_usd) || 0}
                        imageUrl={null}
                      />
                    )}
                  </div>

                  <div className="sm:col-span-7 space-y-2.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#2563EB]/60 bg-[#2563EB]/15 px-4 py-2.5 text-xs font-semibold text-[#60A5FA] hover:bg-[#2563EB]/25 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <ImagePlus className="h-4 w-4" aria-hidden="true" />
                      )}
                      {uploadingImage
                        ? 'Uploading to Supabase...'
                        : 'Pick Image from Phone / Computer'}
                    </button>

                    <input
                      type="text"
                      value={form.preview_image_url}
                      onChange={(e) => {
                        if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
                        setLocalPreviewUrl(null);
                        setForm((prev) => ({ ...prev, preview_image_url: e.target.value }));
                      }}
                      placeholder="https://... or /assets/..."
                      aria-label="Image URL"
                      className="min-h-[44px] w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 font-mono text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-[#2563EB] focus:outline-none"
                    />
                    {form.preview_image_url && (
                      <button
                        type="button"
                        onClick={() => {
                          if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
                          setLocalPreviewUrl(null);
                          setForm((prev) => ({ ...prev, preview_image_url: '' }));
                        }}
                        className="text-xs text-zinc-400 hover:text-white underline underline-offset-4 cursor-pointer"
                      >
                        Clear image URL
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-title" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Title
                  </label>
                  <input
                    id="field-title"
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => {
                      const nextTitle = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        title: nextTitle,
                        slug: !slugLocked ? slugifyTitle(nextTitle) : prev.slug,
                      }));
                    }}
                    placeholder="Zero-Leak Supabase RLS Kit"
                    className="min-h-[44px] w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#2563EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="field-slug" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Slug (URL path)
                  </label>
                  <input
                    id="field-slug"
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => {
                      setSlugLocked(true);
                      setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }));
                    }}
                    placeholder="zero-leak-supabase-rls-kit"
                    className="min-h-[44px] w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-500 focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
              </div>

              {/* Tier, Price USD, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="field-tier" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Tier
                  </label>
                  <select
                    id="field-tier"
                    value={form.tier}
                    onChange={(e) => {
                      const nextTier = e.target.value as ProductTier;
                      setForm((prev) => ({
                        ...prev,
                        tier: nextTier,
                        price_usd: prev.id ? prev.price_usd : String(TIER_DEFAULT_PRICES[nextTier]),
                      }));
                    }}
                    className="min-h-[44px] w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-white focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="free_lead">Free Tool ($0)</option>
                    <option value="core_12">Core ($12)</option>
                    <option value="pro_19">Pro ($19)</option>
                    <option value="flagship_29">Flagship ($29)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="field-price" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Price (USD)
                  </label>
                  <input
                    id="field-price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.price_usd}
                    onChange={(e) => setForm((prev) => ({ ...prev, price_usd: e.target.value }))}
                    className="min-h-[44px] w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 font-mono text-sm text-white tabular-nums focus:border-[#2563EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="field-status" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Status
                  </label>
                  <select
                    id="field-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, status: e.target.value as ProductStatus }))
                    }
                    className="min-h-[44px] w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-white focus:border-[#2563EB] focus:outline-none"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="qa_review">QA Review (Hidden)</option>
                    <option value="archived">Archived (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Checkout URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="field-checkout" className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Primary Checkout URL (Polar.sh)
                  </label>
                  <input
                    id="field-checkout"
                    type="url"
                    required
                    value={form.checkout_url}
                    onChange={(e) => setForm((prev) => ({ ...prev, checkout_url: e.target.value }))}
                    placeholder="https://buy.polar.sh/..."
                    className="min-h-[44px] w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-500 focus:border-[#2563EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field-secondary-checkout"
                    className="block text-xs font-medium text-zinc-300 mb-1.5"
                  >
                    Secondary Checkout URL (Optional)
                  </label>
                  <input
                    id="field-secondary-checkout"
                    type="url"
                    value={form.secondary_checkout_url}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, secondary_checkout_url: e.target.value }))
                    }
                    placeholder="https://lemonsqueezy.com/..."
                    className="min-h-[44px] w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 font-mono text-xs text-white placeholder:text-zinc-500 focus:border-[#2563EB] focus:outline-none"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div>
                <label htmlFor="field-tagline" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Tagline
                </label>
                <input
                  id="field-tagline"
                  type="text"
                  required
                  value={form.tagline}
                  onChange={(e) => setForm((prev) => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Concise 1-sentence value proposition for Tier-1 buyers..."
                  className="min-h-[44px] w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              {/* Description Markdown */}
              <div>
                <label
                  htmlFor="field-description"
                  className="block text-xs font-medium text-zinc-300 mb-1.5"
                >
                  Description (Markdown)
                </label>
                <textarea
                  id="field-description"
                  rows={5}
                  value={form.description_md}
                  onChange={(e) => setForm((prev) => ({ ...prev, description_md: e.target.value }))}
                  placeholder="## Overview&#10;&#10;- Feature or architectural detail..."
                  className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2.5 font-mono text-xs text-white placeholder:text-zinc-500 focus:border-[#2563EB] focus:outline-none leading-relaxed"
                />
              </div>

              {/* Key Features */}
              <div>
                <label htmlFor="field-features" className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Bullet Features (one per line)
                </label>
                <textarea
                  id="field-features"
                  rows={3}
                  value={form.features_text}
                  onChange={(e) => setForm((prev) => ({ ...prev, features_text: e.target.value }))}
                  placeholder="Complete multi-tenant Postgres schema&#10;Automated SQL tenant-isolation tests"
                  className="w-full rounded-lg border border-white/15 bg-[#09090B] px-3 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-[#2563EB] focus:outline-none leading-relaxed"
                />
              </div>

              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-200"
                >
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}
            </form>

            {/* Sticky Footer Save / Cancel */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-[#111113] px-5 py-4 shrink-0">
              <button
                type="button"
                onClick={closeForm}
                disabled={savingProduct || uploadingImage}
                className="min-h-[44px] rounded-lg border border-white/15 bg-[#18181B] px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="admin-product-form"
                disabled={savingProduct || uploadingImage}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {savingProduct && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {savingProduct
                  ? 'Saving...'
                  : form.id
                    ? 'Save Changes'
                    : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Safe Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/15 bg-[#111113] p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-confirm-title" className="font-display text-lg font-semibold text-white">
              Delete Product?
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This will permanently remove{' '}
              <span className="font-medium text-white">{deleteTarget.title}</span> (
              <code className="font-mono text-xs text-zinc-300">/{deleteTarget.slug}</code>) from
              Supabase. This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="min-h-[44px] rounded-lg border border-white/15 bg-[#18181B] px-4 py-2 text-xs font-medium text-zinc-200 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B91C1C] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {deleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-medium shadow-2xl sm:max-w-sm ${
            toast.type === 'success'
              ? 'border-emerald-500/35 bg-[#111113] text-emerald-200'
              : 'border-red-500/35 bg-[#111113] text-red-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" aria-hidden="true" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
