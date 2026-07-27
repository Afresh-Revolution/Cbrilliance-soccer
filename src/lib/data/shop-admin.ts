import type { ShopCategory, ShopProduct } from '@/types';
import type { AdminShopProductInput } from './shop-shared';
import {
  DEFAULT_SHOP_COLORS,
  defaultSizesForCategory,
  parseShopColors,
  parseShopSizes,
} from './shop-shared';
import { isSupabaseApiConfigured } from '@/lib/db/env';
import { canonicalMediaStorageUrl } from './cbfc-media';

export type { AdminShopProductInput, ShopProductRecord } from './shop-shared';
export {
  shopProductToFormValues,
  SHOP_CATEGORIES,
  shopCategoryLabel,
  DEFAULT_SHOP_COLORS,
  DEFAULT_APPAREL_SIZES,
  DEFAULT_BOOT_SIZES,
  defaultSizesForCategory,
} from './shop-shared';

function mapDbProduct(row: Record<string, unknown>): ShopProduct {
  const category = (row.category as ShopCategory) || 'jerseys';
  const colors = parseShopColors(row.colors);
  const sizes = parseShopSizes(row.sizes);

  return {
    id: row.id as string,
    name: (row.name as string) || '',
    description: (row.description as string) || undefined,
    imageUrl: (row.image_url as string) || '',
    category,
    colors: colors.length ? colors : [...DEFAULT_SHOP_COLORS],
    sizes: sizes.length ? sizes : defaultSizesForCategory(category),
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

function toDbRow(input: AdminShopProductInput) {
  const colors = (input.colors ?? []).map((color) => ({
    name: color.name.trim(),
    hex: color.hex.trim().toUpperCase(),
  }));
  const sizes = (input.sizes ?? [])
    .map((size) => size.trim())
    .filter(Boolean);

  return {
    name: input.name.trim(),
    description: input.description?.trim() || null,
    image_url: canonicalMediaStorageUrl(input.imageUrl),
    category: input.category,
    colors,
    sizes,
    sort_order: input.sortOrder ?? 0,
  };
}

async function getServiceSupabase() {
  const { createServiceClient } = await import('@/lib/db/supabase/server');
  return createServiceClient();
}

export async function getShopProducts(): Promise<ShopProduct[]> {
  if (!isSupabaseApiConfigured()) return [];

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('shop_products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data) return [];
  return data.map(mapDbProduct);
}

export async function getAllShopProducts(): Promise<ShopProduct[]> {
  return getShopProducts();
}

export async function getShopProductById(id: string): Promise<ShopProduct | null> {
  if (!isSupabaseApiConfigured()) return null;

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('shop_products').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapDbProduct(data);
}

export async function createShopProduct(input: AdminShopProductInput): Promise<ShopProduct> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  let sortOrder = input.sortOrder ?? 0;

  if (input.sortOrder === undefined) {
    const { data: maxRow } = await supabase
      .from('shop_products')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = ((maxRow?.sort_order as number) ?? -1) + 1;
  }

  const row = toDbRow({ ...input, sortOrder });
  const { data, error } = await supabase.from('shop_products').insert(row).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbProduct(data);
}

export async function updateShopProduct(
  id: string,
  input: Partial<AdminShopProductInput>,
): Promise<ShopProduct> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.description !== undefined) patch.description = input.description.trim() || null;
  if (input.imageUrl !== undefined) patch.image_url = canonicalMediaStorageUrl(input.imageUrl);
  if (input.category !== undefined) patch.category = input.category;
  if (input.colors !== undefined) {
    patch.colors = input.colors.map((color) => ({
      name: color.name.trim(),
      hex: color.hex.trim().toUpperCase(),
    }));
  }
  if (input.sizes !== undefined) {
    patch.sizes = input.sizes.map((size) => size.trim()).filter(Boolean);
  }
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('shop_products')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapDbProduct(data);
}

export async function deleteShopProduct(id: string): Promise<void> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { error } = await supabase.from('shop_products').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
