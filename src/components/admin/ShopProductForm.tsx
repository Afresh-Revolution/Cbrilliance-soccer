'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ShopColorOption, ShopProduct } from '@/types';
import type { AdminShopProductInput } from '@/lib/data/shop-shared';
import {
  DEFAULT_APPAREL_SIZES,
  DEFAULT_BOOT_SIZES,
  DEFAULT_SHOP_COLORS,
  SHOP_CATEGORIES,
  defaultSizesForCategory,
} from '@/lib/data/shop-shared';
import { fetchCsrfToken, patchWithCsrf, postWithCsrf } from '@/lib/auth/csrf-client';
import ImageUploadField from '@/components/admin/ImageUploadField';

const emptyForm: AdminShopProductInput = {
  name: '',
  description: '',
  imageUrl: '',
  category: 'jerseys',
  colors: [...DEFAULT_SHOP_COLORS],
  sizes: [...DEFAULT_APPAREL_SIZES],
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
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#C8A75D');
  const [customSize, setCustomSize] = useState('');

  function updateField<K extends keyof AdminShopProductInput>(key: K, value: AdminShopProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleCategoryChange(category: AdminShopProductInput['category']) {
    setForm((prev) => ({
      ...prev,
      category,
      sizes: defaultSizesForCategory(category),
    }));
  }

  function addColor() {
    const name = newColorName.trim();
    const hex = newColorHex.trim().toUpperCase();
    if (!name || !/^#[0-9A-F]{6}$/.test(hex)) {
      setError('Add a color name and a valid hex like #C8A75D');
      return;
    }
    const next: ShopColorOption = { name, hex };
    const exists = (form.colors ?? []).some(
      (color) => color.name.toLowerCase() === name.toLowerCase() || color.hex === hex,
    );
    if (exists) {
      setError('That color is already listed');
      return;
    }
    updateField('colors', [...(form.colors ?? []), next]);
    setNewColorName('');
    setError('');
  }

  function removeColor(index: number) {
    updateField(
      'colors',
      (form.colors ?? []).filter((_, i) => i !== index),
    );
  }

  function toggleSize(size: string) {
    const current = form.sizes ?? [];
    if (current.includes(size)) {
      updateField(
        'sizes',
        current.filter((entry) => entry !== size),
      );
      return;
    }
    updateField('sizes', [...current, size]);
  }

  function addCustomSize() {
    const size = customSize.trim().toUpperCase();
    if (!size) return;
    if ((form.sizes ?? []).includes(size)) {
      setCustomSize('');
      return;
    }
    updateField('sizes', [...(form.sizes ?? []), size]);
    setCustomSize('');
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
      const payload = {
        ...form,
        colors: form.colors ?? [],
        sizes: form.sizes ?? [],
      };

      if (mode === 'create') {
        const { ok, data } = await postWithCsrf<{ product?: ShopProduct; error?: string }>(
          '/api/admin/shop',
          payload,
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
        payload,
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

  const sizeOptions =
    form.category === 'boots' ? DEFAULT_BOOT_SIZES : DEFAULT_APPAREL_SIZES;

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
            onChange={(e) => handleCategoryChange(e.target.value as AdminShopProductInput['category'])}
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

        <div className="form__group admin-player-form__full">
          <label className="form__label">Available colors</label>
          <div className="admin-shop__colors">
            {(form.colors ?? []).map((color, index) => (
              <div key={`${color.name}-${color.hex}-${index}`} className="admin-shop__color-row">
                <span
                  className="admin-shop__color-swatch"
                  style={{ backgroundColor: color.hex }}
                  aria-hidden
                />
                <span>{color.name}</span>
                <code>{color.hex}</code>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => removeColor(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="admin-shop__add-row">
            <input
              className="form__input"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="Color name"
            />
            <input
              className="form__input admin-shop__hex-input"
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/.test(newColorHex) ? newColorHex : '#C8A75D'}
              onChange={(e) => setNewColorHex(e.target.value.toUpperCase())}
              aria-label="Pick color"
            />
            <input
              className="form__input"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value.toUpperCase())}
              placeholder="#C8A75D"
            />
            <button type="button" className="btn btn--outline btn--sm" onClick={addColor}>
              Add color
            </button>
          </div>
        </div>

        <div className="form__group admin-player-form__full">
          <label className="form__label">Available sizes</label>
          <div className="admin-shop__sizes">
            {sizeOptions.map((size) => {
              const active = (form.sizes ?? []).includes(size);
              return (
                <button
                  key={size}
                  type="button"
                  className={`admin-shop__size-chip${active ? ' admin-shop__size-chip--active' : ''}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              );
            })}
          </div>
          <div className="admin-shop__add-row">
            <input
              className="form__input"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              placeholder="Custom size"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomSize();
                }
              }}
            />
            <button type="button" className="btn btn--outline btn--sm" onClick={addCustomSize}>
              Add size
            </button>
          </div>
          {(form.sizes ?? []).length > 0 ? (
            <p className="admin-shop__hint">Selected: {(form.sizes ?? []).join(', ')}</p>
          ) : (
            <p className="admin-shop__hint">Select at least one size customers can choose.</p>
          )}
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
