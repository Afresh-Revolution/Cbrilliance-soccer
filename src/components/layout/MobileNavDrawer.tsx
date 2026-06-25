'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_LINKS } from '@/lib/constants/navigation';
import Button from '@/components/common/Button';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function MobileNavDrawer({ open, onClose }: Props) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <>
      <button
        type="button"
        className={`mobile-nav__overlay ${open ? 'mobile-nav__overlay--visible' : ''}`}
        onClick={onClose}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
      />

      <nav
        className={`mobile-nav__panel ${open ? 'mobile-nav__panel--open' : ''}`}
        aria-label="Mobile navigation"
        aria-hidden={!open}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-nav__inner">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mobile-nav__link ${pathname === link.href ? 'mobile-nav__link--active' : ''}`}
              onClick={onClose}
            >
              {link.label}
            </Link>
          ))}
          <Button href="/academy#register" full className="mobile-nav__cta" onClick={onClose}>
            Join CBFC
          </Button>
        </div>
      </nav>
    </>,
    document.body,
  );
}
