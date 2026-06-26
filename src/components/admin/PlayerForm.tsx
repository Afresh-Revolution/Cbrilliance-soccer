'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Player, PlayerStatus } from '@/types';
import type { AdminPlayerInput } from '@/lib/data/player-admin';
import { POSITION_LABELS, STATUS_LABELS } from '@/lib/constants/navigation';
import { fetchCsrfToken, patchWithCsrf, postWithCsrf } from '@/lib/auth/csrf-client';
import { slugify } from '@/lib/utils/format';
import ImageUploadField from '@/components/admin/ImageUploadField';

const STATUSES = Object.keys(STATUS_LABELS) as PlayerStatus[];

const emptyForm: AdminPlayerInput = {
  fullName: '',
  dateOfBirth: '',
  nationality: '',
  position: 'forward',
  height: '',
  weight: '',
  preferredFoot: 'right',
  profilePhoto: '',
  biography: '',
  status: 'in_development',
  academyGraduate: false,
  professionalPlayer: false,
  featured: false,
  jerseyNumber: null,
  statistics: {
    matchesPlayed: 0,
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    minutesPlayed: 0,
  },
};

interface Props {
  mode: 'create' | 'edit';
  initial?: AdminPlayerInput;
  playerId?: string;
}

export default function PlayerForm({ mode, initial, playerId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AdminPlayerInput>(initial ?? emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof AdminPlayerInput>(key: K, value: AdminPlayerInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateStat(key: keyof NonNullable<AdminPlayerInput['statistics']>, value: number) {
    setForm((prev) => ({
      ...prev,
      statistics: { ...(prev.statistics ?? emptyForm.statistics!), [key]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const csrf = await fetchCsrfToken();
      const payload = {
        ...form,
        slug: form.slug?.trim() || slugify(form.fullName),
      };

      if (mode === 'create') {
        const { ok, data } = await postWithCsrf<{ player?: Player; error?: string }>(
          '/api/admin/players',
          payload,
          csrf,
        );
        if (!ok) {
          setError(typeof data.error === 'string' ? data.error : 'Failed to create player');
          return;
        }
        router.push('/admin/players');
        router.refresh();
        return;
      }

      const { ok, data } = await patchWithCsrf<{ player?: Player; error?: string }>(
        `/api/admin/players/${playerId}`,
        payload,
        csrf,
      );
      if (!ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to update player');
        return;
      }
      router.push('/admin/players');
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
          <label className="form__label" htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            className="form__input"
            value={form.fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="slug">Slug</label>
          <input
            id="slug"
            className="form__input"
            value={form.slug ?? ''}
            placeholder={slugify(form.fullName || 'player-slug')}
            onChange={(e) => updateField('slug', e.target.value)}
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="dateOfBirth">Date of birth</label>
          <input
            id="dateOfBirth"
            type="date"
            className="form__input"
            value={form.dateOfBirth}
            onChange={(e) => updateField('dateOfBirth', e.target.value)}
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="nationality">Nationality</label>
          <input
            id="nationality"
            className="form__input"
            value={form.nationality}
            onChange={(e) => updateField('nationality', e.target.value)}
            placeholder="e.g. Ghana"
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="position">Position</label>
          <select
            id="position"
            className="form__input"
            value={form.position}
            onChange={(e) => updateField('position', e.target.value as AdminPlayerInput['position'])}
          >
            {Object.entries(POSITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="status">Status</label>
          <select
            id="status"
            className="form__input"
            value={form.status}
            onChange={(e) => updateField('status', e.target.value as PlayerStatus)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="height">Height</label>
          <input id="height" className="form__input" value={form.height ?? ''} onChange={(e) => updateField('height', e.target.value)} placeholder="1.82m" />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="weight">Weight</label>
          <input id="weight" className="form__input" value={form.weight ?? ''} onChange={(e) => updateField('weight', e.target.value)} placeholder="76kg" />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="preferredFoot">Preferred foot</label>
          <select
            id="preferredFoot"
            className="form__input"
            value={form.preferredFoot ?? 'right'}
            onChange={(e) => updateField('preferredFoot', e.target.value as AdminPlayerInput['preferredFoot'])}
          >
            <option value="right">Right</option>
            <option value="left">Left</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="jerseyNumber">Jersey number</label>
          <input
            id="jerseyNumber"
            type="number"
            min={1}
            max={99}
            className="form__input"
            value={form.jerseyNumber ?? ''}
            onChange={(e) => updateField('jerseyNumber', e.target.value ? Number(e.target.value) : null)}
          />
        </div>

        <div className="admin-player-form__full">
          <ImageUploadField
            label="Profile photo"
            value={form.profilePhoto ?? ''}
            onChange={(url) => updateField('profilePhoto', url)}
            folder="players"
          />
        </div>

        <div className="form__group admin-player-form__full">
          <label className="form__label" htmlFor="biography">Biography</label>
          <textarea
            id="biography"
            className="form__input form__textarea"
            rows={4}
            value={form.biography ?? ''}
            onChange={(e) => updateField('biography', e.target.value)}
          />
        </div>
      </div>

      <fieldset className="admin-player-form__stats">
        <legend>Season statistics</legend>
        <div className="admin-player-form__grid">
          {(['goals', 'assists', 'matchesPlayed', 'cleanSheets', 'minutesPlayed'] as const).map((key) => (
            <div className="form__group" key={key}>
              <label className="form__label" htmlFor={key}>
                {key === 'matchesPlayed' ? 'Matches' : key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                id={key}
                type="number"
                min={0}
                className="form__input"
                value={form.statistics?.[key] ?? 0}
                onChange={(e) => updateStat(key, Number(e.target.value))}
              />
            </div>
          ))}
        </div>
      </fieldset>

      <div className="admin-player-form__checks">
        <label><input type="checkbox" checked={form.academyGraduate ?? false} onChange={(e) => updateField('academyGraduate', e.target.checked)} /> Academy graduate</label>
        <label><input type="checkbox" checked={form.professionalPlayer ?? false} onChange={(e) => updateField('professionalPlayer', e.target.checked)} /> Professional player</label>
        <label><input type="checkbox" checked={form.featured ?? false} onChange={(e) => updateField('featured', e.target.checked)} /> Featured on site</label>
      </div>

      <div className="admin-player-form__actions">
        <button type="button" className="btn btn--outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Add Player' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
