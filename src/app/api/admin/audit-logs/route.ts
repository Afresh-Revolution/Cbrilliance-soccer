import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthGet, handleAuthError } from '@/lib/security/api-guard';
import { listAuditLogs } from '@/lib/data/audit-admin';
import { auditLogsQuerySchema } from '@/lib/validators/schemas';

export async function GET(request: NextRequest) {
  const blocked = guardAuthGet(request, 'admin-audit-logs', 30, 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'admin.settings');

    const parsed = auditLogsQuerySchema.safeParse({
      limit: request.nextUrl.searchParams.get('limit') ?? undefined,
      offset: request.nextUrl.searchParams.get('offset') ?? undefined,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const logs = await listAuditLogs(parsed.data);
    return NextResponse.json({ logs });
  } catch (error) {
    return handleAuthError(error);
  }
}
