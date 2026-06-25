import { Suspense } from 'react';
import AdminLoginForm from './AdminLoginForm';

function AdminLoginFallback() {
  return (
    <div className="admin-login page-wrapper">
      <div className="admin-login__glow admin-login__glow--blue" aria-hidden />
      <div className="admin-login__glow admin-login__glow--gold" aria-hidden />
      <div className="admin-login__shield" aria-hidden />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  );
}
