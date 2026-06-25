import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseApiUrl, getSupabasePublishableKey } from '@/lib/db/env';
import { ADMIN_ROLE_SET, roleFromAuthUser } from '@/lib/auth/rbac';
import type { UserRole } from '@/types';

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

  if (!isAdminRoute) {
    return NextResponse.next({ request });
  }

  const url = getSupabaseApiUrl();
  const anonKey = getSupabasePublishableKey();
  if (!url || !anonKey) {
    if (!isLoginRoute) {
      return loginRedirect(request);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!isLoginRoute) {
    if (!user) {
      return loginRedirect(request);
    }

    const role = await resolveAdminRole(supabase, user);
    if (!role) {
      await supabase.auth.signOut();
      return loginRedirect(request, 'access_denied');
    }

    if (pathname.startsWith('/admin/settings') && role !== 'super_admin') {
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
  matcher: ['/admin', '/admin/:path*'],
};
