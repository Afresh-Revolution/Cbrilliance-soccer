import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthMutation, guardAuthGet, handleAuthError, rejectInvalidUuid } from '@/lib/security/api-guard';
import { parseInquirySource } from '@/lib/security/params';
import { writeAuditLog } from '@/lib/security/audit';
import { adminInquiryStatusSchema } from '@/lib/validators/schemas';
import { deleteInquiry, getInquiryById, updateInquiryStatus } from '@/lib/data/inquiry-admin';
import { notifyInquiryStatusChange } from '@/lib/email/notifications';

type RouteContext = { params: Promise<{ source: string; id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthGet(request, 'admin-inquiries-get');
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'inquiries.read');

    const { source: rawSource, id } = await context.params;
    const source = parseInquirySource(rawSource);
    if (!source) {
      return NextResponse.json({ error: 'Invalid inquiry source' }, { status: 400 });
    }
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    const inquiry = await getInquiryById(source, id);
    if (!inquiry) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ inquiry });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-inquiries-update', 60, 60 * 60 * 1000);
  if (blocked) return blocked;



  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'inquiries.update');

    const { source: rawSource, id } = await context.params;
    const source = parseInquirySource(rawSource);
    if (!source) {
      return NextResponse.json({ error: 'Invalid inquiry source' }, { status: 400 });
    }
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    const body = await request.json();
    const parsed = adminInquiryStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await getInquiryById(source, id);
    if (!existing) {
      return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
    }

    const inquiry = await updateInquiryStatus(source, id, parsed.data.status);

    notifyInquiryStatusChange(
      inquiry.name,
      inquiry.email,
      source,
      existing.status,
      inquiry.status,
    );

    await writeAuditLog({
      action: 'inquiry.update',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: source === 'scout' ? 'scout_inquiries' : 'contact_inquiries',
      resourceId: inquiry.id,
      request,
      metadata: { status: inquiry.status },
    });

    return NextResponse.json({ inquiry });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }
    return handleAuthError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const blocked = await guardAuthMutation(request, 'admin-inquiries-delete', 30, 60 * 60 * 1000);
  if (blocked) return blocked;



  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'inquiries.update');

    const { source: rawSource, id } = await context.params;
    const source = parseInquirySource(rawSource);
    if (!source) {
      return NextResponse.json({ error: 'Invalid inquiry source' }, { status: 400 });
    }
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;

    await deleteInquiry(source, id);

    await writeAuditLog({
      action: 'inquiry.delete',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: source === 'scout' ? 'scout_inquiries' : 'contact_inquiries',
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
