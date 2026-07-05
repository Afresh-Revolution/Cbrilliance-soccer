import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, guardAuthGet, handleAuthError } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { adminAcademyFacilitySettingsSchema } from '@/lib/validators/schemas';
import { getAcademyFacilitySettings, updateAcademyFacilitySettings } from '@/lib/data/academy-facility-admin';

export async function GET(request: NextRequest) {
  const blocked = guardAuthGet(request, 'admin-academy-facilities-settings-get');
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.read');

    const settings = await getAcademyFacilitySettings();
    return NextResponse.json({ settings });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest) {
  const blocked = await guardAuthMutation(request, 'admin-academy-facilities-settings-update', 30, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const body = await request.json();
    const parsed = adminAcademyFacilitySettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const settings = await updateAcademyFacilitySettings(parsed.data);

    await writeAuditLog({
      action: 'academy_facility.settings_update',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'academy_facility_settings',
      resourceId: '1',
      request,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }
    return handleAuthError(error);
  }
}
