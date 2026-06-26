'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ClubStaffRecord } from '@/lib/data/staff-admin';
import type { AdminStaffInput } from '@/lib/data/staff-admin';
import { fetchCsrfToken, patchWithCsrf, postWithCsrf } from '@/lib/auth/csrf-client';
import ImageUploadField from '@/components/admin/ImageUploadField';

const emptyForm: AdminStaffInput = {
  name: '',
  role: '',
  photo: '',
  bio: '',
  sortOrder: 0,
};

interface Props {
  mode: 'create' | 'edit';
  initial?: AdminStaffInput;
  staffId?: string;
}

export default function StaffForm({ mode, initial, staffId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AdminStaffInput>(initial ?? emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof AdminStaffInput>(key: K, value: AdminStaffInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const csrf = await fetchCsrfToken();

      if (mode === 'create') {
        const { ok, data } = await postWithCsrf<{ staff?: ClubStaffRecord; error?: string }>(
          '/api/admin/staff',
          form,
          csrf,
        );
        if (!ok) {
          setError(typeof data.error === 'string' ? data.error : 'Failed to add staff member');
          return;
        }
        router.push('/admin/staff');
        router.refresh();
        return;
      }

      const { ok, data } = await patchWithCsrf<{ staff?: ClubStaffRecord; error?: string }>(
        `/api/admin/staff/${staffId}`,
        form,
        csrf,
      );
      if (!ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to update staff member');
        return;
      }
      router.push('/admin/staff');
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
          <label className="form__label" htmlFor="name">Full name</label>
          <input
            id="name"
            className="form__input"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="role">Role / title</label>
          <input
            id="role"
            className="form__input"
            value={form.role}
            onChange={(e) => updateField('role', e.target.value)}
            placeholder="e.g. Head Coach"
            required
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
            label="Photo"
            value={form.photo ?? ''}
            onChange={(url) => updateField('photo', url)}
            folder="staff"
          />
        </div>

        <div className="form__group admin-player-form__full">
          <label className="form__label" htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            className="form__input form__textarea"
            rows={4}
            value={form.bio ?? ''}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder="Short credentials or background"
          />
        </div>
      </div>

      <div className="admin-player-form__actions">
        <button type="button" className="btn btn--outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Add Staff Member' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
