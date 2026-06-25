import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/db/supabase/server';
import { updateCredentialsSchema } from '@/lib/validators/schemas';
import { guardAuthPost, handleAuthError } from '@/lib/security/api-guard';
import { validateCsrf } from '@/lib/security/csrf';
import { writeAuditLog } from '@/lib/security/audit';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';

export async function POST(request: NextRequest) {
  const blocked = guardAuthPost(request, 'admin-credentials', 3, 60 * 60 * 1000);
  if (blocked) return blocked;

  if (!(await validateCsrf(request))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'admin.settings');

    const body = await request.json();
    const parsed = updateCredentialsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: ctx.email,
      password: parsed.data.currentPassword,
    });

    if (verifyError) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const updates: { email?: string; password?: string } = {};
    if (parsed.data.newEmail) updates.email = parsed.data.newEmail;
    if (parsed.data.newPassword) updates.password = parsed.data.newPassword;

    const { error: updateError } = await supabase.auth.updateUser(updates);
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    if (parsed.data.newEmail) {
      const service = await createServiceClient();
      await service
        .from('profiles')
        .update({ email: parsed.data.newEmail })
        .eq('id', ctx.userId);
    }

    await writeAuditLog({
      action: 'auth.credentials_updated',
      actorId: ctx.userId,
      actorEmail: parsed.data.newEmail ?? ctx.email,
      resource: 'admin_settings',
      request,
      metadata: {
        emailChanged: Boolean(parsed.data.newEmail),
        passwordChanged: Boolean(parsed.data.newPassword),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
