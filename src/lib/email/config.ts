import { SUPPORT_EMAIL, getPublicContactEmail } from '@/lib/constants/contact';

const RESEND_TEST_DOMAIN = '@resend.dev';

/** Sender address from RESEND_FROM. The resend.dev test address is never used. */
export function getResendFrom(): string | null {
  const from = process.env.RESEND_FROM?.trim().replace(/^["']|["']$/g, '');
  if (!from || from.toLowerCase().includes(RESEND_TEST_DOMAIN)) return null;
  return from;
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && getResendFrom());
}

const PUBLIC_SITE_URL = 'https://www.cbrilliancefc.com';

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.local')
  );
}

/** Public site origin used in emails. Localhost is never sent to recipients. */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return PUBLIC_SITE_URL;

  try {
    const parsed = new URL(configured);
    if (isLocalHostname(parsed.hostname)) return PUBLIC_SITE_URL;
    if (parsed.hostname === 'cbrilliancefc.com') {
      parsed.hostname = 'www.cbrilliancefc.com';
    }
    return parsed.origin;
  } catch {
    return PUBLIC_SITE_URL;
  }
}

/** Inbox that receives alerts when visitors submit forms / requests. */
export function getAdminNotificationEmail(): string {
  return (
    process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
    getPublicContactEmail() ||
    SUPPORT_EMAIL
  );
}

export function getLogoUrl(): string {
  return `${getSiteUrl()}/media/CBFC%20Logo.png`;
}
