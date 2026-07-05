import type { AcademyFacilitiesSection, AcademyFacility, AcademyFacilitySettings } from '@/types';
import type { AdminAcademyFacilityInput } from './academy-facility-shared';
import { isSupabaseApiConfigured } from '@/lib/db/env';
import { canonicalMediaStorageUrl } from './cbfc-media';
import { seedAcademyFacilities, seedAcademyFacilitiesSection } from './seed';

export type { AdminAcademyFacilityInput, AcademyFacilityRecord } from './academy-facility-shared';
export { academyFacilityToFormValues } from './academy-facility-shared';

function mapDbFacility(row: Record<string, unknown>): AcademyFacility {
  return {
    id: row.id as string,
    name: row.name as string,
    imageUrl: (row.image_url as string) || '',
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

function toDbRow(input: AdminAcademyFacilityInput) {
  return {
    name: input.name.trim(),
    image_url: canonicalMediaStorageUrl(input.imageUrl),
    sort_order: input.sortOrder ?? 0,
  };
}

async function getServiceSupabase() {
  const { createServiceClient } = await import('@/lib/db/supabase/server');
  return createServiceClient();
}

/** Insert default facilities when the table is empty so admin edit/delete uses real UUIDs. */
async function ensureAcademyFacilitiesSeeded(): Promise<AcademyFacility[] | null> {
  const supabase = await getServiceSupabase();
  const { count, error: countError } = await supabase
    .from('academy_facilities')
    .select('*', { count: 'exact', head: true });

  if (countError) return null;
  if (count && count > 0) return null;

  const rows = seedAcademyFacilities.map((facility) => ({
    id: facility.id,
    name: facility.name,
    image_url: canonicalMediaStorageUrl(facility.imageUrl),
    sort_order: facility.sortOrder,
  }));

  const { data, error } = await supabase.from('academy_facilities').insert(rows).select('*');
  if (error || !data?.length) return null;
  return data.map(mapDbFacility);
}

export async function getAcademyFacilitiesSection(): Promise<AcademyFacilitiesSection> {
  if (!isSupabaseApiConfigured()) {
    return seedAcademyFacilitiesSection;
  }

  const supabase = await getServiceSupabase();
  let [{ data: settings }, { data: facilities }] = await Promise.all([
    supabase.from('academy_facility_settings').select('section_label, section_heading').eq('id', 1).maybeSingle(),
    supabase.from('academy_facilities').select('*').order('sort_order', { ascending: true }),
  ]);

  if (!facilities?.length) {
    const seeded = await ensureAcademyFacilitiesSeeded();
    if (seeded?.length) {
      facilities = seeded.map((f) => ({
        id: f.id,
        name: f.name,
        image_url: f.imageUrl,
        sort_order: f.sortOrder,
      }));
    }
  }

  if (!facilities?.length) {
    return {
      sectionLabel: settings?.section_label ?? seedAcademyFacilitiesSection.sectionLabel,
      sectionHeading: settings?.section_heading ?? seedAcademyFacilitiesSection.sectionHeading,
      facilities: seedAcademyFacilities,
    };
  }

  return {
    sectionLabel: settings?.section_label ?? seedAcademyFacilitiesSection.sectionLabel,
    sectionHeading: settings?.section_heading ?? seedAcademyFacilitiesSection.sectionHeading,
    facilities: facilities.map(mapDbFacility),
  };
}

export async function getAcademyFacilitySettings(): Promise<AcademyFacilitySettings> {
  const section = await getAcademyFacilitiesSection();
  return {
    sectionLabel: section.sectionLabel,
    sectionHeading: section.sectionHeading,
  };
}

export async function getAllAcademyFacilities(): Promise<AcademyFacility[]> {
  const section = await getAcademyFacilitiesSection();
  return section.facilities;
}

export async function getAcademyFacilityById(id: string): Promise<AcademyFacility | null> {
  if (!isSupabaseApiConfigured()) {
    return seedAcademyFacilities.find((f) => f.id === id) ?? null;
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('academy_facilities').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapDbFacility(data);
}

export async function updateAcademyFacilitySettings(input: AcademyFacilitySettings): Promise<AcademyFacilitySettings> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('academy_facility_settings')
    .update({
      section_label: input.sectionLabel.trim(),
      section_heading: input.sectionHeading.trim(),
    })
    .eq('id', 1)
    .select('section_label, section_heading')
    .single();

  if (error) throw new Error(error.message);

  return {
    sectionLabel: data.section_label as string,
    sectionHeading: data.section_heading as string,
  };
}

export async function createAcademyFacility(input: AdminAcademyFacilityInput): Promise<AcademyFacility> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  let sortOrder = input.sortOrder ?? 0;

  if (input.sortOrder === undefined) {
    const { data: maxRow } = await supabase
      .from('academy_facilities')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = ((maxRow?.sort_order as number) ?? -1) + 1;
  }

  const row = toDbRow({ ...input, sortOrder });
  const { data, error } = await supabase.from('academy_facilities').insert(row).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbFacility(data);
}

export async function updateAcademyFacility(id: string, input: Partial<AdminAcademyFacilityInput>): Promise<AcademyFacility> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.imageUrl !== undefined) patch.image_url = canonicalMediaStorageUrl(input.imageUrl);
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('academy_facilities').update(patch).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbFacility(data);
}

export async function deleteAcademyFacility(id: string): Promise<void> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { error } = await supabase.from('academy_facilities').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
