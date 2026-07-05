import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, guardAuthGet, handleAuthError, rejectInvalidUuid } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { adminActivityPatchSchema } from '@/lib/validators/schemas';
import { deleteActivityItem, getActivityItemById, updateActivityItem } from '@/lib/data/activity-admin';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthGet(request, 'admin-activity-get');
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.read');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    const activity = await getActivityItemById(id);
    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    return NextResponse.json({ activity });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-activity-update', 60, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    const body = await request.json();
    const parsed = adminActivityPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const activity = await updateActivityItem(id, parsed.data);

    await writeAuditLog({
      action: 'activity.update',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'activity_items',
      resourceId: activity.id,
      request,
    });

    return NextResponse.json({ activity });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-activity-delete', 30, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    await deleteActivityItem(id);

    await writeAuditLog({
      action: 'activity.delete',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'activity_items',
      resourceId: id,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
