import type { AdminProduct, ProductStatus, ProductTier } from '../types/storefront.ts';

const TOKEN_STORAGE_KEY = 'axiavone_admin_session_token';

export interface AdminProductInput {
  title: string;
  slug: string;
  tagline: string;
  description_md: string;
  tier: ProductTier;
  price_usd: number;
  checkout_url: string;
  secondary_checkout_url: string | null;
  preview_image_url: string | null;
  features_json: string[];
  status: ProductStatus;
}

function getStoredToken(): string | null {
  try {
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null): void {
  try {
    if (token) {
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage unavailability
  }
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  return token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : {
        'Content-Type': 'application/json',
      };
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('Admin API endpoint is unavailable in this environment.');
  }
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) {
    if (res.status === 401) {
      setStoredToken(null);
    }
    throw new Error(data.error || `Request failed (${res.status}).`);
  }
  return data;
}

export async function checkAdminSession(): Promise<{
  authenticated: boolean;
  configured: boolean;
}> {
  const token = getStoredToken();
  const res = await fetch('/api/admin/auth', {
    method: 'GET',
    credentials: 'same-origin',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return parseJsonResponse<{ authenticated: boolean; configured: boolean }>(res);
}

export async function loginAdmin(passcode: string): Promise<void> {
  const res = await fetch('/api/admin/auth', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  });
  const data = await parseJsonResponse<{ authenticated: boolean; token?: string }>(res);
  if (data.token) {
    setStoredToken(data.token);
  }
}

export async function logoutAdmin(): Promise<void> {
  setStoredToken(null);
  await fetch('/api/admin/logout', {
    method: 'POST',
    credentials: 'same-origin',
  }).catch(() => undefined);
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const token = getStoredToken();
  const res = await fetch('/api/admin/products', {
    method: 'GET',
    credentials: 'same-origin',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  const data = await parseJsonResponse<{ products: AdminProduct[] }>(res);
  return data.products;
}

export async function createAdminProduct(input: AdminProductInput): Promise<AdminProduct> {
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    credentials: 'same-origin',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  const data = await parseJsonResponse<{ product: AdminProduct }>(res);
  return data.product;
}

export async function updateAdminProduct(
  id: string,
  input: AdminProductInput
): Promise<AdminProduct> {
  const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  const data = await parseJsonResponse<{ product: AdminProduct }>(res);
  return data.product;
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const token = getStoredToken();
  const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  await parseJsonResponse<{ ok: boolean }>(res);
}

function readFileAsBase64(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      if (!base64) {
        reject(new Error('Could not read selected image file.'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.readAsDataURL(file);
  });
}

async function prepareImagePayload(
  file: File
): Promise<{ base64: string; contentType: string; filename: string }> {
  const mime = file.type.toLowerCase();
  const compressible = mime === 'image/jpeg' || mime === 'image/png' || mime === 'image/webp';

  // Downscale large mobile camera photos (> 2.5 MB) smoothly so uploads stay fast over LTE
  if (compressible && file.size > 2.5 * 1024 * 1024 && typeof document !== 'undefined') {
    try {
      const bitmapUrl = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error('Image decode failed'));
        el.src = bitmapUrl;
      });
      URL.revokeObjectURL(bitmapUrl);

      const maxDim = 1920;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const targetMime = mime === 'image/png' ? 'image/png' : 'image/jpeg';
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), targetMime, 0.88)
        );
        if (blob && blob.size < file.size) {
          return {
            base64: await readFileAsBase64(blob),
            contentType: targetMime,
            filename: file.name,
          };
        }
      }
    } catch {
      // Fallback to raw file upload below
    }
  }

  return {
    base64: await readFileAsBase64(file),
    contentType: file.type || 'image/jpeg',
    filename: file.name,
  };
}

export async function uploadProductCover(file: File, slug: string): Promise<string> {
  const payload = await prepareImagePayload(file);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    credentials: 'same-origin',
    headers: authHeaders(),
    body: JSON.stringify({
      ...payload,
      slug,
    }),
  });
  const data = await parseJsonResponse<{ ok: boolean; url: string }>(res);
  return data.url;
}
