/** Public support / contact email shown on the site and used for admin alerts. */
export const SUPPORT_EMAIL = 'Cbrilliancefc@gmail.com';

export function getPublicContactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || SUPPORT_EMAIL;
}
