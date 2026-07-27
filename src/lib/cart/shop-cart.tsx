'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ShopCartItem } from '@/types';

const STORAGE_KEY = 'cbfc-shop-cart';

interface ShopCartContextValue {
  items: ShopCartItem[];
  itemCount: number;
  addItem: (item: Omit<ShopCartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

export function cartItemKey(item: Pick<ShopCartItem, 'productId' | 'color' | 'size'>): string {
  return `${item.productId}:${item.color}:${item.size}`;
}

function readStoredCart(): ShopCartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ShopCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredCart(items: ShopCartItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function ShopCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShopCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStoredCart(items);
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<ShopCartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const key = cartItemKey(item);
      const index = prev.findIndex((entry) => cartItemKey(entry) === key);
      if (index === -1) {
        return [...prev, { ...item, quantity }];
      }
      const next = [...prev];
      next[index] = {
        ...next[index],
        quantity: Math.min(20, next[index].quantity + quantity),
      };
      return next;
    });
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((entry) => cartItemKey(entry) !== key);
      }
      return prev.map((entry) =>
        cartItemKey(entry) === key ? { ...entry, quantity: Math.min(20, quantity) } : entry,
      );
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((entry) => cartItemKey(entry) !== key));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, itemCount, addItem, updateQuantity, removeItem, clearCart }),
    [items, itemCount, addItem, updateQuantity, removeItem, clearCart],
  );

  return <ShopCartContext.Provider value={value}>{children}</ShopCartContext.Provider>;
}

export function useShopCart(): ShopCartContextValue {
  const context = useContext(ShopCartContext);
  if (!context) {
    throw new Error('useShopCart must be used within ShopCartProvider');
  }
  return context;
}
