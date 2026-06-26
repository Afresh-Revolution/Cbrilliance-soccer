'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AcademyApplication, ApplicationStatus } from '@/types';
import { APPLICATION_STATUS_LABELS, POSITION_LABELS } from '@/lib/constants/navigation';
import { ageGroupFromDateOfBirth } from '@/lib/utils/age-group';
import { fetchCsrfToken, patchWithCsrf } from '@/lib/auth/csrf-client';

const STATUS_OPTIONS: ApplicationStatus[] = ['new', 'reviewed', 'invited', 'rejected'];

function formatApplicationDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function displayPosition(position: string) {
  return POSITION_LABELS[position] ?? position.charAt(0).toUpperCase() + position.slice(1);
}

function ApplicationViewModal({
  application,
  onClose,
}: {
  application: AcademyApplication;
  onClose: () => void;
}) {
  const ageGroup = ageGroupFromDateOfBirth(application.dateOfBirth);

  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <div className="admin-modal__backdrop" onClick={onClose} aria-hidden />
      <div className="admin-modal__panel">
        <div className="admin-modal__head">
          <h2>{application.fullName}</h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="admin-modal__body">
          <dl className="admin-modal__details">
            <div><dt>Position</dt><dd>{displayPosition(application.position)}</dd></div>
            <div><dt>Age group</dt><dd>{ageGroup}</dd></div>
            <div><dt>Date of birth</dt><dd>{application.dateOfBirth}</dd></div>
            <div><dt>Height</dt><dd>{application.height || '—'}</dd></div>
            <div><dt>Preferred foot</dt><dd>{application.preferredFoot}</dd></div>
            <div><dt>Status</dt><dd>{APPLICATION_STATUS_LABELS[application.status] ?? application.status}</dd></div>
            <div><dt>Parent / guardian</dt><dd>{application.parentGuardianName}</dd></div>
            <div><dt>Email</dt><dd>{application.email}</dd></div>
            <div><dt>Phone</dt><dd>{application.phone}</dd></div>
            <div><dt>Previous club</dt><dd>{application.previousClub || '—'}</dd></div>
            <div><dt>Submitted</dt><dd>{formatApplicationDate(application.createdAt)}</dd></div>
          </dl>
        </div>
        <div className="admin-modal__actions">
          <a href={`mailto:${application.email}`} className="btn btn--outline btn--sm">
            Email applicant
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminApplicationsTable({
  applications: initialApplications,
}: {
  applications: AcademyApplication[];
}) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [viewApplication, setViewApplication] = useState<AcademyApplication | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const newCount = applications.filter((a) => a.status === 'new').length;

  async function handleStatusChange(applicationId: string, status: ApplicationStatus) {
    setBusyId(applicationId);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await patchWithCsrf<{ application?: AcademyApplication; error?: string }>(
        `/api/admin/applications/${applicationId}`,
        { status },
        csrf,
      );
      if (!ok || !data.application) {
        alert(typeof data.error === 'string' ? data.error : 'Failed to update status');
        return;
      }
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? data.application! : a)),
      );
      if (viewApplication?.id === applicationId) {
        setViewApplication(data.application);
      }
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
          {applications.length} application{applications.length === 1 ? '' : 's'} · {newCount} new
        </p>
      </div>

      <div className="admin__table-wrap">
        <table className="admin__table admin-applications__table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Position</th>
              <th>Age Group</th>
              <th>Parent/Guardian</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin__table-empty">
                  No applications yet. Submissions from the academy form will appear here.
                </td>
              </tr>
            ) : (
              applications.map((application) => (
                <tr key={application.id}>
                  <td className="admin-applications__applicant">{application.fullName}</td>
                  <td>
                    <span className="admin-applications__position">
                      {displayPosition(application.position)}
                    </span>
                  </td>
                  <td>{ageGroupFromDateOfBirth(application.dateOfBirth)}</td>
                  <td>{application.parentGuardianName}</td>
                  <td>{formatApplicationDate(application.createdAt)}</td>
                  <td>
                    <select
                      className="admin-applications__status-select"
                      value={application.status}
                      disabled={busyId === application.id}
                      onChange={(e) =>
                        handleStatusChange(application.id, e.target.value as ApplicationStatus)
                      }
                    >
                      {(STATUS_OPTIONS.includes(application.status)
                        ? STATUS_OPTIONS
                        : [...STATUS_OPTIONS, application.status]
                      ).map((status) => (
                        <option key={status} value={status}>
                          {APPLICATION_STATUS_LABELS[status] ?? status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn--outline btn--sm"
                      onClick={() => setViewApplication(application)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewApplication && (
        <ApplicationViewModal
          application={viewApplication}
          onClose={() => setViewApplication(null)}
        />
      )}
    </>
  );
}
