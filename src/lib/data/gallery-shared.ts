import type { GalleryItem } from '@/types';
import type { z } from 'zod';
import type { adminGallerySchema } from '@/lib/validators/schemas';

export type AdminGalleryInput = z.infer<typeof adminGallerySchema>;
export type GalleryRecord = GalleryItem & { sortOrder?: number };

export function galleryToFormValues(item: GalleryRecord): AdminGalleryInput {
  return {
    title: item.title,
    imageUrl: item.imageUrl,
    category: item.category ?? '',
    sortOrder: item.sortOrder ?? 0,
  };
}
