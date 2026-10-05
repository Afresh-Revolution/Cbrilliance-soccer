import { NextRequest, NextResponse } from 'next/server';
import { tournamentRegistrationSchema } from '@/lib/validators/schemas';
import { guardPublicPost, jsonError } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { getSiteUrl } from '@/lib/email/config';
import { notifyTournamentRegistration } from '@/lib/email/notifications';
import { createTournamentRegistration } from '@/lib/data/tournament';
import {
  isUploadedFile,
  storePaymentReceipt,
  storeTeamLogo,
  TournamentUploadError,
} from '@/lib/tournament/files';
import { tournamentErrorResponse } from '@/lib/tournament/errors';

export const runtime = 'nodejs';

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

function firstIssue(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined>; formErrors: string[] } }): string {
  const flat = error.flatten();
  for (const messages of Object.values(flat.fieldErrors)) {
    if (messages?.[0]) return messages[0];
  }
  return flat.formErrors[0] || 'Please check the form and try again.';
}

export async function POST(request: NextRequest) {
  const blocked = await guardPublicPost(request, 'tournament-registration', 5, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const formData = await request.formData();
    const parsed = tournamentRegistrationSchema.safeParse({
      teamName: field(formData, 'teamName'),
      teamShortName: field(formData, 'teamShortName'),
      teamLocation: field(formData, 'teamLocation'),
      homeGround: field(formData, 'homeGround'),
      officialFullName: field(formData, 'officialFullName'),
      officialPhone: field(formData, 'officialPhone'),
      officialWhatsapp: field(formData, 'officialWhatsapp'),
      officialEmail: field(formData, 'officialEmail'),
      officialPositions: formData.getAll('officialPositions').filter((value) => typeof value === 'string'),
      playerCount: field(formData, 'playerCount'),
      teamCaptain: field(formData, 'teamCaptain'),
      coachName: field(formData, 'coachName'),
      assistantCoach: field(formData, 'assistantCoach'),
      jerseyHome: field(formData, 'jerseyHome'),
      jerseyAway: field(formData, 'jerseyAway'),
      confirmAccurate: field(formData, 'confirmAccurate'),
      agreeRules: field(formData, 'agreeRules'),
      understandVerification: field(formData, 'understandVerification'),
      consentMedia: field(formData, 'consentMedia'),
      representativeName: field(formData, 'representativeName'),
      digitalSignature: field(formData, 'digitalSignature'),
      paymentMethod: field(formData, 'paymentMethod'),
      paymentReference: field(formData, 'paymentReference'),
    });

    if (!parsed.success) {
      return jsonError(firstIssue(parsed.error), 400);
    }

    const logo = formData.get('teamLogo');
    const receipt = formData.get('paymentReceipt');
    if (!isUploadedFile(receipt)) {
      return jsonError('Upload a payment receipt', 400);
    }

    const [teamLogoUrl, paymentReceiptUrl] = await Promise.all([
      isUploadedFile(logo) ? storeTeamLogo(logo) : Promise.resolve(undefined),
      storePaymentReceipt(receipt),
    ]);

    const registration = await createTournamentRegistration({
      ...parsed.data,
      teamShortName: parsed.data.teamShortName || undefined,
      homeGround: parsed.data.homeGround || undefined,
      officialWhatsapp: parsed.data.officialWhatsapp || undefined,
      officialEmail: parsed.data.officialEmail || undefined,
      teamCaptain: parsed.data.teamCaptain || undefined,
      coachName: parsed.data.coachName || undefined,
      assistantCoach: parsed.data.assistantCoach || undefined,
      jerseyAway: parsed.data.jerseyAway || undefined,
      teamLogoUrl,
      paymentReceiptUrl,
    });

    const squadPath = `/tournament/squad/${registration.accessToken}`;
    notifyTournamentRegistration({
      teamName: registration.teamName,
      officialName: registration.officialFullName,
      email: registration.officialEmail,
      phone: registration.officialPhone,
      registrationCode: registration.registrationCode,
      squadUrl: `${getSiteUrl()}${squadPath}`,
      playerCount: registration.playerCount,
      location: registration.teamLocation,
    });

    await writeAuditLog({
      action: 'form.tournament',
      resource: 'tournament_registrations',
      resourceId: registration.id,
      request,
      metadata: {
        registrationCode: registration.registrationCode,
        teamName: registration.teamName,
      },
    });

    return NextResponse.json({
      success: true,
      registrationCode: registration.registrationCode,
      squadPath,
    });
  } catch (error) {
    if (error instanceof TournamentUploadError) {
      return jsonError(error.message, 400);
    }
    const mapped = tournamentErrorResponse(error);
    return jsonError(mapped.message, mapped.status);
  }
}
