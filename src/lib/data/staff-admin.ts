import type { ClubStaff } from '@/types';
import { isSupabaseApiConfigured } from '@/lib/db/env';
import type { z } from 'zod';
import type { adminStaffSchema } from '@/lib/validators/schemas';
import { seedClubStaff } from './seed';

export type AdminStaffInput = z.infer<typeof adminStaffSchema>;

export type ClubStaffRecord = ClubStaff & { sortOrder?: number };

function mapDbStaff(row: Record<string, unknown>): ClubStaffRecord {
  return {
    id: row.id as string,
    name: row.name as string,
    role: row.role as string,
    photo: (row.photo as string) || undefined,
    bio: (row.bio as string) || undefined,
    sortOrder: (row.sort_order as number) ?? 0,
  };
}

function toDbRow(input: AdminStaffInput) {
  return {
    name: input.name.trim(),
    role: input.role.trim(),
    photo: input.photo?.trim() || null,
    bio: input.bio?.trim() || null,
    sort_order: input.sortOrder ?? 0,
  };
}

async function getServiceSupabase() {
  const { createServiceClient } = await import('@/lib/db/supabase/server');
  return createServiceClient();
}

export async function getAllStaff(): Promise<ClubStaffRecord[]> {
  if (!isSupabaseApiConfigured()) {
    return seedClubStaff.map((member, index) => ({ ...member, sortOrder: index }));
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('club_staff')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data) {
    return seedClubStaff.map((member, index) => ({ ...member, sortOrder: index }));
  }
  return data.map(mapDbStaff);
}

export async function getStaffById(id: string): Promise<ClubStaffRecord | null> {
  if (!isSupabaseApiConfigured()) {
    return seedClubStaff.find((m) => m.id === id) ?? null;
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('club_staff').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapDbStaff(data);
}

export async function createStaff(input: AdminStaffInput): Promise<ClubStaffRecord> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  let sortOrder = input.sortOrder ?? 0;

  if (input.sortOrder === undefined) {
    const { data: maxRow } = await supabase
      .from('club_staff')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = ((maxRow?.sort_order as number) ?? -1) + 1;
  }

  const row = toDbRow({ ...input, sortOrder });
  const { data, error } = await supabase.from('club_staff').insert(row).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbStaff(data);
}

export async function updateStaff(id: string, input: Partial<AdminStaffInput>): Promise<ClubStaffRecord> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.role !== undefined) patch.role = input.role.trim();
  if (input.photo !== undefined) patch.photo = input.photo.trim() || null;
  if (input.bio !== undefined) patch.bio = input.bio.trim() || null;
  if (input.sortOrder !== undefined) patch.sort_order = input.sortOrder;

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('club_staff').update(patch).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbStaff(data);
}

export async function deleteStaff(id: string): Promise<void> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { error } = await supabase.from('club_staff').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function staffToFormValues(member: ClubStaffRecord): AdminStaffInput {
  return {
    name: member.name,
    role: member.role,
    photo: member.photo ?? '',
    bio: member.bio ?? '',
    sortOrder: member.sortOrder ?? 0,
  };
}
