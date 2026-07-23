import type { ShopProduct } from '@/types';
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

export function shopCategoryLabel(category: string): string {
  return SHOP_CATEGORIES.find((entry) => entry.value === category)?.label ?? category;
}

export function shopProductToFormValues(item: ShopProductRecord): AdminShopProductInput {
  return {
    name: item.name,
    description: item.description ?? '',
    imageUrl: item.imageUrl,
    category: item.category,
    sortOrder: item.sortOrder ?? 0,
  };
}
