import type { AdminInquiryDetail, InquiryStatus } from '@/types';
import { isSupabaseApiConfigured } from '@/lib/db/env';

function contactTypeLabel(organization?: string | null): string {
  const org = (organization ?? '').toLowerCase();
  if (org.includes('agent')) return 'Agent';
  if (org.includes('academy')) return 'Academy';
  return 'Contact';
}

function mapScoutInquiry(row: Record<string, unknown>): AdminInquiryDetail {
  return {
    id: row.id as string,
    source: 'scout',
    name: row.scout_name as string,
    organisation: row.club_name as string,
    typeLabel: 'Scout',
    status: (row.status as InquiryStatus) || 'new',
    email: row.email as string,
    phone: (row.phone as string) || undefined,
    message: (row.message as string) || undefined,
    playerId: (row.player_id as string) || undefined,
    createdAt: row.created_at as string,
  };
}

function mapContactInquiry(row: Record<string, unknown>): AdminInquiryDetail {
  const organisation = (row.organization as string) || '—';
  return {
    id: row.id as string,
    source: 'contact',
    name: row.full_name as string,
    organisation,
    typeLabel: contactTypeLabel(row.organization as string),
    status: (row.status as InquiryStatus) || 'new',
    email: row.email as string,
    phone: (row.phone as string) || undefined,
    message: row.message as string,
    createdAt: row.created_at as string,
  };
}

async function getServiceSupabase() {
  const { createServiceClient } = await import('@/lib/db/supabase/server');
  return createServiceClient();
}

export async function getAllInquiries(): Promise<AdminInquiryDetail[]> {
  if (!isSupabaseApiConfigured()) return [];

  const supabase = await getServiceSupabase();
  const [{ data: scoutRows }, { data: contactRows }] = await Promise.all([
    supabase.from('scout_inquiries').select('*').order('created_at', { ascending: false }),
    supabase.from('contact_inquiries').select('*').order('created_at', { ascending: false }),
  ]);

  return [
    ...(scoutRows ?? []).map(mapScoutInquiry),
    ...(contactRows ?? []).map(mapContactInquiry),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getInquiryById(
  source: AdminInquiryDetail['source'],
  id: string,
): Promise<AdminInquiryDetail | null> {
  if (!isSupabaseApiConfigured()) return null;

  const table = source === 'scout' ? 'scout_inquiries' : 'contact_inquiries';
  const supabase = await getServiceSupabase();
  const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return source === 'scout' ? mapScoutInquiry(data) : mapContactInquiry(data);
}

export async function updateInquiryStatus(
  source: AdminInquiryDetail['source'],
  id: string,
  status: InquiryStatus,
): Promise<AdminInquiryDetail> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const table = source === 'scout' ? 'scout_inquiries' : 'contact_inquiries';
  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from(table)
    .update({ status })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return source === 'scout' ? mapScoutInquiry(data) : mapContactInquiry(data);
}

export async function deleteInquiry(
  source: AdminInquiryDetail['source'],
  id: string,
): Promise<void> {
  if (!isSupabaseApiConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const table = source === 'scout' ? 'scout_inquiries' : 'contact_inquiries';
  const supabase = await getServiceSupabase();
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function countActiveInquiries(inquiries: AdminInquiryDetail[]): number {
  return inquiries.filter((i) => i.status !== 'closed').length;
}
