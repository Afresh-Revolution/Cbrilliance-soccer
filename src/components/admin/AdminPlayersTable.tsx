'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Player, PlayerStatus } from '@/types';
import { POSITION_LABELS, STATUS_LABELS } from '@/lib/constants/navigation';
import { fetchCsrfToken, patchWithCsrf, deleteWithCsrf } from '@/lib/auth/csrf-client';

const STATUSES = Object.keys(STATUS_LABELS) as PlayerStatus[];

function nationalityCode(nationality: string) {
  const parts = nationality.trim().split(/\s+/);
  if (parts.length >= 2) return parts.map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return nationality.slice(0, 2).toUpperCase();
}

function formatStats(player: Player) {
  const { goals, assists, matchesPlayed } = player.statistics;
  return `${goals}G - ${assists}A - ${matchesPlayed}M`;
}

function PlayerAvatar({ player }: { player: Player }) {
  const initial = player.fullName.trim().charAt(0).toUpperCase() || '?';

  if (player.profilePhoto) {
    return (
      <Image
        src={player.profilePhoto}
        alt={player.fullName}
        width={40}
        height={40}
        className="admin-players__avatar-img"
      />
    );
  }

  return <span className="admin-players__avatar-fallback">{initial}</span>;
}

function PlayerViewModal({ player, onClose }: { player: Player; onClose: () => void }) {
  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <div className="admin-modal__backdrop" onClick={onClose} aria-hidden />
      <div className="admin-modal__panel">
        <div className="admin-modal__head">
          <h2>{player.fullName}</h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="admin-modal__body">
          <div className="admin-modal__player-top">
            <PlayerAvatar player={player} />
            <div>
              <p className="admin-players__position">{POSITION_LABELS[player.position]}</p>
              <p className="text-muted">{player.nationality} · Age {player.age}</p>
              <p className="text-muted">{STATUS_LABELS[player.status]}</p>
            </div>
          </div>
          <dl className="admin-modal__details">
            <div><dt>Height</dt><dd>{player.height || '—'}</dd></div>
            <div><dt>Weight</dt><dd>{player.weight || '—'}</dd></div>
            <div><dt>Preferred foot</dt><dd>{player.preferredFoot}</dd></div>
            <div><dt>Stats</dt><dd>{formatStats(player)}</dd></div>
            <div><dt>Jersey</dt><dd>{player.jerseyNumber ?? '—'}</dd></div>
            <div><dt>Featured</dt><dd>{player.featured ? 'Yes' : 'No'}</dd></div>
          </dl>
          {player.biography && <p className="admin-modal__bio">{player.biography}</p>}
        </div>
        <div className="admin-modal__actions">
          <Link href={`/player/${player.slug}`} className="btn btn--outline btn--sm" target="_blank">
            Public profile
          </Link>
          <Link href={`/admin/players/${player.id}/edit`} className="btn btn--primary btn--sm">
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminPlayersTable({ players: initialPlayers }: { players: Player[] }) {
  const router = useRouter();
  const [players, setPlayers] = useState(initialPlayers);
  const [viewPlayer, setViewPlayer] = useState<Player | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleStatusChange(playerId: string, status: PlayerStatus) {
    setBusyId(playerId);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await patchWithCsrf<{ player?: Player; error?: string }>(
        `/api/admin/players/${playerId}`,
        { status },
        csrf,
      );
      if (!ok || !data.player) {
        alert(typeof data.error === 'string' ? data.error : 'Failed to update status');
        return;
      }
      setPlayers((prev) => prev.map((p) => (p.id === playerId ? data.player! : p)));
      router.refresh();
    } catch {
      alert('Failed to update status');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(player: Player) {
    if (!confirm(`Delete ${player.fullName}? This cannot be undone.`)) return;

    setBusyId(player.id);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await deleteWithCsrf<{ error?: string }>(
        `/api/admin/players/${player.id}`,
        csrf,
      );
      if (!ok) {
        alert(typeof data.error === 'string' ? data.error : 'Failed to delete player');
        return;
      }
      setPlayers((prev) => prev.filter((p) => p.id !== player.id));
      router.refresh();
    } catch {
      alert('Failed to delete player');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="admin-players__toolbar">
        <p>{players.length} player{players.length === 1 ? '' : 's'} registered</p>
        <Link href="/admin/players/new" className="btn btn--primary btn--sm">+ Add Player</Link>
      </div>

      <div className="admin__table-wrap">
        <table className="admin__table admin-players__table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Position</th>
              <th>Nationality</th>
              <th>Age</th>
              <th>Status</th>
              <th>Stats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-dash__table-empty">
                  No players yet. Add your first player to get started.
                </td>
              </tr>
            ) : (
              players.map((player) => (
                <tr key={player.id}>
                  <td>
                    <div className="admin-players__player-cell">
                      <div className="admin-players__avatar">
                        <PlayerAvatar player={player} />
                      </div>
                      <span>{player.fullName}</span>
                    </div>
                  </td>
                  <td><span className="admin-players__position">{POSITION_LABELS[player.position]}</span></td>
                  <td>
                    <span className="admin-players__nationality">
                      <span className="admin-players__nat-code">{nationalityCode(player.nationality)}</span>
                      {player.nationality}
                    </span>
                  </td>
                  <td>{player.age}</td>
                  <td>
                    <select
                      className="admin-players__status-select"
                      value={player.status}
                      disabled={busyId === player.id}
                      onChange={(e) => handleStatusChange(player.id, e.target.value as PlayerStatus)}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>{STATUS_LABELS[status]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="admin-players__stats">{formatStats(player)}</td>
                  <td>
                    <div className="admin-players__actions">
                      <button type="button" className="btn btn--outline btn--sm" onClick={() => setViewPlayer(player)}>
                        View
                      </button>
                      <Link href={`/admin/players/${player.id}/edit`} className="btn btn--outline btn--sm">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm admin-players__delete"
                        disabled={busyId === player.id}
                        onClick={() => handleDelete(player)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewPlayer && <PlayerViewModal player={viewPlayer} onClose={() => setViewPlayer(null)} />}
    </>
  );
}
