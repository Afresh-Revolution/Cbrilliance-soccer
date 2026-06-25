'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/common/Button';
import { fetchCsrfToken, postWithCsrf } from '@/lib/auth/csrf-client';

interface Props {
  currentEmail: string;
}

export default function AdminSettingsForm({ currentEmail }: Props) {
  const [csrfToken, setCsrfToken] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState(currentEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCsrfToken().then(setCsrfToken).catch(() => setError('Failed to load security token.'));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!csrfToken) return;

    setError('');
    setMessage('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);

    const payload: {
      currentPassword: string;
      newEmail?: string;
      newPassword?: string;
    } = { currentPassword };

    if (newEmail !== currentEmail) payload.newEmail = newEmail;
    if (newPassword) payload.newPassword = newPassword;

    const { ok, data } = await postWithCsrf<{ error?: string | { formErrors?: string[] } }>(
      '/api/admin/settings/credentials',
      payload,
      csrfToken,
    );

    if (!ok) {
      const errMsg = typeof data.error === 'string'
        ? data.error
        : 'Failed to update credentials';
      setError(errMsg);
      setLoading(false);
      return;
    }

    setMessage('Login details updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
  }

  return (
    <form className="form inquiry-form" onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
      <h2 className="mb-md">Login Credentials</h2>
      <p className="text-muted mb-lg" style={{ fontSize: '0.9rem' }}>
        Update the admin email and password. You must enter your current password to confirm changes.
      </p>

      {error && <div className="form__error">{error}</div>}
      {message && <div className="form__success" style={{ marginBottom: '1rem', color: '#2E8B57' }}>{message}</div>}

      <div className="form__group">
        <label className="form__label" htmlFor="currentPassword">Current password</label>
        <input
          className="form__input"
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="newEmail">Admin email</label>
        <input
          className="form__input"
          id="newEmail"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="newPassword">New password (optional)</label>
        <input
          className="form__input"
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      <div className="form__group">
        <label className="form__label" htmlFor="confirmPassword">Confirm new password</label>
        <input
          className="form__input"
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" disabled={loading || !csrfToken}>
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
