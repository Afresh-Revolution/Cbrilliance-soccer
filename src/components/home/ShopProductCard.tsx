'use client';

import { useState } from 'react';
import type { ShopColorOption, ShopProduct } from '@/types';
import { shopCategoryLabel } from '@/lib/data/shop-shared';
import { useShopCart } from '@/lib/cart/shop-cart';
import MediaImage from '@/components/common/MediaImage';
import Button from '@/components/common/Button';

interface Props {
  product: ShopProduct;
}

function isLightHex(hex: string): boolean {
  const value = hex.replace('#', '');
  if (value.length !== 6) return false;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export default function ShopProductCard({ product }: Props) {
  const { addItem } = useShopCart();
  const [selectedColor, setSelectedColor] = useState<ShopColorOption | null>(
    product.colors[0] ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes[0] ?? null);
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    if (product.colors.length > 0 && !selectedColor) return;
    if (product.sizes.length > 0 && !selectedSize) return;

    addItem({
      productId: product.id,
      productName: product.name,
      category: product.category,
      imageUrl: product.imageUrl,
      color: selectedColor?.name ?? 'Default',
      colorHex: selectedColor?.hex ?? '#000000',
      size: selectedSize ?? 'One size',
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  const canAdd =
    (product.colors.length === 0 || selectedColor) &&
    (product.sizes.length === 0 || selectedSize);

  return (
    <article className="shop-now__card">
      <div className="shop-now__media">
        {product.imageUrl ? (
          <MediaImage
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{ objectFit: 'cover' }}
            fallbackSrc=""
          />
        ) : (
          <div className="shop-now__placeholder" aria-hidden />
        )}
        {selectedColor ? (
          <span
            className="shop-now__color-preview"
            style={{ backgroundColor: selectedColor.hex }}
            title={selectedColor.name}
            aria-hidden
          />
        ) : null}
      </div>

      <div className="shop-now__body">
        <p className="shop-now__category">{shopCategoryLabel(product.category)}</p>
        <h3 className="shop-now__name">{product.name}</h3>
        {product.description ? <p className="shop-now__desc">{product.description}</p> : null}

        {product.colors.length > 0 ? (
          <div className="shop-now__customize">
            <p className="shop-now__customize-label">
              Color
              {selectedColor ? <span> — {selectedColor.name}</span> : null}
            </p>
            <div className="shop-now__swatches" role="listbox" aria-label={`${product.name} colors`}>
              {product.colors.map((color) => {
                const active = selectedColor?.hex === color.hex && selectedColor?.name === color.name;
                return (
                  <button
                    key={`${color.name}-${color.hex}`}
                    type="button"
                    role="option"
                    aria-selected={active}
                    aria-label={color.name}
                    title={color.name}
                    className={`shop-now__swatch${active ? ' shop-now__swatch--active' : ''}${
                      isLightHex(color.hex) ? ' shop-now__swatch--light' : ''
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => setSelectedColor(color)}
                  />
                );
              })}
            </div>
          </div>
        ) : null}

        {product.sizes.length > 0 ? (
          <div className="shop-now__customize">
            <p className="shop-now__customize-label">
              Size
              {selectedSize ? <span> — {selectedSize}</span> : null}
            </p>
            <div className="shop-now__sizes" role="listbox" aria-label={`${product.name} sizes`}>
              {product.sizes.map((size) => {
                const active = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={`shop-now__size${active ? ' shop-now__size--active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="shop-now__actions">
          <Button
            type="button"
            variant="primary"
            size="sm"
            full
            disabled={!canAdd}
            onClick={handleAddToCart}
          >
            {added ? 'Added to cart' : 'Add to cart'}
          </Button>
        </div>
      </div>
    </article>
  );
}
