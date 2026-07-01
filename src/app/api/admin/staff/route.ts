import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, handleAuthError } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { adminStaffSchema } from '@/lib/validators/schemas';
import { createStaff } from '@/lib/data/staff-admin';

export async function POST(request: NextRequest) {
  const blocked = await guardAuthMutation(request, 'admin-staff-create', 30, 60 * 60 * 1000);
  if (blocked) return blocked;



  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const body = await request.json();
    const parsed = adminStaffSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const staff = await createStaff(parsed.data);

    await writeAuditLog({
      action: 'staff.create',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'club_staff',
      resourceId: staff.id,
      request,
    });

    return NextResponse.json({ staff }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }
    return handleAuthError(error);
  }
}
