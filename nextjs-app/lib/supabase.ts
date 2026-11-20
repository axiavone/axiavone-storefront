import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Public Supabase client using NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Strictly governed by RLS: can ONLY SELECT published products and verified reviews.
 */
export function createPublicSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
    );
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Server-only Supabase Admin client using SUPABASE_SERVICE_ROLE_KEY.
 * NEVER import this in Client Components or expose to the browser.
 */
export function createServiceRoleSupabaseClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('SECURITY VIOLATION: Service role client cannot run in the browser.');
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
