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
  if (!isResendConfigured()) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[email] RESEND_API_KEY not set — skipping:', options.subject);
    }
    return false;
  }

  const client = getResendClient();
  if (!client) return false;

  try {
    const { error } = await client.emails.send({
      from: getResendFrom(),
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
