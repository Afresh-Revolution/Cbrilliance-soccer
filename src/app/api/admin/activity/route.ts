import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, handleAuthError } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { adminActivitySchema } from '@/lib/validators/schemas';
import { createActivityItem } from '@/lib/data/activity-admin';

export async function POST(request: NextRequest) {
  const blocked = await guardAuthMutation(request, 'admin-activity-create', 30, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const body = await request.json();
    const parsed = adminActivitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const activity = await createActivityItem(parsed.data);

    await writeAuditLog({
      action: 'activity.create',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'activity_items',
      resourceId: activity.id,
      request,
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }
    return handleAuthError(error);
  }
}
