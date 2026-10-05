'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TournamentBankDetails } from '@/types';
import { fetchCsrfToken, patchWithCsrf } from '@/lib/auth/csrf-client';

export default function AdminTournamentBankForm({
  initialDetails,
}: {
  initialDetails: TournamentBankDetails;
}) {
  const router = useRouter();
  const [details, setDetails] = useState(initialDetails);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function update(field: keyof TournamentBankDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setSaved(false);

    try {
      const csrf = await fetchCsrfToken();
      const { ok, data } = await patchWithCsrf<{ bankDetails?: TournamentBankDetails; error?: string }>(
        '/api/admin/tournament/bank-details',
        details,
        csrf,
      );
      if (!ok || !data.bankDetails) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to save bank details');
        return;
      }
      setDetails(data.bankDetails);
      setSaved(true);
      router.refresh();
    } catch {
      setError('Failed to save bank details');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-dash__panel" style={{ marginBottom: '2rem' }}>
      <h2 className="admin-dash__panel-title">Bank details</h2>
      <p className="text-muted" style={{ marginBottom: '1rem' }}>
        These account details appear on the public tournament registration form so teams know where to pay.
      </p>
      <form className="admin-player-form" onSubmit={handleSubmit}>
        {error && <div className="admin-player-form__error">{error}</div>}
        {saved && <div className="form__success">Bank details saved.</div>}
        <div className="admin-player-form__grid">
          <div className="form__group">
            <label className="form__label" htmlFor="bankName">Bank name</label>
            <input
              id="bankName"
              className="form__input"
              value={details.bankName}
              onChange={(e) => update('bankName', e.target.value)}
              placeholder="e.g. Access Bank"
              required
            />
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="accountName">Account name</label>
            <input
              id="accountName"
              className="form__input"
              value={details.accountName}
              onChange={(e) => update('accountName', e.target.value)}
              placeholder="e.g. CBrilliance Football Agency"
              required
            />
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="accountNumber">Account number</label>
            <input
              id="accountNumber"
              className="form__input"
              value={details.accountNumber}
              onChange={(e) => update('accountNumber', e.target.value)}
              placeholder="e.g. 0123456789"
              inputMode="numeric"
              required
            />
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="paymentNote">Payment note</label>
            <input
              id="paymentNote"
              className="form__input"
              value={details.paymentNote}
              onChange={(e) => update('paymentNote', e.target.value)}
              placeholder="Optional instructions, such as the transfer narration"
            />
          </div>
        </div>
        <div className="admin-player-form__actions">
          <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
            {busy ? 'Saving…' : 'Save bank details'}
          </button>
        </div>
      </form>
    </section>
  );
}
