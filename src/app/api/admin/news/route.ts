import { NextRequest, NextResponse } from 'next/server';
import { requireAuthContext } from '@/lib/auth/session';
import { requirePermission } from '@/lib/auth/rbac';
import { guardAuthPost, handleAuthError } from '@/lib/security/api-guard';
import { validateCsrf } from '@/lib/security/csrf';
import { writeAuditLog } from '@/lib/security/audit';
import { adminNewsArticleSchema } from '@/lib/validators/schemas';
import { createNewsArticle } from '@/lib/data/news-admin';

export async function POST(request: NextRequest) {
  const blocked = guardAuthPost(request, 'admin-news-create', 30, 60 * 60 * 1000);
  if (blocked) return blocked;

  if (!(await validateCsrf(request))) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  try {
    const ctx = await requireAuthContext();
    requirePermission(ctx, 'content.write');

    const body = await request.json();
    const parsed = adminNewsArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const article = await createNewsArticle(parsed.data);

    await writeAuditLog({
      action: 'news.create',
      actorId: ctx.userId,
      actorEmail: ctx.email,
      resource: 'news_articles',
      resourceId: article.id,
      request,
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json({ error: 'An article with this slug already exists' }, { status: 409 });
    }
    if (error instanceof Error && error.message === 'DATABASE_NOT_CONFIGURED') {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }
    return handleAuthError(error);
  }
}
