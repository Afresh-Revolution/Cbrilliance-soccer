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

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
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
  const b2 = process.env.NEXT_PUBLIC_B2_PUBLIC_URL?.replace(/\/$/, '');
  if (b2 && process.env.NEXT_PUBLIC_USE_B2_MEDIA === 'true') {
    return `${b2}/cbfc/logo/cbfc-logo.png`;
  }
  return `${getSiteUrl()}/media/CBFC%20Logo.png`;
}
