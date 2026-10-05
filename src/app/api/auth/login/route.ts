import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@/lib/db/supabase/server';
import { loginSchema } from '@/lib/validators/schemas';
import { guardAuthMutation } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { ensureAdminProfile } from '@/lib/auth/session';
import { isAdminRole } from '@/lib/auth/rbac';

export async function POST(request: NextRequest) {
  const blocked = await guardAuthMutation(request, 'auth-login', 10, 15 * 60 * 1000);
  if (blocked) return blocked;

  const response = NextResponse.json({ success: true });

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = createRouteHandlerClient(request, response);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email.trim().toLowerCase(),
      password: parsed.data.password,
    });

    if (error || !data.user) {
      await writeAuditLog({
        action: 'auth.login_failed',
        actorEmail: parsed.data.email,
        request,
        metadata: { reason: error?.message ?? 'unknown' },
      });
      return NextResponse.json(
        { error: 'Invalid email or password', code: 'invalid_credentials' },
        { status: 401 },
      );
    }

    const profile = await ensureAdminProfile(
      data.user.id,
      data.user.email ?? parsed.data.email,
    );

    if (!profile || !isAdminRole(profile.role)) {
      await supabase.auth.signOut();
      await writeAuditLog({
        action: 'admin.access_denied',
        actorId: data.user.id,
        actorEmail: parsed.data.email,
        request,
        metadata: { reason: profile ? 'insufficient_role' : 'missing_profile' },
      });
      return NextResponse.json(
        {
          error: 'You do not have admin access. Run seed-admin or contact a super admin.',
          code: 'admin_access_denied',
        },
        { status: 403 },
      );
    }

    await writeAuditLog({
      action: 'auth.login',
      actorId: data.user.id,
      actorEmail: profile.email,
      request,
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Supabase API is not configured')) {
      return NextResponse.json(
        {
          error: 'Admin login is not configured. Add your Supabase URL and publishable key to .env, then restart the app.',
        },
        { status: 503 },
      );
    }
    console.error('[api/auth/login]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
