import { escapeHtml } from '@/lib/email/escape';
import { getSiteUrl } from '@/lib/email/config';
import {
  emailDetailRow,
  emailHighlightBox,
  emailParagraph,
  renderEmailLayout,
} from '@/lib/email/templates/layout';
import type { SubmissionType } from '@/lib/email/templates/submission-received';

const ADMIN_COPY: Record<
  SubmissionType,
  { title: string; preheader: string; adminPath: string }
> = {
  contact: {
    title: 'New contact enquiry',
    preheader: 'A new contact form submission requires review.',
    adminPath: '/admin/inquiries',
  },
  academy: {
    title: 'New academy application',
    preheader: 'A new academy application has been submitted.',
    adminPath: '/admin/applications',
  },
  scout: {
    title: 'New scout inquiry',
    preheader: 'A new scout/agency inquiry has been submitted.',
    adminPath: '/admin/inquiries',
  },
};

export interface AdminNotificationEmailData {
  type: SubmissionType;
  detailRows: { label: string; value: string }[];
  messagePreview?: string;
}

export function renderAdminNotificationEmail(data: AdminNotificationEmailData): {
  subject: string;
  html: string;
} {
  const copy = ADMIN_COPY[data.type];
  const siteUrl = getSiteUrl();
  const adminUrl = `${siteUrl}${copy.adminPath}`;

  const detailsTable = emailHighlightBox(
    `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      ${data.detailRows.map((row) => emailDetailRow(row.label, row.value)).join('')}
    </table>`,
  );

  const messageBlock = data.messagePreview
    ? emailHighlightBox(
        `<strong style="color: #C8A75D; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Message</strong><br /><br />${escapeHtml(data.messagePreview)}`,
      )
    : '';

  const bodyHtml = [
    emailParagraph('A new submission has arrived on the CBFC website and needs your attention.'),
    detailsTable,
    messageBlock,
    emailParagraph(
      'Please log in to the admin dashboard to review this notification and take action.',
    ),
  ].join('');

  const html = renderEmailLayout({
    preheader: copy.preheader,
    title: copy.title,
    bodyHtml,
    ctaLabel: 'Log in & review',
    ctaHref: adminUrl,
    footerNote: 'Internal CBFC support notification — please do not forward.',
  });

  const subjectMap: Record<SubmissionType, string> = {
    contact: '[CBFC] New contact enquiry — please log in to review',
    academy: '[CBFC] New academy application — please log in to review',
    scout: '[CBFC] New scout inquiry — please log in to review',
  };

  return { subject: subjectMap[data.type], html };
}
