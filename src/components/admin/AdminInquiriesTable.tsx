'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminInquiryDetail, InquiryStatus } from '@/types';
import { INQUIRY_STATUS_LABELS } from '@/lib/constants/navigation';
import { fetchCsrfToken, patchWithCsrf, deleteWithCsrf } from '@/lib/auth/csrf-client';

const STATUS_OPTIONS: InquiryStatus[] = ['new', 'pending', 'contacted', 'closed'];

function formatInquiryDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function InquiryViewModal({
  inquiry,
  onClose,
}: {
  inquiry: AdminInquiryDetail;
  onClose: () => void;
}) {
  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <div className="admin-modal__backdrop" onClick={onClose} aria-hidden />
      <div className="admin-modal__panel">
        <div className="admin-modal__head">
          <h2>{inquiry.name}</h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="admin-modal__body">
          <dl className="admin-modal__details">
            <div><dt>Organisation</dt><dd>{inquiry.organisation}</dd></div>
            <div><dt>Type</dt><dd>{inquiry.typeLabel}</dd></div>
            <div><dt>Status</dt><dd>{INQUIRY_STATUS_LABELS[inquiry.status] ?? inquiry.status}</dd></div>
            <div><dt>Email</dt><dd>{inquiry.email}</dd></div>
            <div><dt>Phone</dt><dd>{inquiry.phone || '—'}</dd></div>
            <div><dt>Submitted</dt><dd>{formatInquiryDate(inquiry.createdAt)}</dd></div>
          </dl>
          {inquiry.message && <p className="admin-modal__bio">{inquiry.message}</p>}
        </div>
        <div className="admin-modal__actions">
          <a href={`mailto:${inquiry.email}`} className="btn btn--outline btn--sm">
            Reply by email
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminInquiriesTable({
  inquiries: initialInquiries,
}: {
  inquiries: AdminInquiryDetail[];
}) {
  const router = useRouter();
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [viewInquiry, setViewInquiry] = useState<AdminInquiryDetail | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const activeCount = inquiries.filter((i) => i.status !== 'closed').length;

  function rowKey(inquiry: AdminInquiryDetail) {
    return `${inquiry.source}-${inquiry.id}`;
  }

  async function handleStatusChange(inquiry: AdminInquiryDetail, status: InquiryStatus) {
    const key = rowKey(inquiry);
    setBusyKey(key);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await patchWithCsrf<{ inquiry?: AdminInquiryDetail; error?: string }>(
        `/api/admin/inquiries/${inquiry.source}/${inquiry.id}`,
        { status },
        csrf,
      );
      if (!ok || !data.inquiry) {
        alert(typeof data.error === 'string' ? data.error : 'Failed to update status');
        return;
      }
      setInquiries((prev) =>
        prev.map((i) => (rowKey(i) === key ? data.inquiry! : i)),
      );
      if (viewInquiry && rowKey(viewInquiry) === key) {
        setViewInquiry(data.inquiry);
      }
      router.refresh();
    } catch {
      alert('Failed to update status');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDelete(inquiry: AdminInquiryDetail) {
    if (!confirm(`Delete inquiry from ${inquiry.name}? This cannot be undone.`)) return;

    const key = rowKey(inquiry);
    setBusyKey(key);
    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await deleteWithCsrf<{ error?: string }>(
        `/api/admin/inquiries/${inquiry.source}/${inquiry.id}`,
        csrf,
      );
      if (!ok) {
        alert(typeof data.error === 'string' ? data.error : 'Failed to delete inquiry');
        return;
      }
      setInquiries((prev) => prev.filter((i) => rowKey(i) !== key));
      if (viewInquiry && rowKey(viewInquiry) === key) {
        setViewInquiry(null);
      }
      router.refresh();
    } catch {
      alert('Failed to delete inquiry');
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <>
      <div className="admin-inquiries__toolbar">
        <p>
          {inquiries.length} inquir{inquiries.length === 1 ? 'y' : 'ies'} · {activeCount} active
        </p>
      </div>

      <div className="admin__table-wrap">
        <table className="admin__table admin-inquiries__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Organisation</th>
              <th>Type</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin__table-empty">
                  No inquiries yet. Submissions from the contact and scout forms will appear here.
                </td>
              </tr>
            ) : (
              inquiries.map((inquiry) => {
                const key = rowKey(inquiry);
                return (
                  <tr key={key}>
                    <td className="admin-inquiries__name">{inquiry.name}</td>
                    <td>{inquiry.organisation}</td>
                    <td><span className="admin-inquiries__type">{inquiry.typeLabel}</span></td>
                    <td>{formatInquiryDate(inquiry.createdAt)}</td>
                    <td>
                      <select
                        className="admin-inquiries__status-select"
                        value={inquiry.status}
                        disabled={busyKey === key}
                        onChange={(e) =>
                          handleStatusChange(inquiry, e.target.value as InquiryStatus)
                        }
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {INQUIRY_STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="admin-inquiries__actions">
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => setViewInquiry(inquiry)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="btn btn--outline btn--sm admin-inquiries__delete"
                          disabled={busyKey === key}
                          onClick={() => handleDelete(inquiry)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {viewInquiry && (
        <InquiryViewModal inquiry={viewInquiry} onClose={() => setViewInquiry(null)} />
      )}
    </>
  );
}
