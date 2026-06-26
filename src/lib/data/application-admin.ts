import type { AcademyApplication, ApplicationStatus } from '@/types';
import { isSupabaseApiConfigured } from '@/lib/db/env';

function mapDbApplication(row: Record<string, unknown>): AcademyApplication {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    dateOfBirth: row.date_of_birth as string,
    position: row.position as AcademyApplication['position'],
    height: (row.height as string) || '',
    preferredFoot: (row.preferred_foot as AcademyApplication['preferredFoot']) || 'right',
    parentGuardianName: row.parent_guardian_name as string,
    email: row.email as string,
    phone: row.phone as string,
    previousClub: (row.previous_club as string) || undefined,
    status: (row.status as ApplicationStatus) || 'new',
    createdAt: row.created_at as string,
  };
}

async function getServiceSupabase() {
  const { createServiceClient } = await import('@/lib/db/supabase/server');
  return createServiceClient();
}

export async function getAllApplications(): Promise<AcademyApplication[]> {
  if (!isSupabaseApiConfigured()) return [];

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('academy_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapDbApplication);
}

export async function getApplicationById(id: string): Promise<AcademyApplication | null> {
  if (!isSupabaseApiConfigured()) return null;

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('academy_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbApplication(data);
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<AcademyApplication> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('academy_applications')
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapDbApplication(data);
}
