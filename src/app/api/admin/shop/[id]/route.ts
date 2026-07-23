import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, guardAuthGet, handleAuthError, rejectInvalidUuid } from '@/lib/security/api-guard';
import { writeAuditLog } from '@/lib/security/audit';
import { adminShopProductPatchSchema } from '@/lib/validators/schemas';
import { deleteShopProduct, getShopProductById, updateShopProduct } from '@/lib/data/shop-admin';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthGet(request, 'admin-shop-get');
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.read');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    const product = await getShopProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Shop product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-shop-update', 60, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    const body = await request.json();
    const parsed = adminShopProductPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const product = await updateShopProduct(id, parsed.data);

    await writeAuditLog({
      action: 'shop_product.update',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'shop_products',
      resourceId: product.id,
      request,
    });

    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }
    return handleAuthError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-shop-delete', 30, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    await deleteShopProduct(id);

    await writeAuditLog({
      action: 'shop_product.delete',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'shop_products',
      resourceId: id,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }
    return handleAuthError(error);
  }
}
