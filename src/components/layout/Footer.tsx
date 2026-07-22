import Link from 'next/link';
import { FOOTER_LINKS } from '@/lib/constants/navigation';
import { getPublicContactEmail } from '@/lib/constants/contact';

export default function Footer() {
  const supportEmail = getPublicContactEmail();

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
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              </li>
              <li>
                <a href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE || '+1234567890'}`}>
                  {process.env.NEXT_PUBLIC_CONTACT_PHONE || '+1234567890'}
                </a>
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
            <a href="#" aria-label="Instagram">IG</a>
            <a href="#" aria-label="Twitter">X</a>
            <a href="#" aria-label="YouTube">YT</a>
            <a href="#" aria-label="LinkedIn">IN</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
