import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}
