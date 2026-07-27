/** Public support / contact email shown on the site and used for admin alerts. */
export const SUPPORT_EMAIL = 'cbrilliancefc@gmail.com';

export const SUPPORT_PHONE = '+2347010840969';

/** WhatsApp number for wa.me links (digits only, no +). */
export const WHATSAPP_NUMBER = '2347010840969';

export const SOCIAL_LINKS = [
  { label: 'X', href: 'https://x.com/cbrilliancefc', ariaLabel: 'X (Twitter)' },
  { label: 'FB', href: 'https://facebook.com/cbrilliancefc', ariaLabel: 'Facebook' },
  { label: 'IG', href: 'https://www.instagram.com/cbrilliancefc', ariaLabel: 'Instagram' },
  { label: 'TT', href: 'https://www.tiktok.com/@cbrilliancefc', ariaLabel: 'TikTok' },
] as const;

export function getPublicContactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || SUPPORT_EMAIL;
}

export function getPublicContactPhone(): string {
  return process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || SUPPORT_PHONE;
}

export function getWhatsAppNumber(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || WHATSAPP_NUMBER;
}

/** Optional WhatsApp for player profile inquiries — separate from site contact. */
export function getPlayerWhatsAppNumber(): string | null {
  const value = process.env.NEXT_PUBLIC_PLAYER_WHATSAPP_NUMBER?.trim();
  return value || null;
}
