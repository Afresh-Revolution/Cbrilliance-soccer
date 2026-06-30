'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { GalleryRecord } from '@/lib/data/gallery-admin';
import type { AdminGalleryInput } from '@/lib/data/gallery-admin';
import { fetchCsrfToken, patchWithCsrf, postWithCsrf } from '@/lib/auth/csrf-client';
import ImageUploadField from '@/components/admin/ImageUploadField';

const emptyForm: AdminGalleryInput = {
  title: '',
  imageUrl: '',
  category: '',
  sortOrder: 0,
};

interface Props {
  mode: 'create' | 'edit';
  initial?: AdminGalleryInput;
  galleryId?: string;
}

export default function GalleryForm({ mode, initial, galleryId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AdminGalleryInput>(initial ?? emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof AdminGalleryInput>(key: K, value: AdminGalleryInput[K]) {
  setForm((prev: AdminGalleryInput) => ({ ...prev, [key]: value }));
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const csrf = await fetchCsrfToken();

      if (mode === 'create') {
        const { ok, data } = await postWithCsrf<{ gallery?: GalleryRecord; error?: string }>(
          '/api/admin/gallery',
          form,
          csrf,
        );
        if (!ok) {
          setError(typeof data.error === 'string' ? data.error : 'Failed to add gallery image');
          return;
        }
        router.push('/admin/gallery');
        router.refresh();
        return;
      }

      const { ok, data } = await patchWithCsrf<{ gallery?: GalleryRecord; error?: string }>(
        `/api/admin/gallery/${galleryId}`,
        form,
        csrf,
      );
      if (!ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to update gallery image');
        return;
      }
      router.push('/admin/gallery');
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
        <div className="form__group">
          <label className="form__label" htmlFor="title">Title</label>
          <input
            id="title"
            className="form__input"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Matchday action"
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="category">Category</label>
          <input
            id="category"
            className="form__input"
            value={form.category ?? ''}
            onChange={(e) => updateField('category', e.target.value)}
            placeholder="training, matchday, squad"
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="sortOrder">Display order</label>
          <input
            id="sortOrder"
            type="number"
            min={0}
            className="form__input"
            value={form.sortOrder ?? 0}
            onChange={(e) => updateField('sortOrder', Number(e.target.value))}
          />
        </div>

        <div className="admin-player-form__full">
          <ImageUploadField
            label="Gallery image"
            value={form.imageUrl ?? ''}
            onChange={(url) => updateField('imageUrl', url)}
            folder="gallery"
            hint="Upload a local image from your device or drag it into the drop zone"
          />
        </div>
      </div>

      <div className="admin-player-form__actions">
        <button type="button" className="btn btn--outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Add Gallery Image' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
