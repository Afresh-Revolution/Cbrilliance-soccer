import Link from 'next/link';

export default function AdminDashboardNotFound() {
  return (
    <div className="admin__header" style={{ textAlign: 'center', padding: '4rem 0' }}>
      <h1>Page not found</h1>
      <p className="text-muted" style={{ margin: '1rem 0 2rem' }}>
        This admin page does not exist or the resource could not be found.
      </p>
      <Link href="/admin" className="btn btn--primary">
        Back to Dashboard
      </Link>
    </div>
  );
}
