'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AdminNavLink } from '@/lib/admin/nav-links';

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminNav({ links }: { links: AdminNavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="admin__nav" aria-label="Admin navigation">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`admin__nav-link${isActive(pathname, link.href) ? ' admin__nav-link--active' : ''}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
