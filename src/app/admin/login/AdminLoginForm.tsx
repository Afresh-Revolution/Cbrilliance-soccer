'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/common/Button';
import PasswordInput from '@/components/common/PasswordInput';
import { CBFC_MEDIA } from '@/lib/data/cbfc-media';
import { fetchCsrfToken, postWithCsrf } from '@/lib/auth/csrf-client';

export default function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [csrfToken, setCsrfToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCsrfToken()
      .then(setCsrfToken)
      .catch(() => setError('Unable to initialize secure login. Refresh and try again.'));
  }, []);

  useEffect(() => {
    if (searchParams.get('error') === 'access_denied') {
      setError('You do not have admin access.');
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const freshToken = await fetchCsrfToken();
      setCsrfToken(freshToken);

      const { ok, data, status } = await postWithCsrf<{ error?: string; code?: string }>(
        '/api/auth/login',
        { email: email.trim().toLowerCase(), password },
        freshToken,
      );

      if (!ok) {
        if (data.code === 'csrf_invalid') {
          setError('Session expired. Refresh the page and try again.');
        } else {
          setError(data.error || `Login failed (${status})`);
        }
        setLoading(false);
        return;
      }

      window.location.href = '/admin';
    } catch {
      setError('Unable to reach the login service. Check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <div className="admin-login page-wrapper">
      <div className="admin-login__glow admin-login__glow--blue" aria-hidden />
      <div className="admin-login__glow admin-login__glow--gold" aria-hidden />
      <div className="admin-login__shield" aria-hidden />

      <div className="admin-login__inner">
        <div className="admin-login__brand">
          {CBFC_MEDIA.logo ? (
            <Image
              src={CBFC_MEDIA.logo}
              alt="CBFC"
              width={72}
              height={72}
              className="admin-login__logo-img"
              priority
            />
          ) : (
            <span className="admin-login__logo">CBFC</span>
          )}
          <span className="admin-login__label">Secure Access</span>
          <h1 className="admin-login__title">Admin Portal</h1>
          <p className="admin-login__subtitle">
            Sign in to manage players, content, and club operations.
          </p>
        </div>

        <form className="admin-login__card form" onSubmit={handleLogin}>
          {error && <div className="admin-login__error">{error}</div>}
          <div className="form__group">
            <label className="form__label" htmlFor="email">Email</label>
            <input
              className="form__input"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              placeholder="admin@cbfc.com"
            />
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </div>
          <Button type="submit" full disabled={loading || !csrfToken}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="admin-login__footer">
          <Link href="/">← Back to CBFC website</Link>
        </p>
      </div>
    </div>
  );
}
