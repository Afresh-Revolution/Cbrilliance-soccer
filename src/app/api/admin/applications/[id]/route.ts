import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthPost, guardAuthGet, handleAuthError, rejectInvalidUuid } from '@/lib/security/api-guard';
import { validateCsrf } from '@/lib/security/csrf';
import { writeAuditLog } from '@/lib/security/audit';
import { adminApplicationStatusSchema } from '@/lib/validators/schemas';
import { getApplicationById, updateApplicationStatus } from '@/lib/data/application-admin';
import { notifyApplicationStatusChange } from '@/lib/email/notifications';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthGet(request, 'admin-applications-get');
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'inquiries.read');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;
    const application = await getApplicationById(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthPost(request, 'admin-applications-update', 60, 60 * 60 * 1000);
  if (blocked) return blocked;

  if (!(await validateCsrf(request))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'inquiries.update');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;
    const body = await request.json();
    const parsed = adminApplicationStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await getApplicationById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const application = await updateApplicationStatus(id, parsed.data.status);

    notifyApplicationStatusChange(
      application.fullName,
      application.email,
      existing.status,
      application.status,
    );

    await writeAuditLog({
      action: 'application.update',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'academy_applications',
      resourceId: application.id,
      request,
      metadata: { status: application.status },
    });

    return NextResponse.json({ application });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }
    return handleAuthError(error);
  }
}
