import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, handleAuthError } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { adminPlayerSchema } from '@/lib/validators/schemas';
import { createPlayer } from '@/lib/data/player-admin';

export async function POST(request: NextRequest) {
  const blocked = await guardAuthMutation(request, 'admin-players-create', 30, 60 * 60 * 1000);
  if (blocked) return blocked;



  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const body = await request.json();
    const parsed = adminPlayerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const player = await createPlayer(parsed.data);

    await writeAuditLog({
      action: 'player.create',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'players',
      resourceId: player.id,
      request,
    });

    revalidatePath('/');
    revalidatePath('/players');
    revalidatePath('/admin/players');

    return NextResponse.json({ player }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json({ error: 'A player with this slug already exists' }, { status: 409 });
    }
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }
    return handleAuthError(error);
  }
}
