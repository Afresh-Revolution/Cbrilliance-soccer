import { redirect } from 'next/navigation';
import { isSupabaseApiConfigured } from '@/lib/db/env';
import { getAuthContext, type AuthContext } from '@/lib/auth/session';
import { isAdminRole } from '@/lib/auth/rbac';

export async function requireAdminSession(): Promise<AuthContext> {
  if (!isSupabaseApiConfigured()) {
    redirect('/admin/login');
  }

  const ctx = await getAuthContext();
  if (!ctx) {
    redirect('/admin/login');
  }

  if (!isAdminRole(ctx.profile.role)) {
    redirect('/admin/login?error=access_denied');
  }

  return ctx;
}
