'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ShopProduct } from '@/types';
import type { AdminShopProductInput } from '@/lib/data/shop-shared';
import { SHOP_CATEGORIES } from '@/lib/data/shop-shared';
import { fetchCsrfToken, patchWithCsrf, postWithCsrf } from '@/lib/auth/csrf-client';
import ImageUploadField from '@/components/admin/ImageUploadField';

const emptyForm: AdminShopProductInput = {
  name: '',
  description: '',
  imageUrl: '',
  category: 'jerseys',
  sortOrder: 0,
};

interface Props {
  mode: 'create' | 'edit';
  initial?: AdminShopProductInput;
  productId?: string;
  inModal?: boolean;
  onCancel?: () => void;
  onSuccess?: (product: ShopProduct) => void;
}

export default function ShopProductForm({
  mode,
  initial,
  productId,
  inModal = false,
  onCancel,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AdminShopProductInput>(initial ?? emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof AdminShopProductInput>(key: K, value: AdminShopProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCancel() {
    if (onCancel) {
      onCancel();
      return;
    }
    router.back();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const csrf = await fetchCsrfToken();

      if (mode === 'create') {
        const { ok, data } = await postWithCsrf<{ product?: ShopProduct; error?: string }>(
          '/api/admin/shop',
          form,
          csrf,
        );
        if (!ok || !data.product) {
          setError(typeof data.error === 'string' ? data.error : 'Failed to add shop item');
          return;
        }
        if (onSuccess) {
          onSuccess(data.product);
          return;
        }
        router.push('/admin/shop');
        router.refresh();
        return;
      }

      const { ok, data } = await patchWithCsrf<{ product?: ShopProduct; error?: string }>(
        `/api/admin/shop/${productId}`,
        form,
        csrf,
      );
      if (!ok || !data.product) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to update shop item');
        return;
      }
      if (onSuccess) {
        onSuccess(data.product);
        return;
      }
      router.push('/admin/shop');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className={`admin-player-form${inModal ? ' admin-player-form--modal' : ''}`}
      onSubmit={handleSubmit}
    >
      {error && <div className="admin-player-form__error">{error}</div>}

      <div className="admin-player-form__grid">
        <div className="form__group">
          <label className="form__label" htmlFor="shopName">Name</label>
          <input
            id="shopName"
            className="form__input"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Home Jersey 2026"
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="shopCategory">Category</label>
          <select
            id="shopCategory"
            className="form__input"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value as AdminShopProductInput['category'])}
            required
          >
            {SHOP_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="shopSortOrder">Display order</label>
          <input
            id="shopSortOrder"
            type="number"
            min={0}
            className="form__input"
            value={form.sortOrder ?? 0}
            onChange={(e) => updateField('sortOrder', Number(e.target.value))}
          />
        </div>

        <div className="form__group admin-player-form__full">
          <label className="form__label" htmlFor="shopDescription">Description</label>
          <textarea
            id="shopDescription"
            className="form__input"
            rows={3}
            value={form.description ?? ''}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Optional short description"
          />
        </div>

        <div className="admin-player-form__full">
          <ImageUploadField
            label="Product image"
            value={form.imageUrl ?? ''}
            onChange={(url) => updateField('imageUrl', url)}
            folder="shop"
            hint="Upload a product photo from your device or drag it into the drop zone"
          />
        </div>
      </div>

      <div className="admin-player-form__actions">
        <button type="button" className="btn btn--outline" onClick={handleCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Add Shop Item' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
