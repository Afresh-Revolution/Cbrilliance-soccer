import type { GalleryItem } from '@/types';
import { isSupabaseApiConfigured } from '@/lib/db/env';
import type { z } from 'zod';
import type { adminGallerySchema } from '@/lib/validators/schemas';
import { seedGallery } from './seed';

export type AdminGalleryInput = z.infer<typeof adminGallerySchema>;
export type GalleryRecord = GalleryItem & { sortOrder?: number };

function mapDbGallery(row: Record<string, unknown>): GalleryRecord {
  return {
    id: row.id as string,
    title: (row.title as string) || '',
    imageUrl: row.image_url as string,
    category: (row.category as string) || '',
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

function toDbRow(input: AdminGalleryInput) {
  return {
    title: input.title.trim(),
    image_url: input.imageUrl.trim(),
    category: input.category?.trim() || null,
    sort_order: input.sortOrder ?? 0,
  };
}

async function getServiceSupabase() {
  const { createServiceClient } = await import('@/lib/db/supabase/server');
  return createServiceClient();
}

export async function getAllGallery(): Promise<GalleryRecord[]> {
  if (!isSupabaseApiConfigured()) {
    return seedGallery.map((item, index) => ({ ...item, sortOrder: index }));
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data) {
    return seedGallery.map((item, index) => ({ ...item, sortOrder: index }));
  }

  return data.map(mapDbGallery);
}

export async function getGalleryById(id: string): Promise<GalleryRecord | null> {
  if (!isSupabaseApiConfigured()) {
    return seedGallery.find((item) => item.id === id) ? { ...seedGallery.find((item) => item.id === id)!, sortOrder: 0 } : null;
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('gallery_items').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapDbGallery(data);
}

export async function createGallery(input: AdminGalleryInput): Promise<GalleryRecord> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  let sortOrder = input.sortOrder ?? 0;

  if (input.sortOrder === undefined) {
    const { data: maxRow } = await supabase
      .from('gallery_items')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = ((maxRow?.sort_order as number) ?? -1) + 1;
  }

  const row = toDbRow({ ...input, sortOrder });
  const { data, error } = await supabase.from('gallery_items').insert(row).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbGallery(data);
}

export async function updateGallery(id: string, input: Partial<AdminGalleryInput>): Promise<GalleryRecord> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.imageUrl !== undefined) patch.image_url = input.imageUrl.trim();
  if (input.category !== undefined) patch.category = input.category.trim() || null;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('gallery_items').update(patch).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbGallery(data);
}

export async function deleteGallery(id: string): Promise<void> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { error } = await supabase.from('gallery_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function galleryToFormValues(item: GalleryRecord): AdminGalleryInput {
  return {
    title: item.title,
    imageUrl: item.imageUrl,
    category: item.category ?? '',
    sortOrder: item.sortOrder ?? 0,
  };
}
