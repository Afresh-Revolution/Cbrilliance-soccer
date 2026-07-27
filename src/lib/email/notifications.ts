import { sendEmailAsync } from '@/lib/email/send';
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
