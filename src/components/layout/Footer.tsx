import Link from 'next/link';
import { FOOTER_LINKS } from '@/lib/constants/navigation';
import {
  SOCIAL_LINKS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
} from '@/lib/constants/contact';

export default function Footer() {

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <h3>CBFC</h3>
            <p>
              The Innovational Football Club, developing, representing, and advancing
              football talent through our Academy, Agency, and Professional Club structure.
            </p>
          </div>

          <div className="footer__column">
            <h4>Divisions</h4>
            <ul>
              {FOOTER_LINKS.divisions.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__column">
            <h4>Quick Links</h4>
            <ul>
              {FOOTER_LINKS.quick.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__column">
            <h4>Contact</h4>
            <ul>
              <li>
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
              </li>
              <li>
                <a href={`tel:${SUPPORT_PHONE}`}>{SUPPORT_PHONE}</a>
              </li>
              <li>
                <Link href="/contact">Get In Touch</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>
            &copy; {new Date().getFullYear()}{' '}
            <Link href="/admin" className="footer__stealth-link">CBFC</Link>
            . All rights reserved.
          </p>
          <div className="footer__social">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.ariaLabel}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
