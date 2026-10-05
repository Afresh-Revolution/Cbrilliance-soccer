'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import { postPublicForm } from '@/lib/auth/public-form-client';
import { deleteWithCsrf, fetchCsrfToken } from '@/lib/auth/csrf-client';
import { TOURNAMENT_STATUS_LABELS } from '@/lib/constants/navigation';
import type { TournamentPlayer, TournamentSquad } from '@/types';

function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
    return data.error;
  }
  return fallback;
}

export default function SquadDashboardClient({
  token,
  squad,
}: {
  token: string;
  squad: TournamentSquad;
}) {
  const router = useRouter();
  const [players, setPlayers] = useState(squad.players);
  const [fullName, setFullName] = useState('');
  const [squadNumber, setSquadNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const squadFull = players.length >= squad.playerCount;

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { ok, data } = await postPublicForm<{ player?: TournamentPlayer; error?: string }>(
        `/api/tournament/squad/${token}/players`,
        { fullName, squadNumber: Number(squadNumber) },
      );
      if (!ok || !data.player) {
        throw new Error(errorMessage(data, 'Could not add that player.'));
      }
      setPlayers((current) =>
        [...current, data.player!].sort((a, b) => a.squadNumber - b.squadNumber),
      );
      setFullName('');
      setSquadNumber('');
      router.refresh();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Could not add that player.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(playerId: string) {
    setError('');
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await deleteWithCsrf<{ error?: string }>(
        `/api/tournament/squad/${token}/players/${playerId}`,
        csrf,
      );
      if (!ok) throw new Error(errorMessage(data, 'Could not remove that player.'));
      setPlayers((current) => current.filter((player) => player.id !== playerId));
      router.refresh();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'Could not remove that player.');
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="label">Squad dashboard</p>
          <h1>{squad.teamName}</h1>
          <p>
            {squad.teamShortName ? `${squad.teamShortName} · ` : ''}
            {squad.teamLocation}
          </p>
        </div>
      </section>

      <section className="section section--surface">
        <div className="container tournament-squad">
          <div className="tournament-squad__summary">
            <p>Registration ID: <strong>{squad.registrationCode}</strong></p>
            <p>Status: {TOURNAMENT_STATUS_LABELS[squad.status] ?? squad.status}</p>
            <p>{players.length} of {squad.playerCount} players added</p>
          </div>

          <div className="tournament-form__note">
            <p>Add each player individually with a squad name and shirt number. The Tournament Committee verifies the squad after registration.</p>
          </div>

          {error && <div className="form__error">{error}</div>}

          {squad.squadLocked ? (
            <p className="tournament-squad__locked">
              This squad is locked. The Tournament Committee has finished verification, so players can no longer be added or removed.
            </p>
          ) : (
            <form className="form tournament-squad__form" onSubmit={handleAdd}>
              <div className="form__row">
                <div className="form__group">
                  <label className="form__label" htmlFor="fullName">Squad name</label>
                  <input
                    className="form__input"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    required
                    disabled={squadFull}
                  />
                </div>
                <div className="form__group">
                  <label className="form__label" htmlFor="squadNumber">Squad number</label>
                  <input
                    className="form__input"
                    id="squadNumber"
                    type="number"
                    min={1}
                    max={99}
                    value={squadNumber}
                    onChange={(e) => setSquadNumber(e.target.value)}
                    placeholder="e.g. 10"
                    required
                    disabled={squadFull}
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading || squadFull}>
                {squadFull ? 'Squad is full' : loading ? 'Adding...' : 'Add player'}
              </Button>
            </form>
          )}

          <div className="tournament-squad__table-wrap">
            <table className="tournament-squad__table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Name</th>
                  {!squad.squadLocked && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {players.length === 0 ? (
                  <tr>
                    <td colSpan={squad.squadLocked ? 2 : 3} className="admin__table-empty">
                      No players yet. Add squad members one at a time.
                    </td>
                  </tr>
                ) : (
                  players.map((player) => (
                    <tr key={player.id}>
                      <td>{player.squadNumber}</td>
                      <td>{player.fullName}</td>
                      {!squad.squadLocked && (
                        <td>
                          <button type="button" className="btn btn--outline btn--sm" onClick={() => handleRemove(player.id)}>
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
