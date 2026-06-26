import { escapeHtml } from '@/lib/email/escape';
import { getLogoUrl, getSiteUrl } from '@/lib/email/config';

/** CBFC brand colors (matches src/styles/abstracts/_colors.scss) */
export const EMAIL_COLORS = {
  midnight: '#03081a',
  navyPanel: '#0f1c37',
  navyElevated: '#152240',
  gold: '#C8A75D',
  lightGold: '#E2C68B',
  white: '#FFFFFF',
  softLight: '#e8ecf4',
  muted: '#7a8ba8',
  border: 'rgba(255, 255, 255, 0.08)',
  success: '#2E8B57',
} as const;

export interface EmailLayoutOptions {
  preheader?: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
  footerNote?: string;
}

export function renderEmailLayout(options: EmailLayoutOptions): string {
  const siteUrl = getSiteUrl();
  const logoUrl = getLogoUrl();
  const preheader = options.preheader ? escapeHtml(options.preheader) : '';
  const title = escapeHtml(options.title);
  const footerNote = options.footerNote
    ? escapeHtml(options.footerNote)
    : 'Community Based Football Club — Developing tomorrow\'s stars.';

  const ctaBlock =
    options.ctaLabel && options.ctaHref
      ? `
        <tr>
          <td style="padding: 8px 0 28px;">
            <a href="${escapeHtml(options.ctaHref)}" style="display: inline-block; background: linear-gradient(135deg, ${EMAIL_COLORS.gold}, ${EMAIL_COLORS.lightGold}); color: ${EMAIL_COLORS.midnight}; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 8px; letter-spacing: 0.02em;">
              ${escapeHtml(options.ctaLabel)}
            </a>
          </td>
        </tr>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <title>${title}</title>
  <!--[if mso]><style>body, table, td { font-family: Arial, sans-serif !important; }</style><![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${EMAIL_COLORS.midnight}; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${EMAIL_COLORS.midnight};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: ${EMAIL_COLORS.navyPanel}; border-radius: 12px; border: 1px solid ${EMAIL_COLORS.border}; overflow: hidden;">
          <!-- Gold accent bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, ${EMAIL_COLORS.gold}, ${EMAIL_COLORS.lightGold}); font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid ${EMAIL_COLORS.border};">
              <a href="${escapeHtml(siteUrl)}" style="text-decoration: none;">
                <img src="${escapeHtml(logoUrl)}" alt="CBFC" width="72" height="72" style="display: block; margin: 0 auto 16px; border-radius: 8px;" />
              </a>
              <p style="margin: 0; font-family: 'Syne', 'Segoe UI', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: ${EMAIL_COLORS.gold};">
                Community Based Football Club
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px; font-family: 'DM Sans', 'Segoe UI', sans-serif;">
              <h1 style="margin: 0 0 16px; font-family: 'Syne', 'Segoe UI', sans-serif; font-size: 26px; font-weight: 700; line-height: 1.15; color: ${EMAIL_COLORS.white}; letter-spacing: -0.02em;">
                ${title}
              </h1>
              ${options.bodyHtml}
              ${ctaBlock}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: ${EMAIL_COLORS.navyElevated}; border-top: 1px solid ${EMAIL_COLORS.border}; text-align: center;">
              <p style="margin: 0 0 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: ${EMAIL_COLORS.muted}; line-height: 1.5;">
                ${footerNote}
              </p>
              <p style="margin: 0; font-family: 'DM Sans', sans-serif; font-size: 12px;">
                <a href="${escapeHtml(siteUrl)}" style="color: ${EMAIL_COLORS.gold}; text-decoration: none;">cbrilliancefc.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailParagraph(text: string): string {
  return `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.65; color: ${EMAIL_COLORS.softLight};">${text}</p>`;
}

export function emailHighlightBox(html: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 20px;">
      <tr>
        <td style="padding: 16px 20px; background-color: ${EMAIL_COLORS.navyElevated}; border-radius: 8px; border-left: 3px solid ${EMAIL_COLORS.gold}; font-size: 14px; line-height: 1.6; color: ${EMAIL_COLORS.softLight};">
          ${html}
        </td>
      </tr>
    </table>`;
}

export function emailDetailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding: 6px 0; font-size: 13px; color: ${EMAIL_COLORS.muted}; width: 120px; vertical-align: top;">${escapeHtml(label)}</td>
    <td style="padding: 6px 0; font-size: 14px; color: ${EMAIL_COLORS.softLight}; vertical-align: top;">${escapeHtml(value)}</td>
  </tr>`;
}
