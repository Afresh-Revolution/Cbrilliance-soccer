'use client';

import { useState } from 'react';
import { fetchCsrfToken, postWithCsrf } from '@/lib/auth/csrf-client';

export default function AdminLogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const csrfToken = await fetchCsrfToken();
      await postWithCsrf('/api/auth/logout', {}, csrfToken);
      window.location.href = '/admin/login';
    } catch {
      setLoading(false);
    }
  }

  return (
    <button type="button" className="admin__nav-link" onClick={handleLogout} disabled={loading}>
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
