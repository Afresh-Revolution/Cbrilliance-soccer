import type { ShopOrder, ShopOrderItem, ShopOrderStatus } from '@/types';
import { isSupabaseApiConfigured } from '@/lib/db/env';

function mapDbOrder(row: Record<string, unknown>): ShopOrder {
  return {
    id: row.id as string,
    fullName: (row.full_name as string) || '',
    email: (row.email as string) || '',
    phone: (row.phone as string) || '',
    notes: (row.notes as string) || undefined,
    items: Array.isArray(row.items) ? (row.items as ShopOrderItem[]) : [],
    status: (row.status as ShopOrderStatus) || 'new',
    createdAt: (row.created_at as string) || '',
  };
}

async function getServiceSupabase() {
  const { createServiceClient } = await import('@/lib/db/supabase/server');
  return createServiceClient();
}

export async function getAllShopOrders(): Promise<ShopOrder[]> {
  if (!isSupabaseApiConfigured()) return [];

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('shop_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapDbOrder);
}

export async function updateShopOrderStatus(
  id: string,
  status: ShopOrderStatus,
): Promise<ShopOrder> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('shop_orders')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapDbOrder(data);
}
