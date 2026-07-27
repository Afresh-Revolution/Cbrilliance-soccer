import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ShopCartProviderWrapper from '@/components/shop/ShopCartProviderWrapper';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopCartProviderWrapper>
      <div className="page-wrapper">
        <Header />
        <main className="main-content">{children}</main>
        <Footer />
      </div>
    </ShopCartProviderWrapper>
  );
}
