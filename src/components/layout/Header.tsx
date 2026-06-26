'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { NAV_LINKS } from '@/lib/constants/navigation';
import { CBFC_MEDIA } from '@/lib/data/cbfc-media';
import Button from '@/components/common/Button';
import MenuBallToggle from '@/components/layout/MenuBallToggle';
import MobileNavDrawer from '@/components/layout/MobileNavDrawer';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isHome = pathname === '/';

  return (
    <>
      <header
        className={`header ${scrolled || !isHome || mobileOpen ? 'header--scrolled' : 'header--transparent'}`}
      >
        <div className="header__inner container container--wide">
          <Link href="/" className="header__logo">
            {CBFC_MEDIA.logo ? (
              <Image
                src={CBFC_MEDIA.logo}
                alt="CBFC"
                width={120}
                height={40}
                className="header__logo-img"
                priority
              />
            ) : (
              'CBFC'
            )}
          </Link>

          <nav className="header__nav" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`header__link ${pathname === link.href ? 'header__link--active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <Button href="/academy#register" variant="primary" size="sm" className="header__cta">
              Join CBFC
            </Button>
            <MenuBallToggle open={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
          </div>
        </div>
      </header>

      <MobileNavDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
