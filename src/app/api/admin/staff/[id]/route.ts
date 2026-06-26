import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthPost, guardAuthGet, handleAuthError, rejectInvalidUuid } from '@/lib/security/api-guard';
import { validateCsrf } from '@/lib/security/csrf';
import { writeAuditLog } from '@/lib/security/audit';
import { adminStaffPatchSchema } from '@/lib/validators/schemas';
import { deleteStaff, getStaffById, updateStaff } from '@/lib/data/staff-admin';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthGet(request, 'admin-staff-get');
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.read');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;
    const staff = await getStaffById(id);
    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json({ staff });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthPost(request, 'admin-staff-update', 60, 60 * 60 * 1000);
  if (blocked) return blocked;

  if (!(await validateCsrf(request))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;
    const body = await request.json();
    const parsed = adminStaffPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const staff = await updateStaff(id, parsed.data);

    await writeAuditLog({
      action: 'staff.update',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'club_staff',
      resourceId: staff.id,
      request,
    });

    return NextResponse.json({ staff });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthPost(request, 'admin-staff-delete', 30, 60 * 60 * 1000);
  if (blocked) return blocked;

  if (!(await validateCsrf(request))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;
    await deleteStaff(id);

    await writeAuditLog({
      action: 'staff.delete',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'club_staff',
      resourceId: id,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
