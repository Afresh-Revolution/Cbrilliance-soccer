'use client';

import { useState } from 'react';
import type { ShopCategory, ShopProduct } from '@/types';
import { SHOP_CATEGORIES } from '@/lib/data/shop-shared';
import FadeIn from '@/components/common/FadeIn';
import ShopProductCard from '@/components/home/ShopProductCard';

interface Props {
  products: ShopProduct[];
}

export default function ShopNowSection({ products }: Props) {
  const [activeCategory, setActiveCategory] = useState<ShopCategory | 'all'>('all');

  const filtered =
    activeCategory === 'all'
      ? products
      : products.filter((item) => item.category === activeCategory);

  return (
    <section className="section section--surface shop-now" id="shop">
      <div className="container">
        <div className="section__header">
          <p className="label">Official Kit</p>
          <h2>Shop Now</h2>
          <p>
            Pick your colour and size for jerseys, shorts, socks, and boots from the CBFC collection.
          </p>
        </div>

        <div className="shop-now__filters" role="tablist" aria-label="Shop categories">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'all'}
            className={`shop-now__filter${activeCategory === 'all' ? ' shop-now__filter--active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {SHOP_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.value}
              className={`shop-now__filter${activeCategory === cat.value ? ' shop-now__filter--active' : ''}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="shop-now__empty">
            Shop items will appear here once added in the admin Shop panel.
          </p>
        ) : filtered.length === 0 ? (
          <p className="shop-now__empty">No items in this category yet.</p>
        ) : (
          <div className="shop-now__grid">
            {filtered.map((item, i) => (
              <FadeIn key={item.id} index={i}>
                <ShopProductCard product={item} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
