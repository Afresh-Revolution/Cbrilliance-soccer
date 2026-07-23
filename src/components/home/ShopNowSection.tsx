'use client';

import { useState } from 'react';
import type { ShopCategory, ShopProduct } from '@/types';
import { SHOP_CATEGORIES, shopCategoryLabel } from '@/lib/data/shop-shared';
import MediaImage from '@/components/common/MediaImage';
import FadeIn from '@/components/common/FadeIn';

interface Props {
  products: ShopProduct[];
}

export default function ShopNowSection({ products }: Props) {
  const [activeCategory, setActiveCategory] = useState<ShopCategory | 'all'>('all');

  if (products.length === 0) {
    return null;
  }

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
            Jerseys, shorts, socks, and boots from the CBFC collection — gear up in club colours.
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

        {filtered.length === 0 ? (
          <p className="shop-now__empty">No items in this category yet.</p>
        ) : (
          <div className="shop-now__grid">
            {filtered.map((item, i) => (
              <FadeIn key={item.id} index={i}>
                <article className="shop-now__card">
                  <div className="shop-now__media">
                    {item.imageUrl ? (
                      <MediaImage
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        style={{ objectFit: 'cover' }}
                        fallbackSrc=""
                      />
                    ) : (
                      <div className="shop-now__placeholder" aria-hidden />
                    )}
                  </div>
                  <div className="shop-now__body">
                    <p className="shop-now__category">{shopCategoryLabel(item.category)}</p>
                    <h3 className="shop-now__name">{item.name}</h3>
                    {item.description ? (
                      <p className="shop-now__desc">{item.description}</p>
                    ) : null}
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
