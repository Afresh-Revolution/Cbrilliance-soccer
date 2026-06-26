import { NextRequest, NextResponse } from 'next/server';
import { academyApplicationSchema } from '@/lib/validators/schemas';
import { isSupabaseServiceConfigured } from '@/lib/db/env';
import { guardPublicPost } from '@/lib/security/api-guard';
import { sanitizeText } from '@/lib/security/sanitize';
import { writeAuditLog } from '@/lib/security/audit';
import { notifyAcademyApplication } from '@/lib/email/notifications';

export async function POST(request: NextRequest) {
  const blocked = await guardPublicPost(request, 'academy-form', 6, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const parsed = academyApplicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    if (isSupabaseServiceConfigured()) {
      const { createServiceClient } = await import('@/lib/db/supabase/server');
      const supabase = await createServiceClient();
      const { error } = await supabase.from('academy_applications').insert({
        full_name: sanitizeText(data.fullName, 120),
        date_of_birth: data.dateOfBirth,
        position: data.position,
        height: data.height ? sanitizeText(data.height, 20) : null,
        preferred_foot: data.preferredFoot ?? null,
        parent_guardian_name: sanitizeText(data.parentGuardianName, 120),
        email: data.email.toLowerCase().trim(),
        phone: sanitizeText(data.phone, 30),
        previous_club: data.previousClub ? sanitizeText(data.previousClub, 120) : null,
      });
      if (error) throw error;
    }

    await writeAuditLog({
      action: 'form.academy',
      resource: 'academy_applications',
      request,
      metadata: { email: data.email },
    });

    notifyAcademyApplication({
      fullName: data.fullName,
      email: data.email.toLowerCase().trim(),
      dateOfBirth: data.dateOfBirth,
      position: data.position,
      parentGuardianName: data.parentGuardianName,
      phone: data.phone,
      previousClub: data.previousClub,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
