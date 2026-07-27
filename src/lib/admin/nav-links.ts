import { hasPermission } from '@/lib/auth/rbac';
import type { UserRole } from '@/types';

export interface AdminNavLink {
  href: string;
  label: string;
  permission?: string;
}

export const ADMIN_NAV_LINKS: AdminNavLink[] = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/players', label: 'Players', permission: 'content.read' },
  { href: '/admin/news', label: 'News', permission: 'content.read' },
  { href: '/admin/videos', label: 'Videos', permission: 'content.read' },
  { href: '/admin/applications', label: 'Applications', permission: 'inquiries.read' },
  { href: '/admin/inquiries', label: 'Inquiries', permission: 'inquiries.read' },
  { href: '/admin/staff', label: 'Staff', permission: 'content.read' },
  { href: '/admin/gallery', label: 'Gallery', permission: 'content.read' },
  { href: '/admin/shop', label: 'Shop', permission: 'content.read' },
  { href: '/admin/shop-orders', label: 'Shop Orders', permission: 'inquiries.read' },
  { href: '/admin/academy-facilities', label: 'Academy Facilities', permission: 'content.read' },
  { href: '/admin/fixtures', label: 'Fixtures', permission: 'content.read' },
  { href: '/admin/activity', label: 'Activity', permission: 'content.read' },
  { href: '/admin/settings', label: 'Settings', permission: 'admin.settings' },
];

export function filterAdminNavLinks(role: UserRole): AdminNavLink[] {
  return ADMIN_NAV_LINKS.filter(
    (link) => !link.permission || hasPermission(role, link.permission),
  );
}
