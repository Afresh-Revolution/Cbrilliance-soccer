import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { hasPermission } from '@/lib/auth/rbac';
import AdminSettingsForm from '@/components/admin/AdminSettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const ctx = await requireAdminSession();
  if (!hasPermission(ctx.profile.role, 'admin.settings')) {
    redirect('/admin');
  }

  return (
    <div>
      <h1 className="mb-lg">Settings</h1>
      <AdminSettingsForm currentEmail={ctx.email} />
    </div>
  );
}
