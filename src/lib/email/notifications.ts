import { escapeHtml } from '@/lib/email/escape';
import { sendEmailAsync } from '@/lib/email/send';
import { renderEmailLayout, emailParagraph } from '@/lib/email/templates/layout';
import { getAdminNotificationEmail } from '@/lib/email/config';
import { renderAdminNotificationEmail } from '@/lib/email/templates/admin-notification';
import {
  renderSubmissionReceivedEmail,
  type SubmissionType,
} from '@/lib/email/templates/submission-received';
import {
  renderApplicationStatusEmail,
  renderInquiryStatusEmail,
  shouldEmailApplicationStatus,
  shouldEmailInquiryStatus,
} from '@/lib/email/templates/status-update';
import type { ApplicationStatus, InquiryStatus } from '@/types';

interface ContactSubmission {
  fullName: string;
  email: string;
  organization?: string | null;
  phone?: string | null;
  message: string;
}

interface AcademySubmission {
  fullName: string;
  email: string;
  dateOfBirth: string;
  position: string;
  parentGuardianName: string;
  phone: string;
  previousClub?: string | null;
}

interface ScoutSubmission {
  scoutName: string;
  email: string;
  clubName: string;
  phone?: string | null;
  message: string;
}

function notifySubmissionPair(
  type: SubmissionType,
  recipientEmail: string,
  recipientName: string,
  userSummary: { label: string; value: string }[],
  adminDetail: { label: string; value: string }[],
  messagePreview?: string,
): void {
  const userEmail = renderSubmissionReceivedEmail({
    type,
    recipientName,
    summaryRows: userSummary,
  });

  sendEmailAsync({
    to: recipientEmail,
    subject: userEmail.subject,
    html: userEmail.html,
  });

  const adminEmail = renderAdminNotificationEmail({
    type,
    detailRows: adminDetail,
    messagePreview,
  });

  sendEmailAsync({
    to: getAdminNotificationEmail(),
    subject: adminEmail.subject,
    html: adminEmail.html,
    replyTo: recipientEmail,
  });
}

export function notifyContactSubmission(data: ContactSubmission): void {
  notifySubmissionPair(
    'contact',
    data.email,
    data.fullName,
    [
      { label: 'Name', value: data.fullName },
      ...(data.organization ? [{ label: 'Organisation', value: data.organization }] : []),
    ],
    [
      { label: 'Name', value: data.fullName },
      { label: 'Email', value: data.email },
      ...(data.phone ? [{ label: 'Phone', value: data.phone }] : []),
      ...(data.organization ? [{ label: 'Organisation', value: data.organization }] : []),
    ],
    data.message,
  );
}

export function notifyAcademyApplication(data: AcademySubmission): void {
  notifySubmissionPair(
    'academy',
    data.email,
    data.fullName,
    [
      { label: 'Applicant', value: data.fullName },
      { label: 'Position', value: data.position },
      { label: 'DOB', value: data.dateOfBirth },
    ],
    [
      { label: 'Applicant', value: data.fullName },
      { label: 'Email', value: data.email },
      { label: 'Phone', value: data.phone },
      { label: 'Position', value: data.position },
      { label: 'DOB', value: data.dateOfBirth },
      { label: 'Parent/Guardian', value: data.parentGuardianName },
      ...(data.previousClub ? [{ label: 'Previous club', value: data.previousClub }] : []),
    ],
  );
}

export function notifyScoutInquiry(data: ScoutSubmission): void {
  notifySubmissionPair(
    'scout',
    data.email,
    data.scoutName,
    [
      { label: 'Scout', value: data.scoutName },
      { label: 'Club', value: data.clubName },
    ],
    [
      { label: 'Scout', value: data.scoutName },
      { label: 'Club', value: data.clubName },
      { label: 'Email', value: data.email },
      ...(data.phone ? [{ label: 'Phone', value: data.phone }] : []),
    ],
    data.message,
  );
}

export function notifyApplicationStatusChange(
  fullName: string,
  email: string,
  previousStatus: ApplicationStatus,
  nextStatus: ApplicationStatus,
): void {
  if (!shouldEmailApplicationStatus(previousStatus, nextStatus)) return;

  const { subject, html } = renderApplicationStatusEmail({
    recipientName: fullName,
    status: nextStatus,
  });

  sendEmailAsync({ to: email, subject, html });
}

export function notifyInquiryStatusChange(
  name: string,
  email: string,
  source: 'contact' | 'scout',
  previousStatus: InquiryStatus,
  nextStatus: InquiryStatus,
): void {
  if (!shouldEmailInquiryStatus(previousStatus, nextStatus)) return;

  const { subject, html } = renderInquiryStatusEmail({
    recipientName: name,
    status: nextStatus,
    inquiryType: source,
  });

  sendEmailAsync({ to: email, subject, html });
}

interface ShopOrderSubmission {
  fullName: string;
  email: string;
  phone: string;
  notes?: string;
  items: {
    productName: string;
    category: string;
    color: string;
    size: string;
    quantity: number;
  }[];
}

interface TournamentSubmission {
  teamName: string;
  officialName: string;
  email?: string | null;
  phone: string;
  registrationCode: string;
  squadUrl: string;
  playerCount: number;
  location: string;
}

function sendTournamentTeamEmail(data: TournamentSubmission): boolean {
  if (!data.email) return false;

  const userEmail = renderSubmissionReceivedEmail({
    type: 'tournament',
    recipientName: data.officialName,
    summaryRows: [
      { label: 'Team', value: data.teamName },
      { label: 'Registration ID', value: data.registrationCode },
      { label: 'Squad size', value: String(data.playerCount) },
    ],
    ctaLabel: 'Add squad players',
    ctaHref: data.squadUrl,
  });

  sendEmailAsync({
    to: data.email,
    subject: userEmail.subject,
    html: userEmail.html,
  });
  return true;
}

export function resendTournamentRegistrationEmail(data: TournamentSubmission): boolean {
  return sendTournamentTeamEmail(data);
}

export function notifyTournamentRegistration(data: TournamentSubmission): void {
  sendTournamentTeamEmail(data);

  const adminEmail = renderAdminNotificationEmail({
    type: 'tournament',
    detailRows: [
      { label: 'Team', value: data.teamName },
      { label: 'Registration ID', value: data.registrationCode },
      { label: 'Official', value: data.officialName },
      { label: 'Phone', value: data.phone },
      ...(data.email ? [{ label: 'Email', value: data.email }] : []),
      { label: 'Location', value: data.location },
      { label: 'Squad size', value: String(data.playerCount) },
    ],
  });

  sendEmailAsync({
    to: getAdminNotificationEmail(),
    subject: adminEmail.subject,
    html: adminEmail.html,
    replyTo: data.email || undefined,
  });
}

const TOURNAMENT_STATUS_COPY: Record<string, { subject: string; message: string }> = {
  under_review: {
    subject: 'Tournament registration under review — CBrilliance',
    message: 'The Tournament Committee is now reviewing your team registration.',
  },
  approved: {
    subject: 'Tournament registration approved — CBrilliance',
    message: 'The Tournament Committee has approved your team registration. Further instructions will follow through your registered phone number, WhatsApp, or email.',
  },
  rejected: {
    subject: 'Tournament registration update — CBrilliance',
    message: 'The Tournament Committee was unable to approve this registration based on the tournament requirements. Contact the committee if you need to discuss the decision.',
  },
};

export function notifyTournamentStatusChange(
  officialName: string,
  email: string | undefined,
  registrationCode: string,
  nextStatus: string,
): void {
  if (!email) return;
  const copy = TOURNAMENT_STATUS_COPY[nextStatus];
  if (!copy) return;

  const html = renderEmailLayout({
    preheader: copy.subject,
    title: 'Registration update',
    bodyHtml: [
      emailParagraph(`Hi ${escapeHtml(officialName)},`),
      emailParagraph(copy.message),
      emailParagraph(`Registration ID: ${escapeHtml(registrationCode)}`),
    ].join(''),
    footerNote: 'You received this email because your team registered for the CBrilliance Football Agency tournament.',
  });

  sendEmailAsync({ to: email, subject: copy.subject, html });
}

export function notifyShopOrder(data: ShopOrderSubmission): void {
  const itemSummary = data.items
    .map(
      (item) =>
        `${item.quantity}x ${item.productName} (${item.category}) — ${item.color}, size ${item.size}`,
    )
    .join('\n');

  const userEmail = renderSubmissionReceivedEmail({
    type: 'contact',
    recipientName: data.fullName,
    summaryRows: [
      { label: 'Items', value: `${data.items.length} product line(s)` },
      { label: 'Phone', value: data.phone },
    ],
  });

  sendEmailAsync({
    to: data.email,
    subject: '[CBFC] Shop order received',
    html: userEmail.html,
  });

  const adminEmail = renderAdminNotificationEmail({
    type: 'contact',
    detailRows: [
      { label: 'Customer', value: data.fullName },
      { label: 'Email', value: data.email },
      { label: 'Phone', value: data.phone },
      { label: 'Items', value: `${data.items.length} line(s)` },
    ],
    messagePreview: [itemSummary, data.notes ? `Notes: ${data.notes}` : ''].filter(Boolean).join('\n\n'),
  });

  sendEmailAsync({
    to: getAdminNotificationEmail(),
    subject: '[CBFC] New shop order — please log in to review',
    html: adminEmail.html,
    replyTo: data.email,
  });
}
