import type { ShopColorOption, ShopProduct } from '@/types';
import type { z } from 'zod';
import type { adminShopProductSchema } from '@/lib/validators/schemas';

export type AdminShopProductInput = z.infer<typeof adminShopProductSchema>;
export type ShopProductRecord = ShopProduct;

export const SHOP_CATEGORIES = [
  { value: 'jerseys', label: 'Jerseys' },
  { value: 'shorts', label: 'Shorts' },
  { value: 'socks', label: 'Socks' },
  { value: 'boots', label: 'Boots' },
] as const;

export const DEFAULT_APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export const DEFAULT_BOOT_SIZES = ['38', '39', '40', '41', '42', '43', '44', '45', '46'] as const;

export const DEFAULT_SHOP_COLORS: ShopColorOption[] = [
  { name: 'Navy', hex: '#0A1428' },
  { name: 'Gold', hex: '#C8A75D' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#111111' },
];

export function defaultSizesForCategory(category: string): string[] {
  return category === 'boots' ? [...DEFAULT_BOOT_SIZES] : [...DEFAULT_APPAREL_SIZES];
}

export function shopCategoryLabel(category: string): string {
  return SHOP_CATEGORIES.find((entry) => entry.value === category)?.label ?? category;
}

export function shopProductToFormValues(item: ShopProductRecord): AdminShopProductInput {
  return {
    name: item.name,
    description: item.description ?? '',
    imageUrl: item.imageUrl,
    category: item.category,
    colors: item.colors?.length ? item.colors : [...DEFAULT_SHOP_COLORS],
    sizes: item.sizes?.length ? item.sizes : defaultSizesForCategory(item.category),
    sortOrder: item.sortOrder ?? 0,
  };
}

export function parseShopColors(value: unknown): ShopColorOption[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const row = entry as Record<string, unknown>;
      const name = typeof row.name === 'string' ? row.name.trim() : '';
      const hex = typeof row.hex === 'string' ? row.hex.trim() : '';
      if (!name || !/^#([0-9A-Fa-f]{6})$/.test(hex)) return null;
      return { name, hex };
    })
    .filter((entry): entry is ShopColorOption => Boolean(entry));
}

export function parseShopSizes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean);
}
