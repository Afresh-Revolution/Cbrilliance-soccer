import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthGet, handleAuthError } from '@/lib/security/api-guard';
import { listAuditLogs } from '@/lib/data/audit-admin';

export async function GET(request: NextRequest) {
  const blocked = guardAuthGet(request, 'admin-audit-logs', 30, 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'admin.settings');

    const { searchParams } = request.nextUrl;
    const limit = Number(searchParams.get('limit') ?? 50);
    const offset = Number(searchParams.get('offset') ?? 0);

    const logs = await listAuditLogs({ limit, offset });
    return NextResponse.json({ logs });
  } catch (error) {
    return handleAuthError(error);
  }
}
