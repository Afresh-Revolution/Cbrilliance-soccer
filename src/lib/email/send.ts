import { getResendClient } from '@/lib/email/client';
import { getResendFrom, isResendConfigured } from '@/lib/email/config';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/** Sends email via Resend. Returns false on failure; never throws. */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const from = getResendFrom();
  if (!isResendConfigured() || !from) {
    console.warn(
      '[email] Set RESEND_API_KEY and RESEND_FROM to a verified domain address. The onboarding@resend.dev default is not used. Skipping:',
      options.subject,
    );
    return false;
  }

  const client = getResendClient();
  if (!client) return false;

  try {
    const { error } = await client.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error('[email] send failed:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[email] send error:', err);
    return false;
  }
}

/** Fire-and-forget email — failures are logged, not propagated. */
export function sendEmailAsync(options: SendEmailOptions): void {
  void sendEmail(options);
}
