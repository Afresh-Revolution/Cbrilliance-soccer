import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseApiUrl, getSupabasePublishableKey, SUPABASE_ENV_HINT } from '@/lib/db/env';

export function createClient() {
  const url = getSupabaseApiUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) {
    throw new Error(`Supabase API is not configured. ${SUPABASE_ENV_HINT}`);
  }
  return createBrowserClient(url, key);
}
