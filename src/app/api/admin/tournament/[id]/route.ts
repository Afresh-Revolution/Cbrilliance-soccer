import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, handleAuthError, rejectInvalidUuid } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { tournamentStatusSchema } from '@/lib/validators/schemas';
import { updateTournamentRegistrationStatus } from '@/lib/data/tournament';
import { notifyTournamentStatusChange } from '@/lib/email/notifications';
import { tournamentErrorResponse } from '@/lib/tournament/errors';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-tournament-update', 60, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'inquiries.update');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    const body = await request.json();
    const parsed = tournamentStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const registration = await updateTournamentRegistrationStatus(id, parsed.data.status);

    notifyTournamentStatusChange(
      registration.officialFullName,
      registration.officialEmail,
      registration.registrationCode,
      registration.status,
    );

    await writeAuditLog({
      action: 'tournament.update',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'tournament_registrations',
      resourceId: registration.id,
      request,
      metadata: { status: registration.status, registrationCode: registration.registrationCode },
    });

    return NextResponse.json({ registration });
  } catch (error) {
    if (error instanceof Error && (
      error.message === 'DATABASE_NOT_CONFIGURED' ||
      error.message === 'UNAUTHORIZED' ||
      error.message === 'FORBIDDEN'
    )) {
      if (error.message === 'DATABASE_NOT_CONFIGURED') {
        return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
      }
      return handleAuthError(error);
    }
    const mapped = tournamentErrorResponse(error);
    return NextResponse.json({ error: mapped.message }, { status: mapped.status });
  }
}
