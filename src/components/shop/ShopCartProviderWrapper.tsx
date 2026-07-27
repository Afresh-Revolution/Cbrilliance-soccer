'use client';

import { ShopCartProvider } from '@/lib/cart/shop-cart';

export default function ShopCartProviderWrapper({ children }: { children: React.ReactNode }) {
  return <ShopCartProvider>{children}</ShopCartProvider>;
}
