import Link from 'next/link';
import { headers } from 'next/headers';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default async function NotFound() {
  const pathname = (await headers()).get('x-pathname') ?? '';
  if (pathname.startsWith('/admin')) {
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

  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">
        <section className="section">
          <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
            <h1>Page not found</h1>
            <p style={{ margin: '1rem 0 2rem', opacity: 0.75 }}>
              The page you are looking for does not exist or has been moved.
            </p>
            <Link href="/" className="btn btn--primary">
              Back to Home
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
