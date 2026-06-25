import { NextRequest, NextResponse } from 'next/server';
import { contactInquirySchema } from '@/lib/validators/schemas';
import { isSupabaseServiceConfigured } from '@/lib/db/env';
import { guardPublicPost } from '@/lib/security/api-guard';
import { sanitizeText } from '@/lib/security/sanitize';
import { writeAuditLog } from '@/lib/security/audit';

export async function POST(request: NextRequest) {
  const blocked = guardPublicPost(request, 'contact-form', 8, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const parsed = contactInquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    if (isSupabaseServiceConfigured()) {
      const { createServiceClient } = await import('@/lib/db/supabase/server');
      const supabase = await createServiceClient();
      const { error } = await supabase.from('contact_inquiries').insert({
        full_name: sanitizeText(data.fullName, 120),
        organization: data.organization ? sanitizeText(data.organization, 120) : null,
        email: data.email.toLowerCase().trim(),
        phone: data.phone ? sanitizeText(data.phone, 30) : null,
        message: sanitizeText(data.message, 5000),
      });
      if (error) throw error;
    }

    await writeAuditLog({
      action: 'form.contact',
      resource: 'contact_inquiries',
      request,
      metadata: { email: data.email },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
