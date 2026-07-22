import { SUPPORT_EMAIL, getPublicContactEmail } from '@/lib/constants/contact';

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getResendFrom(): string {
  return process.env.RESEND_FROM?.trim() || 'CBFC <onboarding@resend.dev>';
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
