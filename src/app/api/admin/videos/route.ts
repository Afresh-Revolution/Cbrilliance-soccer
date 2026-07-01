import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, handleAuthError } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { adminVideoSchema } from '@/lib/validators/schemas';
import { createVideo } from '@/lib/data/video-admin';

export async function POST(request: NextRequest) {
  const blocked = await guardAuthMutation(request, 'admin-videos-create', 30, 60 * 60 * 1000);
  if (blocked) return blocked;



  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const body = await request.json();
    const parsed = adminVideoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const video = await createVideo(parsed.data);

    await writeAuditLog({
      action: 'video.create',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'videos',
      resourceId: video.id,
      request,
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }
    return handleAuthError(error);
  }
}
