import type { Player, NewsArticle, Video, ClubStaff, Fixture, ActivityItem, SiteStats, ClubStats, GalleryItem } from '@/types';
import { calculateAge } from '@/lib/utils/format';
import { resolveMediaUrl, resolveMediaUrls } from '@/lib/data/cbfc-media';
import {
  seedPlayers,
  seedNews,
  seedVideos,
  seedClubStaff,
  seedFixtures,
  seedActivity,
  seedSiteStats,
  seedClubStats,
  seedGallery,
} from './seed';

import { isSupabaseApiConfigured, getSupabaseServiceRoleKey } from '@/lib/db/env';

async function getDbClient() {
  if (getSupabaseServiceRoleKey()) {
    const { createServiceClient } = await import('@/lib/db/supabase/server');
    return createServiceClient();
  }
  const { createClient } = await import('@/lib/db/supabase/server');
  return createClient();
}

function siteStatsFromSeed(): SiteStats {
  return {
    registeredPlayers: seedPlayers.length,
    academyGraduates: seedPlayers.filter((p) => p.academyGraduate).length,
    playersAbroad: seedPlayers.filter((p) => p.status === 'abroad').length,
    playersOnTrial: seedPlayers.filter((p) => p.status === 'on_trial').length,
    scoutRequests: seedSiteStats.scoutRequests,
    clubMatchesPlayed: seedFixtures.filter((f) => !f.isUpcoming).length,
    professionalPlacements: seedPlayers.filter((p) => p.professionalPlayer).length,
  };
}

function clubStatsFromFixtures(fixtures: Fixture[], playersDeveloped: number, leaguePosition = 0): ClubStats {
  const played = fixtures.filter((f) => !f.isUpcoming);
  let wins = 0;
  let goalsScored = 0;
  let cleanSheets = 0;

  for (const fixture of played) {
    const isHome = fixture.homeTeam === 'CBFC';
    const isAway = fixture.awayTeam === 'CBFC';
    if (!isHome && !isAway) continue;

    const scored = isHome ? (fixture.homeScore ?? 0) : (fixture.awayScore ?? 0);
    const conceded = isHome ? (fixture.awayScore ?? 0) : (fixture.homeScore ?? 0);
    goalsScored += scored;
    if (conceded === 0) cleanSheets += 1;
    if (scored > conceded) wins += 1;
  }

  return {
    matchesPlayed: played.length,
    wins,
    goalsScored,
    cleanSheets,
    playersDeveloped,
    leaguePosition,
  };
}

function mapDbPlayer(row: Record<string, unknown>): Player {
  const dob = row.date_of_birth as string;
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    slug: row.slug as string,
    profilePhoto: resolveMediaUrl((row.profile_photo as string) || ''),
    dateOfBirth: dob,
    age: calculateAge(dob),
    nationality: row.nationality as string,
    position: row.position as Player['position'],
    height: (row.height as string) || '',
    weight: (row.weight as string) || '',
    preferredFoot: (row.preferred_foot as Player['preferredFoot']) || 'right',
    biography: (row.biography as string) || '',
    strengths: (row.strengths as Player['strengths']) || {},
    statistics: (row.statistics as Player['statistics']) || {},
    achievements: (row.achievements as Player['achievements']) || [],
    previousClubs: (row.previous_clubs as Player['previousClubs']) || [],
    videos: (row.videos as string[]) || [],
    images: resolveMediaUrls(row.images as string[]),
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

export async function getPlayers(filters?: {
  status?: string;
  position?: string;
  featured?: boolean;
  search?: string;
}): Promise<Player[]> {
  if (!isSupabaseApiConfigured()) {
    let players = [...seedPlayers];
    if (filters?.status) players = players.filter((p) => p.status === filters.status);
    if (filters?.position) players = players.filter((p) => p.position === filters.position);
    if (filters?.featured) players = players.filter((p) => p.featured);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      players = players.filter((p) => p.fullName.toLowerCase().includes(q));
    }
    return players;
  }

  const { createClient } = await import('@/lib/db/supabase/server');
  const supabase = await createClient();
  let query = supabase.from('players').select('*').order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.position) query = query.eq('position', filters.position);
  if (filters?.featured) query = query.eq('featured', true);
  if (filters?.search) query = query.ilike('full_name', `%${filters.search}%`);

  const { data, error } = await query;
  if (error || !data) return seedPlayers;
  return data.map(mapDbPlayer);
}

export async function getPlayerBySlug(slug: string): Promise<Player | null> {
  if (!isSupabaseApiConfigured()) {
    return seedPlayers.find((p) => p.slug === slug) || null;
  }

  const { createClient } = await import('@/lib/db/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase.from('players').select('*').eq('slug', slug).single();
  if (error || !data) return seedPlayers.find((p) => p.slug === slug) || null;
  return mapDbPlayer(data);
}

export async function getNewsArticles(filters?: {
  category?: string;
  featured?: boolean;
  search?: string;
}): Promise<NewsArticle[]> {
  if (!isSupabaseApiConfigured()) {
    let articles = [...seedNews];
    if (filters?.category) articles = articles.filter((a) => a.category === filters.category);
    if (filters?.featured) articles = articles.filter((a) => a.featured);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      articles = articles.filter((a) => a.title.toLowerCase().includes(q));
    }
    return articles;
  }

  const { createClient } = await import('@/lib/db/supabase/server');
  const supabase = await createClient();
  let query = supabase.from('news_articles').select('*').eq('published', true).order('published_at', { ascending: false });

  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.featured) query = query.eq('featured', true);
  if (filters?.search) query = query.ilike('title', `%${filters.search}%`);

  const { data } = await query;
  if (!data) return seedNews;
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || '',
    content: row.content || '',
    category: row.category,
    coverImage: resolveMediaUrl(row.cover_image as string),
    author: row.author || 'CBFC Media',
    published: row.published,
    featured: row.featured,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const articles = await getNewsArticles();
  return articles.find((a) => a.slug === slug) || null;
}

export async function getVideos(filters?: {
  position?: string;
  ageCategory?: string;
  featured?: boolean;
}): Promise<Video[]> {
  if (!isSupabaseApiConfigured()) {
    let videos = [...seedVideos];
    if (filters?.position) videos = videos.filter((v) => v.position === filters.position);
    if (filters?.ageCategory) videos = videos.filter((v) => v.ageCategory === filters.ageCategory);
    if (filters?.featured) videos = videos.filter((v) => v.featured);
    return videos;
  }

  const { createClient } = await import('@/lib/db/supabase/server');
  const supabase = await createClient();
  let query = supabase.from('videos').select('*').order('created_at', { ascending: false });

  if (filters?.position) query = query.eq('position', filters.position);
  if (filters?.ageCategory) query = query.eq('age_category', filters.ageCategory);
  if (filters?.featured) query = query.eq('featured', true);

  const { data } = await query;
  if (!data) return seedVideos;
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    thumbnail: row.thumbnail || '',
    videoUrl: row.video_url,
    playerId: row.player_id,
    playerName: row.player_name,
    position: row.position,
    ageCategory: row.age_category,
    duration: row.duration || '',
    featured: row.featured,
    createdAt: row.created_at,
  }));
}

export async function getClubStaff(): Promise<ClubStaff[]> {
  if (!isSupabaseApiConfigured()) return seedClubStaff;

  const { createClient } = await import('@/lib/db/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('club_staff').select('*').order('sort_order');
  return data || seedClubStaff;
}

export async function getFixtures(upcoming?: boolean): Promise<Fixture[]> {
  if (!isSupabaseApiConfigured()) {
    return upcoming !== undefined
      ? seedFixtures.filter((f) => f.isUpcoming === upcoming)
      : seedFixtures;
  }

  const { createClient } = await import('@/lib/db/supabase/server');
  const supabase = await createClient();
  let query = supabase.from('fixtures').select('*').order('match_date', { ascending: upcoming ?? false });
  if (upcoming !== undefined) query = query.eq('is_upcoming', upcoming);
  const { data } = await query;
  if (!data) return seedFixtures;
  return data.map((row) => ({
    id: row.id,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    homeScore: row.home_score,
    awayScore: row.away_score,
    date: row.match_date,
    venue: row.venue || '',
    competition: row.competition || '',
    isUpcoming: row.is_upcoming,
  }));
}

export async function getActivity(): Promise<ActivityItem[]> {
  if (!isSupabaseApiConfigured()) return seedActivity;

  const { createClient } = await import('@/lib/db/supabase/server');
  const supabase = await createClient();
  const { data } = await supabase.from('activity_items').select('*').order('activity_date', { ascending: false }).limit(10);
  if (!data) return seedActivity;
  return data.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description || '',
    date: row.activity_date,
    playerId: row.player_id,
  }));
}

export async function getSiteStats(): Promise<SiteStats> {
  if (!isSupabaseApiConfigured()) return siteStatsFromSeed();

  const supabase = await getDbClient();

  const [
    { count: registeredPlayers },
    { count: academyGraduates },
    { count: playersAbroad },
    { count: playersOnTrial },
    { count: scoutRequests },
    { count: clubMatchesPlayed },
    { count: professionalPlacements },
  ] = await Promise.all([
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('players').select('*', { count: 'exact', head: true }).eq('academy_graduate', true),
    supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'abroad'),
    supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'on_trial'),
    supabase.from('scout_inquiries').select('*', { count: 'exact', head: true }),
    supabase.from('fixtures').select('*', { count: 'exact', head: true }).eq('is_upcoming', false),
    supabase.from('players').select('*', { count: 'exact', head: true }).eq('professional_player', true),
  ]);

  return {
    registeredPlayers: registeredPlayers ?? 0,
    academyGraduates: academyGraduates ?? 0,
    playersAbroad: playersAbroad ?? 0,
    playersOnTrial: playersOnTrial ?? 0,
    scoutRequests: scoutRequests ?? 0,
    clubMatchesPlayed: clubMatchesPlayed ?? 0,
    professionalPlacements: professionalPlacements ?? 0,
  };
}

export async function getClubStats(): Promise<ClubStats> {
  if (!isSupabaseApiConfigured()) {
    return clubStatsFromFixtures(seedFixtures, seedPlayers.filter((p) => p.academyGraduate).length, seedClubStats.leaguePosition);
  }

  const supabase = await getDbClient();
  const [{ data: fixtures }, { count: playersDeveloped }, { data: clubRow }] = await Promise.all([
    supabase.from('fixtures').select('*'),
    supabase.from('players').select('*', { count: 'exact', head: true }).eq('academy_graduate', true),
    supabase.from('club_stats').select('league_position').eq('id', 1).maybeSingle(),
  ]);

  const mappedFixtures: Fixture[] = (fixtures ?? []).map((row) => ({
    id: row.id,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    homeScore: row.home_score,
    awayScore: row.away_score,
    date: row.match_date,
    venue: row.venue || '',
    competition: row.competition || '',
    isUpcoming: row.is_upcoming,
  }));

  return clubStatsFromFixtures(
    mappedFixtures.length ? mappedFixtures : seedFixtures,
    playersDeveloped ?? 0,
    clubRow?.league_position ?? 0,
  );
}

export async function getGallery(): Promise<GalleryItem[]> {
  if (!isSupabaseApiConfigured()) return seedGallery;

  const supabase = await getDbClient();
  const { data } = await supabase.from('gallery_items').select('*').order('sort_order');
  if (!data?.length) return seedGallery;

  return data.map((row) => ({
    id: row.id,
    title: row.title || '',
    imageUrl: resolveMediaUrl(row.image_url as string),
    category: row.category || '',
  }));
}
