import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="admin-login" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>Page not found</h1>
        <p className="text-muted" style={{ margin: '1rem 0 2rem' }}>
          This admin page does not exist.
        </p>
        <Link href="/admin/login" className="btn btn--primary">
          Admin Login
        </Link>
      </div>
    </div>
  );
}
