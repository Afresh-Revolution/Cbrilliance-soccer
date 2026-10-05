'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import { fetchCsrfToken, postWithCsrf } from '@/lib/auth/csrf-client';
import { TOURNAMENT_POSITION_LABELS, TOURNAMENT_STATUS_LABELS } from '@/lib/constants/navigation';
import { formatNaira } from '@/lib/tournament/constants';
import type { TournamentRegistration } from '@/types';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AdminTournamentDetail({
  registration,
}: {
  registration: TournamentRegistration;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');

  async function resendEmail() {
    setBusy(true);
    setError('');
    setSentTo('');
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await postWithCsrf<{ success?: boolean; email?: string; error?: string }>(
        `/api/admin/tournament/${registration.id}/resend`,
        {},
        csrf,
      );
      if (!ok) {
        setError(typeof data.error === 'string' ? data.error : 'Could not resend the email.');
        return;
      }
      setSentTo(data.email || registration.officialEmail || '');
    } catch {
      setError('Could not resend the email.');
    } finally {
      setBusy(false);
    }
  }

  const positions = registration.officialPositions
    .map((position) => TOURNAMENT_POSITION_LABELS[position] ?? position)
    .join(', ');

  return (
    <div className="admin-tournament-detail">
      <Button href="/admin/tournament" variant="outline" size="sm">← Back</Button>

      <div className="admin__header">
        <h1>{registration.teamName}</h1>
        <p className="text-muted">{registration.registrationCode}</p>
      </div>

      <div className="admin-tournament-detail__actions">
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={resendEmail}
          disabled={busy || !registration.officialEmail}
        >
          {busy ? 'Sending…' : 'Resend email'}
        </button>
        {!registration.officialEmail && (
          <p className="text-muted">This registration has no email address.</p>
        )}
      </div>
      {error && <div className="form__error">{error}</div>}
      {sentTo && <div className="form__success">Registration email sent again to {sentTo}.</div>}

      <dl className="admin-tournament-detail__grid">
        <div><dt>Status</dt><dd>{TOURNAMENT_STATUS_LABELS[registration.status]}</dd></div>
        <div><dt>Submitted</dt><dd>{formatDate(registration.createdAt)}</dd></div>
        <div><dt>Short name</dt><dd>{registration.teamShortName || '—'}</dd></div>
        <div><dt>Location</dt><dd>{registration.teamLocation}</dd></div>
        <div><dt>Home ground</dt><dd>{registration.homeGround || '—'}</dd></div>
        <div><dt>Official</dt><dd>{registration.officialFullName}</dd></div>
        <div><dt>Phone</dt><dd>{registration.officialPhone}</dd></div>
        <div><dt>WhatsApp</dt><dd>{registration.officialWhatsapp || '—'}</dd></div>
        <div><dt>Email</dt><dd>{registration.officialEmail || '—'}</dd></div>
        <div><dt>Position</dt><dd>{positions || '—'}</dd></div>
        <div><dt>Declared players</dt><dd>{registration.playerCount}</dd></div>
        <div><dt>Squad added</dt><dd>{registration.players.length}/{registration.playerCount}</dd></div>
        <div><dt>Captain</dt><dd>{registration.teamCaptain || '—'}</dd></div>
        <div><dt>Coach</dt><dd>{registration.coachName || '—'}</dd></div>
        <div><dt>Assistant coach</dt><dd>{registration.assistantCoach || '—'}</dd></div>
        <div><dt>Home jersey</dt><dd>{registration.jerseyHome}</dd></div>
        <div><dt>Away jersey</dt><dd>{registration.jerseyAway || '—'}</dd></div>
        <div><dt>Representative</dt><dd>{registration.representativeName}</dd></div>
        <div><dt>Signature</dt><dd>{registration.digitalSignature}</dd></div>
        <div><dt>Fee</dt><dd>{formatNaira(registration.registrationFeeAmount)}</dd></div>
        <div><dt>Payment reference</dt><dd>{registration.paymentReference}</dd></div>
      </dl>

      <div className="admin-tournament-detail__links">
        {registration.teamLogoUrl && (
          <a href={registration.teamLogoUrl} target="_blank" rel="noreferrer">View team logo</a>
        )}
        {registration.paymentReceiptUrl && (
          <a href={registration.paymentReceiptUrl} target="_blank" rel="noreferrer">View payment receipt</a>
        )}
      </div>

      <h2>Squad ({registration.players.length})</h2>
      {registration.players.length === 0 ? (
        <p className="text-muted">No players added yet.</p>
      ) : (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {registration.players.map((player) => (
                <tr key={player.id}>
                  <td>{player.squadNumber}</td>
                  <td>{player.fullName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
