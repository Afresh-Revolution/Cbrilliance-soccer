'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Player, Video } from '@/types';
import type { AdminVideoInput } from '@/lib/data/video-admin';
import { POSITION_LABELS } from '@/lib/constants/navigation';
import { fetchCsrfToken, patchWithCsrf, postWithCsrf } from '@/lib/auth/csrf-client';
import ImageUploadField from '@/components/admin/ImageUploadField';

const AGES = ['U10', 'U13', 'U15', 'U17', 'U19', 'Senior'] as const;
const POSITIONS = ['all', 'goalkeeper', 'defender', 'midfielder', 'forward'] as const;

const emptyForm: AdminVideoInput = {
  title: '',
  thumbnail: '',
  videoUrl: '',
  playerId: null,
  playerName: '',
  position: 'all',
  ageCategory: 'Senior',
  duration: '',
  featured: false,
};

interface Props {
  mode: 'create' | 'edit';
  initial?: AdminVideoInput;
  videoId?: string;
  players: Player[];
}

export default function VideoForm({ mode, initial, videoId, players }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AdminVideoInput>(initial ?? emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function updateField<K extends keyof AdminVideoInput>(key: K, value: AdminVideoInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePlayerSelect(playerId: string) {
    if (!playerId) {
      updateField('playerId', null);
      return;
    }

    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    setForm((prev) => ({
      ...prev,
      playerId,
      playerName: player.fullName,
      position: player.position,
      ageCategory: player.age >= 19 ? 'Senior' : player.age >= 17 ? 'U19' : player.age >= 15 ? 'U17' : 'U15',
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
        playerName: form.playerName?.trim() || (form.playerId ? undefined : 'Team'),
      };

      if (mode === 'create') {
        const { ok, data } = await postWithCsrf<{ video?: Video; error?: string }>(
          '/api/admin/videos',
          payload,
          csrf,
        );
        if (!ok) {
          setError(typeof data.error === 'string' ? data.error : 'Failed to create video');
          return;
        }
        router.push('/admin/videos');
        router.refresh();
        return;
      }

      const { ok, data } = await patchWithCsrf<{ video?: Video; error?: string }>(
        `/api/admin/videos/${videoId}`,
        payload,
        csrf,
      );
      if (!ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to update video');
        return;
      }
      router.push('/admin/videos');
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

        <div className="form__group admin-player-form__full">
          <label className="form__label" htmlFor="videoUrl">Video URL</label>
          <input
            id="videoUrl"
            className="form__input"
            value={form.videoUrl}
            onChange={(e) => updateField('videoUrl', e.target.value)}
            placeholder="YouTube embed URL or direct video link"
            required
          />
        </div>

        <div className="admin-player-form__full">
          <ImageUploadField
            label="Thumbnail"
            value={form.thumbnail ?? ''}
            onChange={(url) => updateField('thumbnail', url)}
            folder="videos"
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="playerId">Linked player</label>
          <select
            id="playerId"
            className="form__input"
            value={form.playerId ?? ''}
            onChange={(e) => handlePlayerSelect(e.target.value)}
          >
            <option value="">Team / No player</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>{player.fullName}</option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="playerName">Player name</label>
          <input
            id="playerName"
            className="form__input"
            value={form.playerName ?? ''}
            onChange={(e) => updateField('playerName', e.target.value)}
            placeholder="Team"
          />
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="position">Position</label>
          <select
            id="position"
            className="form__input"
            value={form.position ?? 'all'}
            onChange={(e) => updateField('position', e.target.value as AdminVideoInput['position'])}
          >
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos === 'all' ? 'All' : POSITION_LABELS[pos]}
              </option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="ageCategory">Age category</label>
          <select
            id="ageCategory"
            className="form__input"
            value={form.ageCategory ?? 'Senior'}
            onChange={(e) => updateField('ageCategory', e.target.value as AdminVideoInput['ageCategory'])}
          >
            {AGES.map((age) => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>

        <div className="form__group">
          <label className="form__label" htmlFor="duration">Duration</label>
          <input
            id="duration"
            className="form__input"
            value={form.duration ?? ''}
            onChange={(e) => updateField('duration', e.target.value)}
            placeholder="4:32"
          />
        </div>
      </div>

      <div className="admin-player-form__checks">
        <label>
          <input
            type="checkbox"
            checked={form.featured ?? false}
            onChange={(e) => updateField('featured', e.target.checked)}
          />
          {' '}Featured on video hub
        </label>
      </div>

      <div className="admin-player-form__actions">
        <button type="button" className="btn btn--outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Add Video' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
