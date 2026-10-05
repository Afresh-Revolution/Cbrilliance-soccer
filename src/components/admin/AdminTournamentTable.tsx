'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TournamentRegistration, TournamentRegistrationStatus } from '@/types';
import { TOURNAMENT_POSITION_LABELS, TOURNAMENT_STATUS_LABELS } from '@/lib/constants/navigation';
import { fetchCsrfToken, patchWithCsrf } from '@/lib/auth/csrf-client';
import { formatNaira } from '@/lib/tournament/constants';

const STATUS_OPTIONS: TournamentRegistrationStatus[] = [
  'submitted',
  'under_review',
  'approved',
  'rejected',
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function TournamentViewModal({
  registration,
  onClose,
}: {
  registration: TournamentRegistration;
  onClose: () => void;
}) {
  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <div className="admin-modal__backdrop" onClick={onClose} aria-hidden />
      <div className="admin-modal__panel">
        <div className="admin-modal__head">
          <h2>{registration.teamName}</h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="admin-modal__body">
          <dl className="admin-modal__details">
            <div><dt>Registration ID</dt><dd>{registration.registrationCode}</dd></div>
            <div><dt>Status</dt><dd>{TOURNAMENT_STATUS_LABELS[registration.status]}</dd></div>
            <div><dt>Short name</dt><dd>{registration.teamShortName || '—'}</dd></div>
            <div><dt>Location</dt><dd>{registration.teamLocation}</dd></div>
            <div><dt>Home ground</dt><dd>{registration.homeGround || '—'}</dd></div>
            <div><dt>Official</dt><dd>{registration.officialFullName}</dd></div>
            <div><dt>Phone</dt><dd>{registration.officialPhone}</dd></div>
            <div><dt>WhatsApp</dt><dd>{registration.officialWhatsapp || '—'}</dd></div>
            <div><dt>Email</dt><dd>{registration.officialEmail || '—'}</dd></div>
            <div>
              <dt>Position</dt>
              <dd>{registration.officialPositions.map((position) => TOURNAMENT_POSITION_LABELS[position] ?? position).join(', ')}</dd>
            </div>
            <div><dt>Declared players</dt><dd>{registration.playerCount}</dd></div>
            <div><dt>Captain</dt><dd>{registration.teamCaptain || '—'}</dd></div>
            <div><dt>Coach</dt><dd>{registration.coachName || '—'}</dd></div>
            <div><dt>Assistant coach</dt><dd>{registration.assistantCoach || '—'}</dd></div>
            <div><dt>Home jersey</dt><dd>{registration.jerseyHome}</dd></div>
            <div><dt>Away jersey</dt><dd>{registration.jerseyAway || '—'}</dd></div>
            <div><dt>Representative</dt><dd>{registration.representativeName}</dd></div>
            <div><dt>Signature</dt><dd>{registration.digitalSignature}</dd></div>
            <div><dt>Fee</dt><dd>{formatNaira(registration.registrationFeeAmount)}</dd></div>
            <div><dt>Payment reference</dt><dd>{registration.paymentReference}</dd></div>
            <div><dt>Submitted</dt><dd>{formatDate(registration.createdAt)}</dd></div>
          </dl>
          {registration.teamLogoUrl && (
            <p><a href={registration.teamLogoUrl} target="_blank" rel="noreferrer">View team logo</a></p>
          )}
          {registration.paymentReceiptUrl && (
            <p><a href={registration.paymentReceiptUrl} target="_blank" rel="noreferrer">View payment receipt</a></p>
          )}
          <h3>Squad ({registration.players.length})</h3>
          {registration.players.length === 0 ? (
            <p className="text-muted">No players added yet.</p>
          ) : (
            <ul>
              {registration.players.map((player) => (
                <li key={player.id}>{player.squadNumber}. {player.fullName}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminTournamentTable({
  registrations: initialRegistrations,
}: {
  registrations: TournamentRegistration[];
}) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [viewRegistration, setViewRegistration] = useState<TournamentRegistration | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const submittedCount = registrations.filter((registration) => registration.status === 'submitted').length;

  async function handleStatusChange(id: string, status: TournamentRegistrationStatus) {
    setBusyId(id);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await patchWithCsrf<{ registration?: TournamentRegistration; error?: string }>(
        `/api/admin/tournament/${id}`,
        { status },
        csrf,
      );
      if (!ok || !data.registration) {
        alert(typeof data.error === 'string' ? data.error : 'Failed to update status');
        return;
      }
      setRegistrations((current) => current.map((item) => (item.id === id ? data.registration! : item)));
      if (viewRegistration?.id === id) setViewRegistration(data.registration);
      router.refresh();
    } catch {
      alert('Failed to update status');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="admin-applications__toolbar">
        <p>
          {registrations.length} registration{registrations.length === 1 ? '' : 's'} · {submittedCount} submitted
        </p>
      </div>
      <div className="admin__table-wrap">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Registration ID</th>
              <th>Team</th>
              <th>Official</th>
              <th>Squad</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin__table-empty">
                  No tournament registrations yet.
                </td>
              </tr>
            ) : (
              registrations.map((registration) => (
                <tr key={registration.id}>
                  <td>{registration.registrationCode}</td>
                  <td>{registration.teamName}</td>
                  <td>{registration.officialFullName}</td>
                  <td>{registration.players.length}/{registration.playerCount}</td>
                  <td>{formatDate(registration.createdAt)}</td>
                  <td>
                    <select
                      className="admin-applications__status-select"
                      value={registration.status}
                      disabled={busyId === registration.id}
                      onChange={(e) => handleStatusChange(registration.id, e.target.value as TournamentRegistrationStatus)}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>{TOURNAMENT_STATUS_LABELS[status]}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => setViewRegistration(registration)}>
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {viewRegistration && (
        <TournamentViewModal registration={viewRegistration} onClose={() => setViewRegistration(null)} />
      )}
    </>
  );
}
