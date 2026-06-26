import type { Video } from '@/types';
import { isSupabaseApiConfigured } from '@/lib/db/env';
import type { z } from 'zod';
import type { adminVideoSchema } from '@/lib/validators/schemas';
import { seedVideos } from './seed';

export type AdminVideoInput = z.infer<typeof adminVideoSchema>;

function mapDbVideo(row: Record<string, unknown>): Video {
  return {
    id: row.id as string,
    title: row.title as string,
    thumbnail: (row.thumbnail as string) || '',
    videoUrl: row.video_url as string,
    playerId: row.player_id as string | undefined,
    playerName: row.player_name as string | undefined,
    position: row.position as Video['position'],
    ageCategory: row.age_category as Video['ageCategory'],
    duration: (row.duration as string) || '',
    featured: row.featured as boolean,
    createdAt: row.created_at as string,
  };
}

function toDbRow(input: AdminVideoInput) {
  return {
    title: input.title.trim(),
    thumbnail: input.thumbnail?.trim() || null,
    video_url: input.videoUrl.trim(),
    player_id: input.playerId || null,
    player_name: input.playerName?.trim() || null,
    position: input.position === 'all' ? null : input.position ?? null,
    age_category: input.ageCategory ?? null,
    duration: input.duration?.trim() || null,
    featured: input.featured ?? false,
  };
}

async function getServiceSupabase() {
  const { createServiceClient } = await import('@/lib/db/supabase/server');
  return createServiceClient();
}

export async function getAllVideos(): Promise<Video[]> {
  if (!isSupabaseApiConfigured()) {
    return [...seedVideos];
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return seedVideos;
  return data.map(mapDbVideo);
}

export async function getVideoById(id: string): Promise<Video | null> {
  if (!isSupabaseApiConfigured()) {
    return seedVideos.find((v) => v.id === id) ?? null;
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('videos').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapDbVideo(data);
}

export async function createVideo(input: AdminVideoInput): Promise<Video> {
  const row = toDbRow(input);

  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('videos').insert(row).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbVideo(data);
}

export async function updateVideo(id: string, input: Partial<AdminVideoInput>): Promise<Video> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const patch: Record<string, unknown> = {};
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.thumbnail !== undefined) patch.thumbnail = input.thumbnail.trim() || null;
  if (input.videoUrl !== undefined) patch.video_url = input.videoUrl.trim();
  if (input.playerId !== undefined) patch.player_id = input.playerId || null;
  if (input.playerName !== undefined) patch.player_name = input.playerName.trim() || null;
  if (input.position !== undefined) patch.position = input.position === 'all' ? null : input.position ?? null;
  if (input.ageCategory !== undefined) patch.age_category = input.ageCategory ?? null;
  if (input.duration !== undefined) patch.duration = input.duration.trim() || null;
  if (input.featured !== undefined) patch.featured = input.featured;

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('videos').update(patch).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbVideo(data);
}

export async function deleteVideo(id: string): Promise<void> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { error } = await supabase.from('videos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function videoToFormValues(video: Video): AdminVideoInput {
  return {
    title: video.title,
    thumbnail: video.thumbnail,
    videoUrl: video.videoUrl,
    playerId: video.playerId ?? null,
    playerName: video.playerName ?? '',
    position: video.position ?? 'all',
    ageCategory: video.ageCategory,
    duration: video.duration,
    featured: video.featured ?? false,
  };
}
