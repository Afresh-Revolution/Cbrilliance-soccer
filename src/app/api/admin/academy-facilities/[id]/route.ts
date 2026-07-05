import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, guardAuthGet, handleAuthError, rejectInvalidUuid } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { adminAcademyFacilityPatchSchema } from '@/lib/validators/schemas';
import { deleteAcademyFacility, getAcademyFacilityById, updateAcademyFacility } from '@/lib/data/academy-facility-admin';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthGet(request, 'admin-academy-facilities-get');
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.read');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    const facility = await getAcademyFacilityById(id);
    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    return NextResponse.json({ facility });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-academy-facilities-update', 60, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    const body = await request.json();
    const parsed = adminAcademyFacilityPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const facility = await updateAcademyFacility(id, parsed.data);

    await writeAuditLog({
      action: 'academy_facility.update',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'academy_facilities',
      resourceId: facility.id,
      request,
    });

    return NextResponse.json({ facility });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-academy-facilities-delete', 30, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    await deleteAcademyFacility(id);

    await writeAuditLog({
      action: 'academy_facility.delete',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'academy_facilities',
      resourceId: id,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
