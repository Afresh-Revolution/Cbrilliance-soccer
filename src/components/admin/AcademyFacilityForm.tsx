'use client';

import { useState } from 'react';
import type { AcademyFacility } from '@/types';
import type { AdminAcademyFacilityInput } from '@/lib/data/academy-facility-shared';
import { fetchCsrfToken, patchWithCsrf, postWithCsrf } from '@/lib/auth/csrf-client';
import ImageUploadField from '@/components/admin/ImageUploadField';

const emptyForm: AdminAcademyFacilityInput = {
  name: '',
  imageUrl: '',
  sortOrder: 0,
};

interface Props {
  mode: 'create' | 'edit';
  initial?: AdminAcademyFacilityInput;
  facilityId?: string;
  inModal?: boolean;
  onCancel?: () => void;
  onSuccess?: (facility: AcademyFacility) => void;
}

export default function AcademyFacilityForm({
  mode,
  initial,
  facilityId,
  inModal = false,
  onCancel,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<AdminAcademyFacilityInput>(initial ?? emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof AdminAcademyFacilityInput>(key: K, value: AdminAcademyFacilityInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const csrf = await fetchCsrfToken();

      if (mode === 'create') {
        const { ok, data } = await postWithCsrf<{ facility?: AcademyFacility; error?: string }>(
          '/api/admin/academy-facilities',
          form,
          csrf,
        );
        if (!ok || !data.facility) {
          setError(typeof data.error === 'string' ? data.error : 'Failed to add facility');
          return;
        }
        onSuccess?.(data.facility);
        return;
      }

      const { ok, data } = await patchWithCsrf<{ facility?: AcademyFacility; error?: string }>(
        `/api/admin/academy-facilities/${facilityId}`,
        form,
        csrf,
      );
      if (!ok || !data.facility) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to update facility');
        return;
      }
      onSuccess?.(data.facility);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={`admin-player-form${inModal ? ' admin-player-form--modal' : ''}`} onSubmit={handleSubmit}>
      {error && <div className="admin-player-form__error">{error}</div>}

      <div className="admin-player-form__grid">
        <div className="form__group">
          <label className="form__label" htmlFor="facilityName">Facility Name</label>
          <input
            id="facilityName"
            className="form__input"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Training Ground"
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="facilitySortOrder">Display order</label>
          <input
            id="facilitySortOrder"
            type="number"
            min={0}
            className="form__input"
            value={form.sortOrder ?? 0}
            onChange={(e) => updateField('sortOrder', Number(e.target.value))}
          />
        </div>

        <div className="admin-player-form__full">
          <ImageUploadField
            label="Facility image"
            value={form.imageUrl ?? ''}
            onChange={(url) => updateField('imageUrl', url)}
            folder="academy"
            hint="Upload a photo of the facility"
          />
        </div>
      </div>

      <div className="admin-player-form__actions">
        {onCancel && (
          <button type="button" className="btn btn--outline" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving…' : mode === 'create' ? 'Add Facility' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
