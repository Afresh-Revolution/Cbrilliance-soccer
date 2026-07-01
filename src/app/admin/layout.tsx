import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminShell from '@/components/admin/AdminShell';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { hasPermission } from '@/lib/auth/rbac';
import { requiredPermissionForAdminPath } from '@/lib/admin/route-permissions';
export const dynamic = 'force-dynamic';

function isLoginPath(pathname: string): boolean {
  return pathname === '/admin/login' || pathname.startsWith('/admin/login/');
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get('x-pathname') ?? '';

  if (isLoginPath(pathname)) {
    return children;
  }

  const ctx = await requireAdminSession();

  const permission = requiredPermissionForAdminPath(pathname);
  if (permission && !hasPermission(ctx.profile.role, permission)) {
    redirect('/admin?error=access_denied');
  }

  return <AdminShell role={ctx.profile.role}>{children}</AdminShell>;}
