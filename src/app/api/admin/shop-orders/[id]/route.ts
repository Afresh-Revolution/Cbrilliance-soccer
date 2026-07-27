import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, handleAuthError, rejectInvalidUuid } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { shopOrderStatusSchema } from '@/lib/validators/schemas';
import { updateShopOrderStatus } from '@/lib/data/shop-orders-admin';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-shop-order-update', 60, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'inquiries.update');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    const body = await request.json();
    const parsed = shopOrderStatusSchema.safeParse(body.status);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const order = await updateShopOrderStatus(id, parsed.data);

    await writeAuditLog({
      action: 'shop_order.update',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'shop_orders',
      resourceId: order.id,
      request,
      metadata: { status: order.status },
    });

    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }
    return handleAuthError(error);
  }
}
