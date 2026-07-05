'use client';

import { useState } from 'react';
import type { ActivityItem, Player } from '@/types';
import type { AdminActivityInput } from '@/lib/data/activity-shared';
import { fetchCsrfToken, patchWithCsrf, postWithCsrf } from '@/lib/auth/csrf-client';

const ACTIVITY_TYPES = [
  { value: 'trial', label: 'Trial' },
  { value: 'achievement', label: 'Achievement' },
  { value: 'camp', label: 'Camp' },
  { value: 'club', label: 'Club' },
  { value: 'agency', label: 'Agency' },
] as const;

const emptyForm: AdminActivityInput = {
  type: 'club',
  title: '',
  description: '',
  activityDate: '',
  playerId: null,
};

interface Props {
  mode: 'create' | 'edit';
  initial?: AdminActivityInput;
  activityId?: string;
  players: Player[];
  inModal?: boolean;
  onCancel?: () => void;
  onSuccess?: (activity: ActivityItem) => void;
}

export default function ActivityForm({
  mode,
  initial,
  activityId,
  players,
  inModal = false,
  onCancel,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<AdminActivityInput>(initial ?? emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof AdminActivityInput>(key: K, value: AdminActivityInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const csrf = await fetchCsrfToken();

      if (mode === 'create') {
        const { ok, data } = await postWithCsrf<{ activity?: ActivityItem; error?: string }>(
          '/api/admin/activity',
          form,
          csrf,
        );
        if (!ok || !data.activity) {
          setError(typeof data.error === 'string' ? data.error : 'Failed to create activity');
          return;
        }
        onSuccess?.(data.activity);
        return;
      }

      const { ok, data } = await patchWithCsrf<{ activity?: ActivityItem; error?: string }>(
        `/api/admin/activity/${activityId}`,
        form,
        csrf,
      );
      if (!ok || !data.activity) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to update activity');
        return;
      }
      onSuccess?.(data.activity);
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
          <label className="form__label" htmlFor="activityType">Type</label>
          <select
            id="activityType"
            className="form__input"
            value={form.type}
            onChange={(e) => updateField('type', e.target.value as AdminActivityInput['type'])}
            required
          >
            {ACTIVITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="activityDate">Date & Time</label>
          <input
            id="activityDate"
            type="datetime-local"
            className="form__input"
            value={form.activityDate}
            onChange={(e) => updateField('activityDate', e.target.value)}
            required
          />
        </div>

        <div className="form__group admin-player-form__full">
          <label className="form__label" htmlFor="activityTitle">Title</label>
          <input
            id="activityTitle"
            className="form__input"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
          />
        </div>

        <div className="form__group admin-player-form__full">
          <label className="form__label" htmlFor="activityDescription">Description</label>
          <textarea
            id="activityDescription"
            className="form__input"
            rows={3}
            value={form.description ?? ''}
            onChange={(e) => updateField('description', e.target.value)}
          />
        </div>

        <div className="form__group admin-player-form__full">
          <label className="form__label" htmlFor="activityPlayer">Linked Player (optional)</label>
          <select
            id="activityPlayer"
            className="form__input"
            value={form.playerId ?? ''}
            onChange={(e) => updateField('playerId', e.target.value || null)}
          >
            <option value="">None</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>{player.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-player-form__actions">
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving…' : mode === 'create' ? 'Add Activity' : 'Save Changes'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn--outline" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
