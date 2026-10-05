import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { hasPermission, requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, handleAuthError } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { tournamentBankDetailsSchema } from '@/lib/validators/schemas';
import { updateTournamentBankDetails } from '@/lib/data/tournament';

export async function PATCH(request: NextRequest) {
  const blocked = await guardAuthMutation(request, 'admin-tournament-bank-details', 30, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    if (
      !hasPermission(ctx.profile.role, 'content.write') &&
      !hasPermission(ctx.profile.role, 'inquiries.update')
    ) {
      requirePermission(ctx, 'inquiries.update');
    }

    const body = await request.json();
    const parsed = tournamentBankDetailsSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || 'Check the bank details and try again.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const bankDetails = await updateTournamentBankDetails({
      bankName: parsed.data.bankName,
      accountName: parsed.data.accountName,
      accountNumber: parsed.data.accountNumber,
      paymentNote: parsed.data.paymentNote || '',
    });

    await writeAuditLog({
      action: 'tournament.bank_details_update',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'tournament_bank_details',
      resourceId: '1',
      request,
      metadata: { bankName: bankDetails.bankName, accountName: bankDetails.accountName },
    });

    return NextResponse.json({ bankDetails });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }
    return handleAuthError(error);
  }
}
