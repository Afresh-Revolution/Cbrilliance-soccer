import AdminBackToSiteLink from '@/components/admin/AdminBackToSiteLink';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';

interface Props {
  variant: 'mobile' | 'desktop';
}

export default function AdminSidebarFooter({ variant }: Props) {
  return (
    <div className={`admin__sidebar-footer admin__sidebar-footer--${variant}`}>
      <AdminBackToSiteLink />
      <AdminLogoutButton />
    </div>
  );
}
