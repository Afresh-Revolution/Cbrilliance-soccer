import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, guardAuthGet, handleAuthError, rejectInvalidUuid } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { adminFixturePatchSchema } from '@/lib/validators/schemas';
import { deleteFixture, getFixtureById, updateFixture } from '@/lib/data/fixture-admin';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthGet(request, 'admin-fixtures-get');
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.read');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    const fixture = await getFixtureById(id);
    if (!fixture) {
      return NextResponse.json({ error: 'Fixture not found' }, { status: 404 });
    }

    return NextResponse.json({ fixture });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-fixtures-update', 60, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    const body = await request.json();
    const parsed = adminFixturePatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const fixture = await updateFixture(id, parsed.data);

    await writeAuditLog({
      action: 'fixture.update',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'fixtures',
      resourceId: fixture.id,
      request,
    });

    return NextResponse.json({ fixture });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-fixtures-delete', 30, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    await deleteFixture(id);

    await writeAuditLog({
      action: 'fixture.delete',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'fixtures',
      resourceId: id,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
