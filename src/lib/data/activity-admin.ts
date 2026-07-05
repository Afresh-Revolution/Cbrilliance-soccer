import type { ActivityItem } from '@/types';
import { isSupabaseApiConfigured } from '@/lib/db/env';
import type { AdminActivityInput } from '@/lib/data/activity-shared';
import { seedActivity } from './seed';

export type { AdminActivityInput } from '@/lib/data/activity-shared';
export { activityToFormValues } from '@/lib/data/activity-shared';

function mapDbActivity(row: Record<string, unknown>): ActivityItem {
  return {
    id: row.id as string,
    type: row.type as string,
    title: row.title as string,
    description: (row.description as string) || '',
    date: row.activity_date as string,
    playerId: row.player_id as string | undefined,
  };
}

function toDbRow(input: AdminActivityInput) {
  return {
    type: input.type,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    activity_date: input.activityDate,
    player_id: input.playerId || null,
  };
}

async function getServiceSupabase() {
  const { createServiceClient } = await import('@/lib/db/supabase/server');
  return createServiceClient();
}

export async function getAllActivityItems(): Promise<ActivityItem[]> {
  if (!isSupabaseApiConfigured()) {
    return [...seedActivity];
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('activity_items')
    .select('*')
    .order('activity_date', { ascending: false });

  if (error || !data) return seedActivity;
  return data.map(mapDbActivity);
}

export async function getActivityItemById(id: string): Promise<ActivityItem | null> {
  if (!isSupabaseApiConfigured()) {
    return seedActivity.find((a) => a.id === id) ?? null;
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('activity_items').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapDbActivity(data);
}

export async function createActivityItem(input: AdminActivityInput): Promise<ActivityItem> {
  const row = toDbRow(input);

  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('activity_items').insert(row).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbActivity(data);
}

export async function updateActivityItem(id: string, input: Partial<AdminActivityInput>): Promise<ActivityItem> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const patch: Record<string, unknown> = {};
  if (input.type !== undefined) patch.type = input.type;
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.description !== undefined) patch.description = input.description.trim() || null;
  if (input.activityDate !== undefined) patch.activity_date = input.activityDate;
  if (input.playerId !== undefined) patch.player_id = input.playerId || null;

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('activity_items').update(patch).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbActivity(data);
}

export async function deleteActivityItem(id: string): Promise<void> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { error } = await supabase.from('activity_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
