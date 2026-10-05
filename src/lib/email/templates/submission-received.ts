import { escapeHtml } from '@/lib/email/escape';
import { getSiteUrl } from '@/lib/email/config';
import {
  emailHighlightBox,
  emailParagraph,
  renderEmailLayout,
} from '@/lib/email/templates/layout';

export type SubmissionType = 'contact' | 'academy' | 'scout' | 'tournament';

const SUBMISSION_COPY: Record<
  SubmissionType,
  { title: string; preheader: string; intro: string; reviewNote: string }
> = {
  contact: {
    title: 'Message received',
    preheader: 'Thanks for contacting CBFC — we\'ll be in touch soon.',
    intro: 'Thank you for reaching out to CBFC. Your message has been received and added to our inbox.',
    reviewNote: 'A member of our team will review your enquiry and respond as soon as possible, typically within 2–3 business days.',
  },
  academy: {
    title: 'Application received',
    preheader: 'Your CBFC Academy application has been submitted successfully.',
    intro: 'Thank you for applying to the CBFC Academy. We\'re excited to learn more about your football journey.',
    reviewNote: 'Our academy staff will carefully review your application. If your profile matches our programme, we\'ll contact you with next steps.',
  },
  scout: {
    title: 'Inquiry received',
    preheader: 'Your scout inquiry to CBFC Agency has been submitted.',
    intro: 'Thank you for your interest in CBFC talent. Your inquiry has been received by our agency team.',
    reviewNote: 'We\'ll review your message and follow up if there\'s a suitable match or opportunity to discuss further.',
  },
  tournament: {
    title: 'Registration submitted successfully',
    preheader: 'Your CBrilliance Football Agency tournament registration has been received.',
    intro: 'Your team registration has been received by the CBrilliance Football Agency Tournament Committee.',
    reviewNote: 'Your registration will be reviewed by the Tournament Committee. You will receive confirmation and further instructions through your registered phone number, WhatsApp, or email. Use the button below to add players to your squad.',
  },
};

export interface SubmissionReceivedEmailData {
  type: SubmissionType;
  recipientName: string;
  summaryRows?: { label: string; value: string }[];
  ctaLabel?: string;
  ctaHref?: string;
}

export function renderSubmissionReceivedEmail(data: SubmissionReceivedEmailData): {
  subject: string;
  html: string;
} {
  const copy = SUBMISSION_COPY[data.type];
  const name = escapeHtml(data.recipientName);
  const siteUrl = getSiteUrl();

  const summaryBlock =
    data.summaryRows && data.summaryRows.length > 0
      ? emailHighlightBox(
          `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            ${data.summaryRows
              .map(
                (row) =>
                  `<tr>
                    <td style="padding: 4px 0; font-size: 12px; color: #7a8ba8; width: 110px;">${escapeHtml(row.label)}</td>
                    <td style="padding: 4px 0; font-size: 13px; color: #e8ecf4;">${escapeHtml(row.value)}</td>
                  </tr>`,
              )
              .join('')}
          </table>`,
        )
      : '';

  const bodyHtml = [
    emailParagraph(`Hi ${name},`),
    emailParagraph(copy.intro),
    summaryBlock,
    emailHighlightBox(
      `<strong style="color: #C8A75D;">What happens next?</strong><br /><br />${escapeHtml(copy.reviewNote)}`,
    ),
    emailParagraph(
      'If you have any urgent questions, reply to this email or visit our contact page.',
    ),
  ].join('');

  const html = renderEmailLayout({
    preheader: copy.preheader,
    title: copy.title,
    bodyHtml,
    ctaLabel: data.ctaLabel ?? 'Visit CBFC',
    ctaHref: data.ctaHref ?? siteUrl,
    footerNote: 'You received this email because you submitted a form on cbrilliancefc.com.',
  });

  const subjectMap: Record<SubmissionType, string> = {
    contact: 'We received your message — CBFC',
    academy: 'Academy application received — CBFC',
    scout: 'Scout inquiry received — CBFC Agency',
    tournament: 'Tournament registration received — CBrilliance Football Agency',
  };

  return { subject: subjectMap[data.type], html };
}
