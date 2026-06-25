import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
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
