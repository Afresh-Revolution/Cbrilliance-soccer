import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/db/supabase/server';
import { validateCsrf } from '@/lib/security/csrf';
import { writeAuditLog } from '@/lib/security/audit';
import { getAuthContext } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  if (!(await validateCsrf(request))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  const response = NextResponse.json({ success: true });

  try {
    const ctx = await getAuthContext();
    const supabase = createRouteHandlerClient(request, response);
    await supabase.auth.signOut();

    if (ctx) {
      await writeAuditLog({
        action: 'auth.logout',
        actorId: ctx.userId,
        actorEmail: ctx.email,
        request,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
