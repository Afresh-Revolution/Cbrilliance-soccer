import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthPost, guardAuthGet, handleAuthError, rejectInvalidUuid } from '@/lib/security/api-guard';
import { validateCsrf } from '@/lib/security/csrf';
import { writeAuditLog } from '@/lib/security/audit';
import { adminNewsPatchSchema } from '@/lib/validators/schemas';
import { deleteNewsArticle, getNewsArticleById, updateNewsArticle } from '@/lib/data/news-admin';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthGet(request, 'admin-news-get');
  if (blocked) return blocked;

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.read');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;
    const article = await getNewsArticleById(id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthPost(request, 'admin-news-update', 60, 60 * 60 * 1000);
  if (blocked) return blocked;

  if (!(await validateCsrf(request))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;
    const body = await request.json();
    const parsed = adminNewsPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const article = await updateNewsArticle(id, parsed.data);

    await writeAuditLog({
      action: 'news.update',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'news_articles',
      resourceId: article.id,
      request,
    });

    return NextResponse.json({ article });
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json({ error: 'An article with this slug already exists' }, { status: 409 });
    }
    return handleAuthError(error);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const blocked = guardAuthPost(request, 'admin-news-delete', 30, 60 * 60 * 1000);
  if (blocked) return blocked;

  if (!(await validateCsrf(request))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const { id } = await context.params;
    const invalid = rejectInvalidUuid(id);
    if (invalid) return invalid;
    await deleteNewsArticle(id);

    await writeAuditLog({
      action: 'news.delete',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'news_articles',
      resourceId: id,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
