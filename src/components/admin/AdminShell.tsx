import Link from 'next/link';
import AdminNav from '@/components/admin/AdminNav';
import AdminSidebarFooter from '@/components/admin/AdminSidebarFooter';
import { CBFC_MEDIA } from '@/lib/data/cbfc-media';
import { filterAdminNavLinks } from '@/lib/admin/nav-links';
import type { UserRole } from '@/types';

interface Props {
  children: React.ReactNode;
  role: UserRole;
}

export default function AdminShell({ children, role }: Props) {
  const adminLinks = filterAdminNavLinks(role);

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__sidebar-top">
          <Link href="/admin" className="admin__logo">
            {CBFC_MEDIA.logo ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={CBFC_MEDIA.logo}
                  alt="CBFC"
                  width={40}
                  height={40}
                  className="admin__logo-img"
                />
                <span className="admin__logo-text">Admin</span>
              </>
            ) : (
              <span className="admin__logo-fallback">CBFC Admin</span>
            )}
          </Link>
          <AdminSidebarFooter variant="mobile" />
        </div>

        <AdminNav links={adminLinks} />
        <AdminSidebarFooter variant="desktop" />
      </aside>
      <main className="admin__main">{children}</main>
    </div>
  );
}
