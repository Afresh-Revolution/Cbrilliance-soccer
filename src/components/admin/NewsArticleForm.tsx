'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { NewsArticle } from '@/types';
import type { AdminNewsInput } from '@/lib/data/news-admin';
import { NEWS_CATEGORY_LABELS } from '@/lib/constants/navigation';
import { fetchCsrfToken, patchWithCsrf, postWithCsrf } from '@/lib/auth/csrf-client';
import { slugify } from '@/lib/utils/format';
import ImageUploadField from '@/components/admin/ImageUploadField';

const CATEGORIES = Object.keys(NEWS_CATEGORY_LABELS) as NewsArticle['category'][];

const emptyForm: AdminNewsInput = {
  title: '',
  excerpt: '',
  content: '',
  category: 'club_news',
  coverImage: '',
  author: 'CBFC Media',
  published: false,
  featured: false,
};

interface Props {
  mode: 'create' | 'edit';
  initial?: AdminNewsInput;
  articleId?: string;
}

export default function NewsArticleForm({ mode, initial, articleId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AdminNewsInput>(initial ?? emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof AdminNewsInput>(key: K, value: AdminNewsInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const csrf = await fetchCsrfToken();
      const payload = {
        ...form,
        slug: form.slug?.trim() || slugify(form.title),
      };

      if (mode === 'create') {
        const { ok, data } = await postWithCsrf<{ article?: NewsArticle; error?: string }>(
          '/api/admin/news',
          payload,
          csrf,
        );
        if (!ok) {
          setError(typeof data.error === 'string' ? data.error : 'Failed to create article');
          return;
        }
        router.push('/admin/news');
        router.refresh();
        return;
      }

      const { ok, data } = await patchWithCsrf<{ article?: NewsArticle; error?: string }>(
        `/api/admin/news/${articleId}`,
        payload,
        csrf,
      );
      if (!ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to update article');
        return;
      }
      router.push('/admin/news');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="admin-player-form" onSubmit={handleSubmit}>
      {error && <div className="admin-player-form__error">{error}</div>}

      <div className="admin-player-form__grid">
        <div className="form__group admin-player-form__full">
          <label className="form__label" htmlFor="title">Title</label>
          <input
            id="title"
            className="form__input"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="slug">Slug</label>
          <input
            id="slug"
            className="form__input"
            value={form.slug ?? ''}
            placeholder={slugify(form.title || 'article-slug')}
            onChange={(e) => updateField('slug', e.target.value)}
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="category">Category</label>
          <select
            id="category"
            className="form__input"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value as AdminNewsInput['category'])}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{NEWS_CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="author">Author</label>
          <input
            id="author"
            className="form__input"
            value={form.author ?? 'CBFC Media'}
            onChange={(e) => updateField('author', e.target.value)}
          />
        </div>

        <div className="admin-player-form__full">
          <ImageUploadField
            label="Cover image"
            value={form.coverImage ?? ''}
            onChange={(url) => updateField('coverImage', url)}
            folder="news"
          />
        </div>

        <div className="form__group admin-player-form__full">
          <label className="form__label" htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            className="form__input form__textarea"
            rows={3}
            value={form.excerpt ?? ''}
            onChange={(e) => updateField('excerpt', e.target.value)}
          />
        </div>

        <div className="form__group admin-player-form__full">
          <label className="form__label" htmlFor="content">Content</label>
          <textarea
            id="content"
            className="form__input form__textarea"
            rows={10}
            value={form.content ?? ''}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="HTML or plain text content"
          />
        </div>
      </div>

      <div className="admin-player-form__checks">
        <label>
          <input
            type="checkbox"
            checked={form.published ?? false}
            onChange={(e) => updateField('published', e.target.checked)}
          />
          {' '}Publish immediately
        </label>
        <label>
          <input
            type="checkbox"
            checked={form.featured ?? false}
            onChange={(e) => updateField('featured', e.target.checked)}
          />
          {' '}Featured article
        </label>
      </div>

      <div className="admin-player-form__actions">
        <button type="button" className="btn btn--outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create Article' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
