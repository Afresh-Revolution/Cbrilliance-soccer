'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import { deleteWithCsrf, fetchCsrfToken, postWithCsrf } from '@/lib/auth/csrf-client';
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
  const router = useRouter();
  const [resendBusy, setResendBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await deleteWithCsrf<{ error?: string }>(
        `/api/admin/tournament/${registration.id}`,
        csrf,
      );
      if (!ok) {
        setDeleteError(typeof data.error === 'string' ? data.error : 'Could not delete this registration.');
        return;
      }
      router.push('/admin/tournament');
      router.refresh();
    } catch {
      setDeleteError('Could not delete this registration.');
    } finally {
      setDeleting(false);
    }
  }

  async function resendEmail() {
    setResendBusy(true);
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
      setResendBusy(false);
    }
  }

  const positions = registration.officialPositions
    .map((position) => TOURNAMENT_POSITION_LABELS[position] ?? position)
    .join(', ');

  return (
    <div className="admin-tournament-detail">
      <header className="admin-tournament-detail__top">
        <div>
          <Button href="/admin/tournament" variant="outline" size="sm">← Back</Button>
          <p className="admin-tournament-detail__code">{registration.registrationCode}</p>
          <h1>{registration.teamName}</h1>
        </div>
        <div className="admin-tournament-detail__actions">
          <span className="admin-tournament-detail__status">
            {TOURNAMENT_STATUS_LABELS[registration.status]}
          </span>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={resendEmail}
            disabled={resendBusy || deleting || !registration.officialEmail}
          >
            {resendBusy ? 'Sending…' : 'Resend email'}
          </button>
          <button
            type="button"
            className="btn btn--outline btn--sm admin-tournament-actions__delete"
            onClick={() => {
              setDeleteError(null);
              setConfirmingDelete(true);
            }}
            disabled={resendBusy || deleting}
          >
            Delete
          </button>
        </div>
      </header>

      {error && <div className="form__error">{error}</div>}
      {sentTo && <div className="form__success">Registration email sent again to {sentTo}.</div>}
      {!registration.officialEmail && (
        <p className="text-muted">This registration has no email address, so the confirmation cannot be resent.</p>
      )}

      <div className="admin-tournament-detail__sections">
        <section className="admin-tournament-detail__card">
          <h2>Team</h2>
          <dl className="admin-tournament-detail__grid">
            <div><dt>Short name</dt><dd>{registration.teamShortName || '—'}</dd></div>
            <div><dt>Submitted</dt><dd>{formatDate(registration.createdAt)}</dd></div>
            <div><dt>Location</dt><dd>{registration.teamLocation}</dd></div>
            <div><dt>Home ground</dt><dd>{registration.homeGround || '—'}</dd></div>
            <div><dt>Home jersey</dt><dd>{registration.jerseyHome}</dd></div>
            <div><dt>Away jersey</dt><dd>{registration.jerseyAway || '—'}</dd></div>
            <div><dt>Captain</dt><dd>{registration.teamCaptain || '—'}</dd></div>
            <div><dt>Coach</dt><dd>{registration.coachName || '—'}</dd></div>
            <div className="admin-tournament-detail__wide"><dt>Assistant coach</dt><dd>{registration.assistantCoach || '—'}</dd></div>
          </dl>
        </section>

        <section className="admin-tournament-detail__card">
          <h2>Official</h2>
          <dl className="admin-tournament-detail__grid">
            <div><dt>Name</dt><dd>{registration.officialFullName}</dd></div>
            <div><dt>Position</dt><dd>{positions || '—'}</dd></div>
            <div>
              <dt>Phone</dt>
              <dd><a href={`tel:${registration.officialPhone}`}>{registration.officialPhone}</a></dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>
                {registration.officialWhatsapp
                  ? <a href={`https://wa.me/${registration.officialWhatsapp.replace(/\D/g, '')}`}>{registration.officialWhatsapp}</a>
                  : '—'}
              </dd>
            </div>
            <div className="admin-tournament-detail__wide">
              <dt>Email</dt>
              <dd>
                {registration.officialEmail
                  ? <a href={`mailto:${registration.officialEmail}`}>{registration.officialEmail}</a>
                  : '—'}
              </dd>
            </div>
            <div><dt>Representative</dt><dd>{registration.representativeName}</dd></div>
            <div><dt>Signature</dt><dd>{registration.digitalSignature}</dd></div>
          </dl>
        </section>

        <section className="admin-tournament-detail__card">
          <h2>Payment</h2>
          <dl className="admin-tournament-detail__grid">
            <div><dt>Fee</dt><dd>{formatNaira(registration.registrationFeeAmount)}</dd></div>
            <div><dt>Method</dt><dd>Bank transfer</dd></div>
            <div className="admin-tournament-detail__wide">
              <dt>Payment reference</dt>
              <dd>{registration.paymentReference}</dd>
            </div>
          </dl>
          <div className="admin-tournament-detail__links">
            {registration.teamLogoUrl && (
              <a className="btn btn--outline btn--sm" href={registration.teamLogoUrl} target="_blank" rel="noreferrer">Team logo</a>
            )}
            {registration.paymentReceiptUrl && (
              <a className="btn btn--outline btn--sm" href={registration.paymentReceiptUrl} target="_blank" rel="noreferrer">Payment receipt</a>
            )}
          </div>
        </section>

        <section className="admin-tournament-detail__card admin-tournament-detail__card--squad">
          <h2>Squad · {registration.players.length} of {registration.playerCount}</h2>
          {registration.players.length === 0 ? (
            <p className="text-muted">No players added yet.</p>
          ) : (
            <ul className="admin-tournament-detail__squad">
              {registration.players.map((player) => (
                <li key={player.id}>
                  <span>{player.squadNumber}</span>
                  {player.fullName}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {confirmingDelete && (
        <AdminConfirmDialog
          title="Delete registration?"
          message={`${registration.registrationCode} for ${registration.teamName} will be permanently removed, including every squad player. This cannot be undone.`}
          confirmLabel="Delete registration"
          busy={deleting}
          error={deleteError}
          onCancel={() => {
            if (deleting) return;
            setConfirmingDelete(false);
            setDeleteError(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
