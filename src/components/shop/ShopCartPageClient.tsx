'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import MediaImage from '@/components/common/MediaImage';
import { cartItemKey, useShopCart } from '@/lib/cart/shop-cart';
import { postPublicForm } from '@/lib/auth/public-form-client';
import { shopCategoryLabel } from '@/lib/data/shop-shared';

export default function ShopCartPageClient() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart } = useShopCart();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { ok, data } = await postPublicForm<{ error?: string }>('/api/shop/orders', {
        ...form,
        items,
      });

      if (!ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to place order.');
        return;
      }

      clearCart();
      setSuccess(true);
      router.refresh();
    } catch {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="section section--surface shop-cart">
        <div className="container shop-cart__success">
          <h1>Order placed</h1>
          <p>Thank you. Our team will contact you shortly to confirm your order.</p>
          <Button href="/#shop">Continue shopping</Button>
        </div>
      </section>
    );
  }

  return (
    <section className="section section--surface shop-cart">
      <div className="container">
        <div className="section__header">
          <p className="label">Your Bag</p>
          <h1>Cart</h1>
          <p>Review your items and place your order.</p>
        </div>

        {items.length === 0 ? (
          <div className="shop-cart__empty">
            <p>Your cart is empty.</p>
            <Button href="/#shop" variant="outline">Browse Shop</Button>
          </div>
        ) : (
          <div className="shop-cart__layout">
            <div className="shop-cart__items">
              {items.map((item) => {
                const key = cartItemKey(item);
                return (
                  <article key={key} className="shop-cart__item">
                    <div className="shop-cart__thumb">
                      {item.imageUrl ? (
                        <MediaImage
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          sizes="96px"
                          style={{ objectFit: 'cover' }}
                          fallbackSrc=""
                        />
                      ) : null}
                    </div>
                    <div className="shop-cart__details">
                      <p className="shop-cart__category">{shopCategoryLabel(item.category)}</p>
                      <h2>{item.productName}</h2>
                      <p className="shop-cart__meta">
                        Color: {item.color} · Size: {item.size}
                      </p>
                      <div className="shop-cart__qty">
                        <button
                          type="button"
                          onClick={() => updateQuantity(key, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(key, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="shop-cart__remove"
                      onClick={() => removeItem(key)}
                    >
                      Remove
                    </button>
                  </article>
                );
              })}
            </div>

            <form className="shop-cart__checkout form" onSubmit={handleSubmit}>
              <h2>Place order</h2>
              {error && <div className="form__error">{error}</div>}
              <div className="form__group">
                <label className="form__label" htmlFor="orderName">Full name</label>
                <input
                  id="orderName"
                  className="form__input"
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="orderEmail">Email</label>
                <input
                  id="orderEmail"
                  type="email"
                  className="form__input"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="orderPhone">Phone</label>
                <input
                  id="orderPhone"
                  type="tel"
                  className="form__input"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div className="form__group">
                <label className="form__label" htmlFor="orderNotes">Notes (optional)</label>
                <textarea
                  id="orderNotes"
                  className="form__textarea"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Delivery details or special requests"
                />
              </div>
              <Button type="submit" full disabled={loading}>
                {loading ? 'Placing order...' : 'Place order'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
