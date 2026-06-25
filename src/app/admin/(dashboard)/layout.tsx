import Link from 'next/link';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import { requireAdminSession } from '@/lib/auth/require-admin';

export const dynamic = 'force-dynamic';

const adminLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/players', label: 'Players' },
  { href: '/admin/news', label: 'News' },
  { href: '/admin/videos', label: 'Videos' },
  { href: '/admin/applications', label: 'Applications' },
  { href: '/admin/inquiries', label: 'Inquiries' },
  { href: '/admin/settings', label: 'Settings' },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__logo">CBFC Admin</div>
        <nav className="admin__nav">
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className="admin__nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
        <AdminLogoutButton />
        <Link href="/" className="admin__nav-link mt-lg">
          ← Back to Site
        </Link>
      </aside>
      <div className="admin__main">{children}</div>
    </div>
  );
}
