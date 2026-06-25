import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import {
  getSupabaseApiUrl,
  getSupabasePublishableKey,
  getSupabaseServiceRoleKey,
  SUPABASE_ENV_HINT,
} from '@/lib/db/env';

function getSupabaseConfig() {
  const url = getSupabaseApiUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) {
    throw new Error(`Supabase API is not configured. ${SUPABASE_ENV_HINT}`);
  }
  return { url, key };
}

/** Server Components / Server Actions — reads/writes via next/headers cookies. */
export async function createClient() {
  const { url, key } = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component — ignore
        }
      },
    },
  });
}

/**
 * Route Handlers — must write auth cookies onto the outgoing NextResponse.
 * Without this, signInWithPassword succeeds but the browser never gets the session.
 */
export function createRouteHandlerClient(request: NextRequest, response: NextResponse) {
  const { url, key } = getSupabaseConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}

export async function createServiceClient() {
  const url = getSupabaseApiUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key) {
    throw new Error(
      'Supabase service role is not configured. Set SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY).',
    );
  }

  const { createClient } = await import('@supabase/supabase-js');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
