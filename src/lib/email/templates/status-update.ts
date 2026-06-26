import type { ApplicationStatus, InquiryStatus } from '@/types';
import { escapeHtml } from '@/lib/email/escape';
import { getSiteUrl } from '@/lib/email/config';
import {
  emailHighlightBox,
  emailParagraph,
  renderEmailLayout,
  EMAIL_COLORS,
} from '@/lib/email/templates/layout';

const APPLICATION_STATUS: Record<
  ApplicationStatus,
  { label: string; headline: string; message: string }
> = {
  new: {
    label: 'New',
    headline: 'Application received',
    message: 'Your application is in our system and will be reviewed shortly.',
  },
  pending: {
    label: 'Under review',
    headline: 'Application under review',
    message:
      'Our academy team is currently reviewing your application. We appreciate your patience while we assess your profile.',
  },
  reviewed: {
    label: 'Reviewed',
    headline: 'Application reviewed',
    message:
      'We have completed an initial review of your academy application. We will be in touch if we need any further information or to discuss next steps.',
  },
  contacted: {
    label: 'Contacted',
    headline: 'We\'ve been in touch',
    message:
      'Our team has reached out regarding your application. Please check your phone and email for our message.',
  },
  invited: {
    label: 'Invited',
    headline: 'You\'re invited to the next stage',
    message:
      'Congratulations — you have been invited to proceed to the next stage of the CBFC Academy process. Please follow the instructions in our direct communication.',
  },
  rejected: {
    label: 'Update',
    headline: 'Update on your application',
    message:
      'Thank you for your interest in the CBFC Academy. After careful consideration, we are unable to offer a place at this time. We encourage you to keep developing and reapply in the future.',
  },
  closed: {
    label: 'Closed',
    headline: 'Application closed',
    message: 'Your academy application has been marked as closed. If you believe this is an error, please contact us.',
  },
};

const INQUIRY_STATUS: Record<
  InquiryStatus,
  { label: string; headline: string; message: string }
> = {
  new: {
    label: 'New',
    headline: 'Inquiry received',
    message: 'Your inquiry is in our system and will be reviewed shortly.',
  },
  pending: {
    label: 'Under review',
    headline: 'Inquiry under review',
    message: 'Our team is reviewing your inquiry and will respond as soon as possible.',
  },
  contacted: {
    label: 'Contacted',
    headline: 'We\'ve responded to your inquiry',
    message: 'A member of the CBFC team has reached out regarding your inquiry. Please check your email and phone.',
  },
  closed: {
    label: 'Closed',
    headline: 'Inquiry closed',
    message: 'Your inquiry has been marked as closed. Thank you for contacting CBFC.',
  },
};

export interface ApplicationStatusEmailData {
  recipientName: string;
  status: ApplicationStatus;
}

export interface InquiryStatusEmailData {
  recipientName: string;
  status: InquiryStatus;
  inquiryType: 'contact' | 'scout';
}

export function renderApplicationStatusEmail(data: ApplicationStatusEmailData): {
  subject: string;
  html: string;
} {
  const copy = APPLICATION_STATUS[data.status];
  const name = escapeHtml(data.recipientName);
  const siteUrl = getSiteUrl();

  const bodyHtml = [
    emailParagraph(`Hi ${name},`),
    emailParagraph('There\'s an update regarding your CBFC Academy application.'),
    emailHighlightBox(
      `<span style="display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${EMAIL_COLORS.gold}; margin-bottom: 8px;">Status: ${escapeHtml(copy.label)}</span><br /><br />${escapeHtml(copy.message)}`,
    ),
    emailParagraph('If you have questions, reply to this email or contact us through our website.'),
  ].join('');

  const html = renderEmailLayout({
    preheader: copy.message.slice(0, 100),
    title: copy.headline,
    bodyHtml,
    ctaLabel: 'Visit CBFC Academy',
    ctaHref: `${siteUrl}/academy`,
    footerNote: 'You received this email because you applied to the CBFC Academy.',
  });

  return {
    subject: `${copy.headline} — CBFC Academy`,
    html,
  };
}

export function renderInquiryStatusEmail(data: InquiryStatusEmailData): {
  subject: string;
  html: string;
} {
  const copy = INQUIRY_STATUS[data.status];
  const name = escapeHtml(data.recipientName);
  const siteUrl = getSiteUrl();
  const section = data.inquiryType === 'scout' ? 'Agency' : 'Contact';

  const bodyHtml = [
    emailParagraph(`Hi ${name},`),
    emailParagraph(`There\'s an update regarding your inquiry to CBFC ${section}.`),
    emailHighlightBox(
      `<span style="display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${EMAIL_COLORS.gold}; margin-bottom: 8px;">Status: ${escapeHtml(copy.label)}</span><br /><br />${escapeHtml(copy.message)}`,
    ),
    emailParagraph('If you have questions, reply to this email or contact us through our website.'),
  ].join('');

  const html = renderEmailLayout({
    preheader: copy.message.slice(0, 100),
    title: copy.headline,
    bodyHtml,
    ctaLabel: 'Visit CBFC',
    ctaHref: siteUrl,
    footerNote: 'You received this email because you submitted an inquiry on cbrilliancefc.com.',
  });

  return {
    subject: `${copy.headline} — CBFC`,
    html,
  };
}

/** Statuses that warrant a user-facing email (skip redundant "new"). */
export function shouldEmailApplicationStatus(
  previous: ApplicationStatus,
  next: ApplicationStatus,
): boolean {
  return previous !== next && next !== 'new';
}

export function shouldEmailInquiryStatus(
  previous: InquiryStatus,
  next: InquiryStatus,
): boolean {
  return previous !== next && next !== 'new';
}
