import type { Fixture } from '@/types';
import { isSupabaseApiConfigured } from '@/lib/db/env';
import type { z } from 'zod';
import type { adminFixtureSchema } from '@/lib/validators/schemas';
import { seedFixtures } from './seed';

export type AdminFixtureInput = z.infer<typeof adminFixtureSchema>;

function mapDbFixture(row: Record<string, unknown>): Fixture {
  return {
    id: row.id as string,
    homeTeam: row.home_team as string,
    awayTeam: row.away_team as string,
    homeScore: row.home_score as number | undefined,
    awayScore: row.away_score as number | undefined,
    date: row.match_date as string,
    venue: (row.venue as string) || '',
    competition: (row.competition as string) || '',
    isUpcoming: row.is_upcoming as boolean,
  };
}

function toDbRow(input: AdminFixtureInput) {
  const isUpcoming = input.isUpcoming ?? true;
  return {
    home_team: input.homeTeam.trim(),
    away_team: input.awayTeam.trim(),
    home_score: isUpcoming ? null : (input.homeScore ?? null),
    away_score: isUpcoming ? null : (input.awayScore ?? null),
    match_date: input.matchDate,
    venue: input.venue?.trim() || null,
    competition: input.competition?.trim() || null,
    is_upcoming: isUpcoming,
  };
}

async function getServiceSupabase() {
  const { createServiceClient } = await import('@/lib/db/supabase/server');
  return createServiceClient();
}

export async function getAllFixtures(): Promise<Fixture[]> {
  if (!isSupabaseApiConfigured()) {
    return [...seedFixtures];
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('fixtures')
    .select('*')
    .order('match_date', { ascending: false });

  if (error || !data) return seedFixtures;
  return data.map(mapDbFixture);
}

export async function getFixtureById(id: string): Promise<Fixture | null> {
  if (!isSupabaseApiConfigured()) {
    return seedFixtures.find((f) => f.id === id) ?? null;
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('fixtures').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapDbFixture(data);
}

export async function createFixture(input: AdminFixtureInput): Promise<Fixture> {
  const row = toDbRow(input);

  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('fixtures').insert(row).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbFixture(data);
}

export async function updateFixture(id: string, input: Partial<AdminFixtureInput>): Promise<Fixture> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const patch: Record<string, unknown> = {};
  if (input.homeTeam !== undefined) patch.home_team = input.homeTeam.trim();
  if (input.awayTeam !== undefined) patch.away_team = input.awayTeam.trim();
  if (input.matchDate !== undefined) patch.match_date = input.matchDate;
  if (input.venue !== undefined) patch.venue = input.venue.trim() || null;
  if (input.competition !== undefined) patch.competition = input.competition.trim() || null;
  if (input.isUpcoming !== undefined) {
    patch.is_upcoming = input.isUpcoming;
    if (input.isUpcoming) {
      patch.home_score = null;
      patch.away_score = null;
    }
  }
  if (input.homeScore !== undefined) patch.home_score = input.homeScore;
  if (input.awayScore !== undefined) patch.away_score = input.awayScore;

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from('fixtures').update(patch).eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return mapDbFixture(data);
}

export async function deleteFixture(id: string): Promise<void> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { error } = await supabase.from('fixtures').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function fixtureToFormValues(fixture: Fixture): AdminFixtureInput {
  const matchDate = fixture.date.includes('T')
    ? fixture.date.slice(0, 16)
    : `${fixture.date}T15:00`;

  return {
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    homeScore: fixture.homeScore ?? null,
    awayScore: fixture.awayScore ?? null,
    matchDate,
    venue: fixture.venue,
    competition: fixture.competition,
    isUpcoming: fixture.isUpcoming,
  };
}
