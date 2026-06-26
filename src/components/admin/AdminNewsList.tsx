'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { NewsArticle } from '@/types';
import { NEWS_CATEGORY_LABELS } from '@/lib/constants/navigation';
import { fetchCsrfToken, patchWithCsrf, deleteWithCsrf } from '@/lib/auth/csrf-client';

function formatArticleDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function ArticleThumbnail({ article }: { article: NewsArticle }) {
  if (article.coverImage) {
    return (
      <Image
        src={article.coverImage}
        alt={article.title}
        width={120}
        height={72}
        className="admin-news__thumb-img"
      />
    );
  }

  return <div className="admin-news__thumb-fallback" aria-hidden />;
}

export default function AdminNewsList({ articles: initialArticles }: { articles: NewsArticle[] }) {
  const router = useRouter();
  const [articles, setArticles] = useState(initialArticles);
  const [busyId, setBusyId] = useState<string | null>(null);

  const publishedCount = articles.filter((a) => a.published).length;

  async function handleTogglePublish(article: NewsArticle) {
    setBusyId(article.id);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await patchWithCsrf<{ article?: NewsArticle; error?: string }>(
        `/api/admin/news/${article.id}`,
        { published: !article.published },
        csrf,
      );
      if (!ok || !data.article) {
        alert(typeof data.error === 'string' ? data.error : 'Failed to update article');
        return;
      }
      setArticles((prev) => prev.map((a) => (a.id === article.id ? data.article! : a)));
      router.refresh();
    } catch {
      alert('Failed to update article');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(article: NewsArticle) {
    if (!confirm(`Delete "${article.title}"? This cannot be undone.`)) return;

    setBusyId(article.id);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await deleteWithCsrf<{ error?: string }>(
        `/api/admin/news/${article.id}`,
        csrf,
      );
      if (!ok) {
        alert(typeof data.error === 'string' ? data.error : 'Failed to delete article');
        return;
      }
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      router.refresh();
    } catch {
      alert('Failed to delete article');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="admin-news__toolbar">
        <p>
          {articles.length} article{articles.length === 1 ? '' : 's'} · {publishedCount} published
        </p>
        <Link href="/admin/news/new" className="btn btn--primary btn--sm">
          + New Article
        </Link>
      </div>

      <div className="admin-news__list">
        {articles.length === 0 ? (
          <p className="admin-news__empty">No articles yet. Create your first story to get started.</p>
        ) : (
          articles.map((article) => (
            <article key={article.id} className="admin-news__card">
              <Link href={`/admin/news/${article.id}/edit`} className="admin-news__card-main">
                <div className="admin-news__thumb">
                  <ArticleThumbnail article={article} />
                </div>
                <div className="admin-news__content">
                  <p className="admin-news__category">{NEWS_CATEGORY_LABELS[article.category]}</p>
                  <h2 className="admin-news__title">{article.title}</h2>
                  <p className="admin-news__date">
                    {formatArticleDate(article.publishedAt ?? article.createdAt)}
                  </p>
                </div>
              </Link>

              <div className="admin-news__actions">
                <span
                  className={`admin-news__status ${article.published ? 'admin-news__status--published' : 'admin-news__status--draft'}`}
                >
                  {article.published ? 'Published' : 'Draft'}
                </span>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  disabled={busyId === article.id}
                  onClick={() => handleTogglePublish(article)}
                >
                  {article.published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--sm admin-news__delete"
                  disabled={busyId === article.id}
                  onClick={() => handleDelete(article)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </>
  );
}
