import type { Player } from '@/types';
import { calculateAge, slugify } from '@/lib/utils/format';
import { isSupabaseApiConfigured } from '@/lib/db/env';
import type { z } from 'zod';
import type { adminPlayerSchema } from '@/lib/validators/schemas';
import { seedPlayers } from './seed';

export type AdminPlayerInput = z.infer<typeof adminPlayerSchema>;

function mapDbPlayer(row: Record<string, unknown>): Player {
  const dob = row.date_of_birth as string;
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    slug: row.slug as string,
    profilePhoto: (row.profile_photo as string) || '',
    dateOfBirth: dob,
    age: calculateAge(dob),
    nationality: row.nationality as string,
    position: row.position as Player['position'],
    height: (row.height as string) || '',
    weight: (row.weight as string) || '',
    preferredFoot: (row.preferred_foot as Player['preferredFoot']) || 'right',
    biography: (row.biography as string) || '',
    strengths: (row.strengths as Player['strengths']) || {},
    statistics: (row.statistics as Player['statistics']) || {
      matchesPlayed: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      minutesPlayed: 0,
    },
    achievements: (row.achievements as Player['achievements']) || [],
    previousClubs: (row.previous_clubs as Player['previousClubs']) || [],
    videos: (row.videos as string[]) || [],
    images: (row.images as string[]) || [],
    movementHistory: (row.movement_history as Player['movementHistory']) || [],
    status: row.status as Player['status'],
    academyGraduate: row.academy_graduate as boolean,
    professionalPlayer: row.professional_player as boolean,
    jerseyNumber: row.jersey_number as number | undefined,
    featured: row.featured as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function toDbRow(input: AdminPlayerInput, slug: string) {
  return {
    full_name: input.fullName.trim(),
    slug,
    profile_photo: input.profilePhoto?.trim() || null,
    date_of_birth: input.dateOfBirth,
    nationality: input.nationality.trim(),
    position: input.position,
    height: input.height?.trim() || null,
    weight: input.weight?.trim() || null,
    preferred_foot: input.preferredFoot ?? null,
    biography: input.biography?.trim() || null,
    status: input.status,
    academy_graduate: input.academyGraduate ?? false,
    professional_player: input.professionalPlayer ?? false,
    featured: input.featured ?? false,
    jersey_number: input.jerseyNumber ?? null,
    statistics: input.statistics ?? {
      matchesPlayed: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      minutesPlayed: 0,
    },
    strengths: {},
    achievements: [],
    previous_clubs: [],
    videos: [],
    images: [],
    movement_history: [],
  };
}

async function getServiceSupabase() {
  const { createServiceClient } = await import('@/lib/db/supabase/server');
  return createServiceClient();
}

export async function getPlayerById(id: string): Promise<Player | null> {
  if (!isSupabaseApiConfigured()) {
    return seedPlayers.find((p) => p.id === id) ?? null;
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('players').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapDbPlayer(data);
}

export async function createPlayer(input: AdminPlayerInput): Promise<Player> {
  const slug = input.slug?.trim() || slugify(input.fullName);
  const row = toDbRow(input, slug);

  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('players').insert(row).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbPlayer(data);
}

export async function updatePlayer(id: string, input: Partial<AdminPlayerInput>): Promise<Player> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const patch: Record<string, unknown> = {};
  if (input.fullName !== undefined) patch.full_name = input.fullName.trim();
  if (input.slug !== undefined) patch.slug = input.slug.trim();
  if (input.profilePhoto !== undefined) patch.profile_photo = input.profilePhoto.trim() || null;
  if (input.dateOfBirth !== undefined) patch.date_of_birth = input.dateOfBirth;
  if (input.nationality !== undefined) patch.nationality = input.nationality.trim();
  if (input.position !== undefined) patch.position = input.position;
  if (input.height !== undefined) patch.height = input.height.trim() || null;
  if (input.weight !== undefined) patch.weight = input.weight.trim() || null;
  if (input.preferredFoot !== undefined) patch.preferred_foot = input.preferredFoot;
  if (input.biography !== undefined) patch.biography = input.biography.trim() || null;
  if (input.status !== undefined) patch.status = input.status;
  if (input.academyGraduate !== undefined) patch.academy_graduate = input.academyGraduate;
  if (input.professionalPlayer !== undefined) patch.professional_player = input.professionalPlayer;
  if (input.featured !== undefined) patch.featured = input.featured;
  if (input.jerseyNumber !== undefined) patch.jersey_number = input.jerseyNumber;
  if (input.statistics !== undefined) patch.statistics = input.statistics;

  if (input.fullName && !input.slug) {
    patch.slug = slugify(input.fullName);
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('players').update(patch).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbPlayer(data);
}

export async function deletePlayer(id: string): Promise<void> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function playerToFormValues(player: Player): AdminPlayerInput {
  return {
    fullName: player.fullName,
    slug: player.slug,
    profilePhoto: player.profilePhoto,
    dateOfBirth: player.dateOfBirth,
    nationality: player.nationality,
    position: player.position,
    height: player.height,
    weight: player.weight,
    preferredFoot: player.preferredFoot,
    biography: player.biography,
    status: player.status,
    academyGraduate: player.academyGraduate,
    professionalPlayer: player.professionalPlayer,
    featured: player.featured,
    jerseyNumber: player.jerseyNumber ?? null,
    statistics: player.statistics,
  };
}

export { mapDbPlayer };
