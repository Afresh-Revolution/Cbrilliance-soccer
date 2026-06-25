/**
 * Supabase connection configuration.
 *
 * - API URL + publishable key → @supabase/supabase-js (auth, REST, RLS queries)
 * - Service role / secret key → server-only admin operations
 * - DATABASE_URL → direct PostgreSQL (migrations, scripts, ORMs)
 */

const PLACEHOLDER_API_URL = 'your_supabase_url';

const PLACEHOLDER_KEYS = new Set([
  'your_supabase_anon_key',
  'your_supabase_publishable_key',
  'your_supabase_service_role_key',
  'your_supabase_secret_key',
]);

export function getSupabaseApiUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url === PLACEHOLDER_API_URL || url.includes('YOUR_PROJECT_REF')) {
    return undefined;
  }
  return url;
}

/** Client-safe key (Supabase "publishable" / legacy "anon" key). */
export function getSupabasePublishableKey(): string | undefined {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key || PLACEHOLDER_KEYS.has(key)) return undefined;
  return key;
}

/** @deprecated Use getSupabasePublishableKey — kept for existing imports. */
export function getSupabaseAnonKey(): string | undefined {
  return getSupabasePublishableKey();
}

/** Server-only key (Supabase "secret" / legacy "service_role" key). */
export function getSupabaseServiceRoleKey(): string | undefined {
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY;

  if (!key || PLACEHOLDER_KEYS.has(key)) return undefined;

  if (key.startsWith('sb_publishable_')) return undefined;

  return key;
}

/** Returns a human-readable error when the secret key env is wrong. */
export function getSupabaseSecretKeyError(): string | null {
  const raw =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!raw || PLACEHOLDER_KEYS.has(raw)) {
    return (
      'Missing SUPABASE_SECRET_KEY in .env.\n' +
      'Supabase → Project Settings → API → secret key (starts with sb_secret_).\n' +
      'Legacy projects: use the service_role JWT from the "Legacy API keys" tab.'
    );
  }

  if (raw.startsWith('sb_publishable_')) {
    return (
      'SUPABASE_SECRET_KEY is set to your publishable key (sb_publishable_...).\n' +
      'That key cannot create admin users. Copy the secret key (sb_secret_...) instead.\n' +
      'Supabase → Project Settings → API → secret key.'
    );
  }

  if (!raw.startsWith('sb_secret_') && !raw.startsWith('eyJ')) {
    return (
      'SUPABASE_SECRET_KEY does not look valid.\n' +
      'Expected sb_secret_... (new keys) or eyJ... (legacy service_role JWT).'
    );
  }

  return null;
}

/** True when the Supabase JS client can be used (API URL + publishable key). */
export function isSupabaseApiConfigured(): boolean {
  return Boolean(getSupabaseApiUrl() && getSupabasePublishableKey());
}

/** True when server-side service role operations are available. */
export function isSupabaseServiceConfigured(): boolean {
  return Boolean(getSupabaseApiUrl() && getSupabaseServiceRoleKey());
}

export function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes('[PASSWORD]') || url.includes('[PROJECT_REF]')) {
    return undefined;
  }
  return url;
}

export function isPostgresConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

export const SUPABASE_ENV_HINT =
  'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).';
