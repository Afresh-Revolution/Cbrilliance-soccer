import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseApiUrl, getSupabasePublishableKey } from '@/lib/db/env';
import { ADMIN_ROLE_SET, roleFromAuthUser } from '@/lib/auth/rbac';
import type { UserRole } from '@/types';

function isProtectedApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/admin') || pathname === '/api/upload';
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isLoginPath(pathname: string): boolean {
  return pathname === '/admin/login' || pathname.startsWith('/admin/login/');
}

function loginRedirect(request: NextRequest, error?: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = '/admin/login';
  redirectUrl.search = '';
  if (error) {
    redirectUrl.searchParams.set('error', error);
  }
  return NextResponse.redirect(redirectUrl);
}

function nextWithPathname(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

async function resolveAdminRole(
  supabase: ReturnType<typeof createServerClient>,
  user: { id: string; app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> },
): Promise<UserRole | null> {
  const fromMetadata = roleFromAuthUser(user);
  if (fromMetadata) return fromMetadata;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role && ADMIN_ROLE_SET.has(profile.role as UserRole)) {
    return profile.role as UserRole;
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = isAdminPath(pathname);
  const isLoginRoute = isLoginPath(pathname);
  const isProtectedApi = isProtectedApiPath(pathname);

  if (!isAdminRoute && !isProtectedApi) {
    return nextWithPathname(request);
  }

  const url = getSupabaseApiUrl();
  const anonKey = getSupabasePublishableKey();
  if (!url || !anonKey) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!isLoginRoute) {
      return loginRedirect(request);
    }
    return nextWithPathname(request);
  }

  let supabaseResponse = nextWithPathname(request);

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = nextWithPathname(request);
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!isLoginRoute || isProtectedApi) {
    if (!user) {
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return loginRedirect(request);
    }

    const role = await resolveAdminRole(supabase, user);
    if (!role) {
      await supabase.auth.signOut();
      if (isProtectedApi) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return loginRedirect(request, 'access_denied');
    }

    if (isAdminRoute && pathname.startsWith('/admin/settings') && role !== 'super_admin') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin';
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isLoginRoute && user) {
    const role = await resolveAdminRole(supabase, user);
    if (role) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/admin';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*', '/api/upload'],
};
