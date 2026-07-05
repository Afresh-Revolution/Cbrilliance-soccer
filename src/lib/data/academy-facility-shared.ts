import type { AcademyFacility } from '@/types';
import type { z } from 'zod';
import type { adminAcademyFacilitySchema } from '@/lib/validators/schemas';

export type AdminAcademyFacilityInput = z.infer<typeof adminAcademyFacilitySchema>;
export type AcademyFacilityRecord = AcademyFacility;

export function academyFacilityToFormValues(item: AcademyFacilityRecord): AdminAcademyFacilityInput {
  return {
    name: item.name,
    imageUrl: item.imageUrl,
    sortOrder: item.sortOrder ?? 0,
  };
}
