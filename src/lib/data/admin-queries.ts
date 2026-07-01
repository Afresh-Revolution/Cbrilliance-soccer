import type {
  AdminApplicationRow,
  AdminDashboardData,
  AdminDashboardStats,
  AdminInquiryRow,
  AdminPlayerStatusRow,
  ApplicationStatus,
  GalleryItem,
  InquiryStatus,
  PlayerStatus,
} from '@/types';
import { POSITION_LABELS, STATUS_LABELS } from '@/lib/constants/navigation';
import { ageGroupFromDateOfBirth } from '@/lib/utils/age-group';
import { isSupabaseApiConfigured, getSupabaseServiceRoleKey } from '@/lib/db/env';
import { seedPlayers } from './seed';

const ACTIVE_INQUIRY_STATUSES: InquiryStatus[] = ['new', 'pending', 'contacted'];

const PLAYER_STATUS_BUCKETS: { status: PlayerStatus; label: string }[] = [
  { status: 'professional_squad', label: 'Professional Squad' },
  { status: 'abroad', label: 'Abroad' },
  { status: 'on_trial', label: 'On Trial' },
  { status: 'available_for_trials', label: 'Available For Trials' },
  { status: 'in_development', label: 'In Development' },
];

async function getDbClient() {
  if (getSupabaseServiceRoleKey()) {
    const { createServiceClient } = await import('@/lib/db/supabase/server');
    return createServiceClient();
  }
  const { createClient } = await import('@/lib/db/supabase/server');
  return createClient();
}

function dashboardFromSeed(): AdminDashboardData {
  const distribution = PLAYER_STATUS_BUCKETS.map(({ status, label }) => ({
    status,
    label,
    count: seedPlayers.filter((p) => p.status === status).length,
  }));

  return {
    stats: {
      totalPlayers: seedPlayers.length,
      activeInquiries: 0,
      academyApplications: 0,
      playersAbroad: seedPlayers.filter((p) => p.status === 'abroad').length,
      publishedNews: 0,
      videos: 0,
      upcomingFixtures: 0,
      coachingStaff: 0,
      galleryImages: 0, // Added gallery count
    },
    recentInquiries: [],
    recentApplications: [],
    playerStatusDistribution: distribution,
    recentGallery: [], // Added recent gallery
  };
}

function mapScoutInquiry(row: Record<string, unknown>): AdminInquiryRow {
  return {
    id: row.id as string,
    name: row.scout_name as string,
    subtitle: `${row.club_name} · Scout`,
    status: (row.status as InquiryStatus) || 'new',
    source: 'scout',
    createdAt: row.created_at as string,
  };
}

function mapContactInquiry(row: Record<string, unknown>): AdminInquiryRow {
  const org = (row.organization as string) || 'Contact';
  return {
    id: row.id as string,
    name: row.full_name as string,
    subtitle: org,
    status: (row.status as InquiryStatus) || 'new',
    source: 'contact',
    createdAt: row.created_at as string,
  };
}

function mapApplication(row: Record<string, unknown>): AdminApplicationRow {
  const position = row.position as string;
  const ageGroup = ageGroupFromDateOfBirth(row.date_of_birth as string);
  return {
    id: row.id as string,
    name: row.full_name as string,
    subtitle: `${position.charAt(0).toUpperCase()}${position.slice(1)} · ${ageGroup}`,
    status: (row.status as ApplicationStatus) || 'new',
    email: row.email as string,
    createdAt: row.created_at as string,
  };
}

// Added mapper for gallery items
function mapGalleryItem(row: Record<string, unknown>): GalleryItem {
  return {
    id: row.id as string,
    title: (row.title as string) || '',
    imageUrl: (row.image_url as string) || '',
    category: (row.category as string) || '',
  };
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  if (!isSupabaseApiConfigured()) return dashboardFromSeed();

  const supabase = await getDbClient();

  const [
    { count: totalPlayers },
    { count: playersAbroad },
    { count: publishedNews },
    { count: videos },
    { count: upcomingFixtures },
    { count: coachingStaff },
    { count: academyApplications },
    { count: activeScoutInquiries },
    { count: activeContactInquiries },
    { count: galleryImages }, // Added gallery count fetch
    { data: scoutRows },
    { data: contactRows },
    { data: applicationRows },
    { data: playerRows },
    { data: galleryRows }, // Added recent gallery fetch
  ] = await Promise.all([
    supabase.from('players').select('*', { count: 'exact', head: true }),
    supabase.from('players').select('*', { count: 'exact', head: true }).eq('status', 'abroad'),
    supabase.from('news_articles').select('*', { count: 'exact', head: true }).eq('published', true),
    supabase.from('videos').select('*', { count: 'exact', head: true }),
    supabase.from('fixtures').select('*', { count: 'exact', head: true }).eq('is_upcoming', true),
    supabase.from('club_staff').select('*', { count: 'exact', head: true }),
    supabase.from('academy_applications').select('*', { count: 'exact', head: true }),
    supabase
      .from('scout_inquiries')
      .select('*', { count: 'exact', head: true })
      .in('status', ACTIVE_INQUIRY_STATUSES),
    supabase
      .from('contact_inquiries')
      .select('*', { count: 'exact', head: true })
      .in('status', ACTIVE_INQUIRY_STATUSES),
    supabase.from('gallery_items').select('*', { count: 'exact', head: true }), // Added
    supabase.from('scout_inquiries').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('academy_applications').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('players').select('status'),
    supabase.from('gallery_items').select('id, title, image_url, category').order('sort_order', { ascending: true }).limit(5), // Added
  ]);

  const stats: AdminDashboardStats = {
    totalPlayers: totalPlayers ?? 0,
    activeInquiries: (activeScoutInquiries ?? 0) + (activeContactInquiries ?? 0),
    academyApplications: academyApplications ?? 0,
    playersAbroad: playersAbroad ?? 0,
    publishedNews: publishedNews ?? 0,
    videos: videos ?? 0,
    upcomingFixtures: upcomingFixtures ?? 0,
    coachingStaff: coachingStaff ?? 0,
    galleryImages: galleryImages ?? 0, // Added gallery count to stats
  };

  const recentInquiries = [...(scoutRows ?? []).map(mapScoutInquiry), ...(contactRows ?? []).map(mapContactInquiry)]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const recentApplications = (applicationRows ?? []).map(mapApplication);
  
  const recentGallery = (galleryRows ?? []).map(mapGalleryItem); // Added

  const statusCounts = new Map<PlayerStatus, number>();
  for (const row of playerRows ?? []) {
    const status = row.status as PlayerStatus;
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1);
  }

  const playerStatusDistribution: AdminPlayerStatusRow[] = PLAYER_STATUS_BUCKETS.map(({ status, label }) => ({
    status,
    label,
    count: statusCounts.get(status) ?? 0,
  }));

  return { 
    stats, 
    recentInquiries, 
    recentApplications, 
    playerStatusDistribution,
    recentGallery,
  };
}

export async function getAdminInquiries() {
  if (!isSupabaseApiConfigured()) return [];

  const supabase = await getDbClient();
  const [{ data: scoutRows }, { data: contactRows }] = await Promise.all([
    supabase.from('scout_inquiries').select('*').order('created_at', { ascending: false }),
    supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false }),
  ]);

  return [...(scoutRows ?? []).map(mapScoutInquiry), ...(contactRows ?? []).map(mapContactInquiry)].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getAdminApplications(): Promise<AdminApplicationRow[]> {
  if (!isSupabaseApiConfigured()) return [];

  const supabase = await getDbClient();
  const { data } = await supabase.from('academy_applications').select('*').order('created_at', { ascending: false });
  return (data ?? []).map(mapApplication);
}

export async function getAdminInquiryStats() {
  const inquiries = await getAdminInquiries();
  return {
    new: inquiries.filter((i) => i.status === 'new').length,
    pending: inquiries.filter((i) => i.status === 'pending').length,
    closed: inquiries.filter((i) => i.status === 'closed').length,
  };
}

export async function getAdminStaff() {
  if (!isSupabaseApiConfigured()) return [];

  const supabase = await getDbClient();
  const { data } = await supabase.from('club_staff').select('*').order('sort_order');
  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    photo: row.photo,
    bio: row.bio,
  }));
}

export { STATUS_LABELS, POSITION_LABELS };