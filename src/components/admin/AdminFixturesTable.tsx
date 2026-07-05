'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Fixture } from '@/types';
import { fetchCsrfToken, deleteWithCsrf } from '@/lib/auth/csrf-client';

function formatMatchDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatScore(fixture: Fixture) {
  if (fixture.isUpcoming) return '—';
  const home = fixture.homeScore ?? 0;
  const away = fixture.awayScore ?? 0;
  return `${home} – ${away}`;
}

export default function AdminFixturesTable({ fixtures: initialFixtures }: { fixtures: Fixture[] }) {
  const router = useRouter();
  const [fixtures, setFixtures] = useState(initialFixtures);
  const [busyId, setBusyId] = useState<string | null>(null);

  const upcomingCount = fixtures.filter((f) => f.isUpcoming).length;

  async function handleDelete(fixture: Fixture) {
    const label = `${fixture.homeTeam} vs ${fixture.awayTeam}`;
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;

    setBusyId(fixture.id);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await deleteWithCsrf<{ error?: string }>(
        `/api/admin/fixtures/${fixture.id}`,
        csrf,
      );
      if (!ok) {
        alert(typeof data.error === 'string' ? data.error : 'Failed to delete fixture');
        return;
      }
      setFixtures((prev) => prev.filter((f) => f.id !== fixture.id));
      router.refresh();
    } catch {
      alert('Failed to delete fixture');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="admin-videos__toolbar">
        <p>
          {fixtures.length} fixture{fixtures.length === 1 ? '' : 's'} · {upcomingCount} upcoming
        </p>
        <Link href="/admin/fixtures/new" className="btn btn--primary btn--sm">+ Add Fixture</Link>
      </div>

      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Match</th>
              <th>Date</th>
              <th>Competition</th>
              <th>Venue</th>
              <th>Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fixtures.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin__table-empty">
                  No fixtures yet. Add your first match to get started.
                </td>
              </tr>
            ) : (
              fixtures.map((fixture) => (
                <tr key={fixture.id}>
                  <td>
                    <strong>{fixture.homeTeam}</strong> vs <strong>{fixture.awayTeam}</strong>
                  </td>
                  <td>{formatMatchDate(fixture.date)}</td>
                  <td>{fixture.competition || '—'}</td>
                  <td>{fixture.venue || '—'}</td>
                  <td>{formatScore(fixture)}</td>
                  <td>
                    <span className={`admin-videos__status ${fixture.isUpcoming ? 'admin-videos__status--standard' : 'admin-videos__status--featured'}`}>
                      {fixture.isUpcoming ? 'Upcoming' : 'Played'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-videos__actions">
                      <Link href={`/admin/fixtures/${fixture.id}/edit`} className="btn btn--outline btn--sm">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm admin-videos__delete"
                        disabled={busyId === fixture.id}
                        onClick={() => handleDelete(fixture)}
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
    </>
  );
}
