export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function getResendFrom(): string {
  return process.env.RESEND_FROM?.trim() || 'CBFC <support@cbrilliancefc.com>';
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function getAdminNotificationEmail(): string {
  const explicit = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (explicit) return explicit;

  const from = getResendFrom();
  const match = from.match(/<([^>]+)>/);
  if (match?.[1]) return match[1];

  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'support@cbrilliancefc.com';
}

export function getLogoUrl(): string {
  const b2 = process.env.NEXT_PUBLIC_B2_PUBLIC_URL?.replace(/\/$/, '');
  if (b2 && process.env.NEXT_PUBLIC_USE_B2_MEDIA === 'true') {
    return `${b2}/cbfc/logo/cbfc-logo.png`;
  }
  return `${getSiteUrl()}/media/CBFC%20Logo.png`;
}
