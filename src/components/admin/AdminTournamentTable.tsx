'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog';
import type { TournamentRegistration, TournamentRegistrationStatus } from '@/types';
import { TOURNAMENT_STATUS_LABELS } from '@/lib/constants/navigation';
import { deleteWithCsrf, fetchCsrfToken, patchWithCsrf, postWithCsrf } from '@/lib/auth/csrf-client';

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

export default function AdminTournamentTable({
  registrations: initialRegistrations,
}: {
  registrations: TournamentRegistration[];
}) {
  const router = useRouter();
  const [registrations, setRegistrations] = useState(initialRegistrations);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resendId, setResendId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TournamentRegistration | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
      router.refresh();
    } catch {
      alert('Failed to update status');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const registration = deleteTarget;
    setBusyId(registration.id);
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
      setRegistrations((current) => current.filter((item) => item.id !== registration.id));
      setDeleteTarget(null);
      setNotice({
        type: 'success',
        text: `${registration.registrationCode} was permanently deleted.`,
      });
      router.refresh();
    } catch {
      setDeleteError('Could not delete this registration.');
    } finally {
      setBusyId(null);
    }
  }

  async function resendEmail(registration: TournamentRegistration) {
    setResendId(registration.id);
    setNotice(null);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await postWithCsrf<{ email?: string; error?: string }>(
        `/api/admin/tournament/${registration.id}/resend`,
        {},
        csrf,
      );
      if (!ok) {
        setNotice({
          type: 'error',
          text: typeof data.error === 'string' ? data.error : 'Could not resend the email.',
        });
        return;
      }
      setNotice({
        type: 'success',
        text: `Registration email sent again to ${data.email || registration.officialEmail}.`,
      });
    } catch {
      setNotice({ type: 'error', text: 'Could not resend the email.' });
    } finally {
      setResendId(null);
    }
  }

  return (
    <>
      <div className="admin-applications__toolbar">
        <p>
          {registrations.length} registration{registrations.length === 1 ? '' : 's'} · {submittedCount} submitted
        </p>
      </div>
      {notice && (
        <div className={notice.type === 'success' ? 'form__success' : 'form__error'}>{notice.text}</div>
      )}
      <div className="admin__table-wrap">
        <table className="admin__table admin-tournament-table">
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
                  <td className="admin-tournament-table__date">{formatDate(registration.createdAt)}</td>
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
                    <div className="admin-tournament-actions">
                      <Button href={`/admin/tournament/${registration.id}`} variant="outline" size="sm">
                        View
                      </Button>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        onClick={() => resendEmail(registration)}
                        disabled={resendId === registration.id || !registration.officialEmail}
                        title={registration.officialEmail ? 'Resend the registration email' : 'No email address on this registration'}
                      >
                        {resendId === registration.id ? 'Sending…' : 'Resend'}
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm admin-tournament-actions__delete"
                        onClick={() => {
                          setDeleteError(null);
                          setDeleteTarget(registration);
                        }}
                        disabled={busyId === registration.id}
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

      {deleteTarget && (
        <AdminConfirmDialog
          title="Delete registration?"
          message={`${deleteTarget.registrationCode} for ${deleteTarget.teamName} will be permanently removed, including every squad player. This cannot be undone.`}
          confirmLabel="Delete registration"
          busy={busyId === deleteTarget.id}
          error={deleteError}
          onCancel={() => {
            if (busyId) return;
            setDeleteTarget(null);
            setDeleteError(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
