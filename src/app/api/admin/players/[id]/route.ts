import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, guardAuthGet, handleAuthError, rejectInvalidUuid } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { adminPlayerPatchSchema } from '@/lib/validators/schemas';
import { deletePlayer, getPlayerById, updatePlayer } from '@/lib/data/player-admin';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthGet(request, 'admin-players-get');
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.read');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;
    const player = await getPlayerById(id);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({ player });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-players-update', 60, 60 * 60 * 1000);
  if (blocked) return blocked;



  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;
    const body = await request.json();
    const parsed = adminPlayerPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const player = await updatePlayer(id, parsed.data);

    await writeAuditLog({
      action: 'player.update',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'players',
      resourceId: player.id,
      request,
    });

    revalidatePath('/');
    revalidatePath('/players');
    revalidatePath(`/player/${player.slug}`);
    revalidatePath('/admin/players');

    return NextResponse.json({ player });
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json({ error: 'A player with this slug already exists' }, { status: 409 });
    }
    return handleAuthError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-players-delete', 30, 60 * 60 * 1000);
  if (blocked) return blocked;



  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;
    await deletePlayer(id);

    await writeAuditLog({
      action: 'player.delete',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'players',
      resourceId: id,
      request,
    });

    revalidatePath('/');
    revalidatePath('/players');
    revalidatePath('/admin/players');

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
