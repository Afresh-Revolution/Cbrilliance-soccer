import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, handleAuthError, rejectInvalidUuid } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { getTournamentRegistrationById } from '@/lib/data/tournament';
import { getSiteUrl } from '@/lib/email/config';
import { resendTournamentRegistrationEmail } from '@/lib/email/notifications';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-tournament-resend', 30, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'inquiries.update');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    const registration = await getTournamentRegistrationById(id);
    if (!registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }
    if (!registration.officialEmail) {
      return NextResponse.json({ error: 'This registration has no email address.' }, { status: 400 });
    }

    const sent = resendTournamentRegistrationEmail({
      teamName: registration.teamName,
      officialName: registration.officialFullName,
      email: registration.officialEmail,
      phone: registration.officialPhone,
      registrationCode: registration.registrationCode,
      squadUrl: `${getSiteUrl()}/tournament/squad/${registration.accessToken}`,
      playerCount: registration.playerCount,
      location: registration.teamLocation,
    });

    if (!sent) {
      return NextResponse.json({ error: 'Could not send the email.' }, { status: 500 });
    }

    await writeAuditLog({
      action: 'tournament.email_resend',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'tournament_registrations',
      resourceId: registration.id,
      request,
      metadata: {
        registrationCode: registration.registrationCode,
        email: registration.officialEmail,
      },
    });

    return NextResponse.json({ success: true, email: registration.officialEmail });
  } catch (error) {
    return handleAuthError(error);
  }
}
