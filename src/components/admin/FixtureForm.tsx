'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Fixture } from '@/types';
import type { AdminFixtureInput } from '@/lib/data/fixture-admin';
import { fetchCsrfToken, patchWithCsrf, postWithCsrf } from '@/lib/auth/csrf-client';

const emptyForm: AdminFixtureInput = {
  homeTeam: 'CBFC',
  awayTeam: '',
  homeScore: null,
  awayScore: null,
  matchDate: '',
  venue: '',
  competition: 'Premier League',
  isUpcoming: true,
};

interface Props {
  mode: 'create' | 'edit';
  initial?: AdminFixtureInput;
  fixtureId?: string;
}

export default function FixtureForm({ mode, initial, fixtureId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AdminFixtureInput>(initial ?? emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof AdminFixtureInput>(key: K, value: AdminFixtureInput[K]) {
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
        homeScore: form.isUpcoming ? null : form.homeScore,
        awayScore: form.isUpcoming ? null : form.awayScore,
      };

      if (mode === 'create') {
        const { ok, data } = await postWithCsrf<{ fixture?: Fixture; error?: string }>(
          '/api/admin/fixtures',
          payload,
          csrf,
        );
        if (!ok) {
          setError(typeof data.error === 'string' ? data.error : 'Failed to create fixture');
          return;
        }
        router.push('/admin/fixtures');
        router.refresh();
        return;
      }

      const { ok, data } = await patchWithCsrf<{ fixture?: Fixture; error?: string }>(
        `/api/admin/fixtures/${fixtureId}`,
        payload,
        csrf,
      );
      if (!ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to update fixture');
        return;
      }
      router.push('/admin/fixtures');
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
          <label className="form__label" htmlFor="homeTeam">Home Team</label>
          <input
            id="homeTeam"
            className="form__input"
            value={form.homeTeam}
            onChange={(e) => updateField('homeTeam', e.target.value)}
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="awayTeam">Away Team</label>
          <input
            id="awayTeam"
            className="form__input"
            value={form.awayTeam}
            onChange={(e) => updateField('awayTeam', e.target.value)}
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="matchDate">Match Date & Time</label>
          <input
            id="matchDate"
            type="datetime-local"
            className="form__input"
            value={form.matchDate}
            onChange={(e) => updateField('matchDate', e.target.value)}
            required
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="competition">Competition</label>
          <input
            id="competition"
            className="form__input"
            value={form.competition ?? ''}
            onChange={(e) => updateField('competition', e.target.value)}
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="venue">Venue</label>
          <input
            id="venue"
            className="form__input"
            value={form.venue ?? ''}
            onChange={(e) => updateField('venue', e.target.value)}
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="isUpcoming">Status</label>
          <select
            id="isUpcoming"
            className="form__input"
            value={form.isUpcoming ? 'upcoming' : 'played'}
            onChange={(e) => updateField('isUpcoming', e.target.value === 'upcoming')}
          >
            <option value="upcoming">Upcoming</option>
            <option value="played">Played (Result)</option>
          </select>
        </div>

        {!form.isUpcoming && (
          <>
            <div className="form__group">
              <label className="form__label" htmlFor="homeScore">Home Score</label>
              <input
                id="homeScore"
                type="number"
                min={0}
                className="form__input"
                value={form.homeScore ?? ''}
                onChange={(e) => updateField('homeScore', e.target.value === '' ? null : Number(e.target.value))}
              />
            </div>

            <div className="form__group">
              <label className="form__label" htmlFor="awayScore">Away Score</label>
              <input
                id="awayScore"
                type="number"
                min={0}
                className="form__input"
                value={form.awayScore ?? ''}
                onChange={(e) => updateField('awayScore', e.target.value === '' ? null : Number(e.target.value))}
              />
            </div>
          </>
        )}
      </div>

      <div className="admin-player-form__actions">
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving…' : mode === 'create' ? 'Create Fixture' : 'Save Changes'}
        </button>
        <button type="button" className="btn btn--outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}
