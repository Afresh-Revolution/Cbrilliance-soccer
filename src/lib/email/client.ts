import { Resend } from 'resend';
import { isResendConfigured } from '@/lib/email/config';

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!isResendConfigured()) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY!.trim());
  }
  return resendClient;
}
