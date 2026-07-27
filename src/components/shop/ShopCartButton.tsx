'use client';

import Link from 'next/link';
import { useShopCart } from '@/lib/cart/shop-cart';

export default function ShopCartButton() {
  const { itemCount } = useShopCart();

  return (
    <Link href="/shop/cart" className="header__cart" aria-label={`Cart (${itemCount} items)`}>
      <span className="header__cart-icon" aria-hidden>
        🛒
      </span>
      {itemCount > 0 ? <span className="header__cart-badge">{itemCount}</span> : null}
    </Link>
  );
}
