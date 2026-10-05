import { randomBytes } from 'crypto';
import type {
  TournamentBankDetails,
  TournamentOfficialPosition,
  TournamentPlayer,
  TournamentRegistration,
  TournamentRegistrationStatus,
  TournamentSquad,
} from '@/types';
import { isSupabaseServiceConfigured } from '@/lib/db/env';
import { isSquadLocked, TOURNAMENT_FEE_NAIRA } from '@/lib/tournament/constants';

export interface CreateTournamentRegistrationInput {
  teamName: string;
  teamShortName?: string;
  teamLocation: string;
  homeGround?: string;
  teamLogoUrl?: string;
  officialFullName: string;
  officialPhone: string;
  officialWhatsapp?: string;
  officialEmail?: string;
  officialPositions: TournamentOfficialPosition[];
  playerCount: number;
  teamCaptain?: string;
  coachName?: string;
  assistantCoach?: string;
  jerseyHome: string;
  jerseyAway?: string;
  representativeName: string;
  digitalSignature: string;
  paymentReference: string;
  paymentReceiptUrl: string;
}

function blank(value?: string): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
}

function mapPlayer(row: Record<string, unknown>): TournamentPlayer {
  return {
    id: row.id as string,
    registrationId: row.registration_id as string,
    fullName: row.full_name as string,
    squadNumber: row.squad_number as number,
    createdAt: row.created_at as string,
  };
}

function mapRegistration(row: Record<string, unknown>): TournamentRegistration {
  const nested = Array.isArray(row.tournament_players) ? row.tournament_players : [];
  const players = nested
    .map((player) => mapPlayer(player as Record<string, unknown>))
    .sort((a, b) => a.squadNumber - b.squadNumber);

  return {
    id: row.id as string,
    registrationCode: row.registration_code as string,
    accessToken: row.access_token as string,
    teamName: row.team_name as string,
    teamShortName: (row.team_short_name as string) || undefined,
    teamLocation: row.team_location as string,
    homeGround: (row.home_ground as string) || undefined,
    teamLogoUrl: (row.team_logo_url as string) || undefined,
    officialFullName: row.official_full_name as string,
    officialPhone: row.official_phone as string,
    officialWhatsapp: (row.official_whatsapp as string) || undefined,
    officialEmail: (row.official_email as string) || undefined,
    officialPositions: (row.official_positions as TournamentOfficialPosition[]) ?? [],
    playerCount: row.player_count as number,
    teamCaptain: (row.team_captain as string) || undefined,
    coachName: (row.coach_name as string) || undefined,
    assistantCoach: (row.assistant_coach as string) || undefined,
    jerseyHome: row.jersey_home as string,
    jerseyAway: (row.jersey_away as string) || undefined,
    representativeName: row.representative_name as string,
    digitalSignature: row.digital_signature as string,
    registrationFeeAmount: (row.registration_fee_amount as number) || TOURNAMENT_FEE_NAIRA,
    paymentMethod: 'bank_transfer',
    paymentReference: row.payment_reference as string,
    paymentReceiptUrl: (row.payment_receipt_url as string) || undefined,
    status: (row.status as TournamentRegistrationStatus) || 'submitted',
    createdAt: row.created_at as string,
    players,
  };
}

function toSquad(registration: TournamentRegistration): TournamentSquad {
  return {
    registrationCode: registration.registrationCode,
    teamName: registration.teamName,
    teamShortName: registration.teamShortName,
    teamLocation: registration.teamLocation,
    playerCount: registration.playerCount,
    status: registration.status,
    squadLocked: isSquadLocked(registration.status),
    players: registration.players,
  };
}

async function getServiceSupabase() {
  const { createServiceClient } = await import('@/lib/db/supabase/server');
  return createServiceClient();
}

function mapDbError(error: { message?: string; code?: string }): Error {
  const message = error.message ?? 'Database error';
  if (message.includes('SQUAD_FULL')) return new Error('SQUAD_FULL');
  if (message.includes('SQUAD_LOCKED')) return new Error('SQUAD_LOCKED');
  if (error.code === '23505' && message.includes('squad_number')) return new Error('SQUAD_NUMBER_TAKEN');
  if (error.code === '23505') return new Error('SQUAD_NUMBER_TAKEN');
  return new Error(message);
}

export async function createTournamentRegistration(
  input: CreateTournamentRegistrationInput,
): Promise<TournamentRegistration> {
  if (!isSupabaseServiceConfigured()) {
    throw new Error('DATABASE_NOT_CONFIGURED');
  }

  const supabase = await getServiceSupabase();
  const { data: code, error: codeError } = await supabase.rpc('next_tournament_registration_code');
  if (codeError || typeof code !== 'string') {
    throw new Error(codeError?.message || 'REGISTRATION_CODE_FAILED');
  }

  const accessToken = randomBytes(24).toString('base64url');
  const { data, error } = await supabase
    .from('tournament_registrations')
    .insert({
      registration_code: code,
      access_token: accessToken,
      team_name: input.teamName.trim(),
      team_short_name: blank(input.teamShortName),
      team_location: input.teamLocation.trim(),
      home_ground: blank(input.homeGround),
      team_logo_url: blank(input.teamLogoUrl),
      official_full_name: input.officialFullName.trim(),
      official_phone: input.officialPhone.trim(),
      official_whatsapp: blank(input.officialWhatsapp),
      official_email: blank(input.officialEmail)?.toLowerCase() ?? null,
      official_positions: input.officialPositions,
      player_count: input.playerCount,
      team_captain: blank(input.teamCaptain),
      coach_name: blank(input.coachName),
      assistant_coach: blank(input.assistantCoach),
      jersey_home: input.jerseyHome.trim(),
      jersey_away: blank(input.jerseyAway),
      confirm_accurate: true,
      agree_rules: true,
      understand_verification: true,
      consent_media: true,
      representative_name: input.representativeName.trim(),
      digital_signature: input.digitalSignature.trim(),
      registration_fee_amount: TOURNAMENT_FEE_NAIRA,
      payment_method: 'bank_transfer',
      payment_reference: input.paymentReference.trim(),
      payment_receipt_url: input.paymentReceiptUrl,
      status: 'submitted',
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message || 'Insert failed');
  return mapRegistration(data);
}

const REGISTRATION_SELECT = '*, tournament_players(*)';

export async function getAllTournamentRegistrations(): Promise<TournamentRegistration[]> {
  if (!isSupabaseServiceConfigured()) return [];

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('tournament_registrations')
    .select(REGISTRATION_SELECT)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((row) => mapRegistration(row));
}

export async function getTournamentRegistrationById(id: string): Promise<TournamentRegistration | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('tournament_registrations')
    .select(REGISTRATION_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return mapRegistration(data);
}

export async function getTournamentRegistrationByToken(token: string): Promise<TournamentSquad | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('tournament_registrations')
    .select(REGISTRATION_SELECT)
    .eq('access_token', token)
    .maybeSingle();

  if (error || !data) return null;
  return toSquad(mapRegistration(data));
}

export async function addTournamentPlayer(
  token: string,
  fullName: string,
  squadNumber: number,
): Promise<TournamentPlayer> {
  if (!isSupabaseServiceConfigured()) throw new Error('DATABASE_NOT_CONFIGURED');

  const supabase = await getServiceSupabase();
  const { data: registration, error: lookupError } = await supabase
    .from('tournament_registrations')
    .select('id, status, player_count')
    .eq('access_token', token)
    .maybeSingle();

  if (lookupError) throw new Error(lookupError.message);
  if (!registration) throw new Error('NOT_FOUND');
  if (isSquadLocked(registration.status as string)) throw new Error('SQUAD_LOCKED');

  const { count, error: countError } = await supabase
    .from('tournament_players')
    .select('id', { count: 'exact', head: true })
    .eq('registration_id', registration.id);

  if (countError) throw new Error(countError.message);
  if ((count ?? 0) >= (registration.player_count as number)) throw new Error('SQUAD_FULL');

  const { data, error } = await supabase
    .from('tournament_players')
    .insert({
      registration_id: registration.id,
      full_name: fullName.trim(),
      squad_number: squadNumber,
    })
    .select('*')
    .single();

  if (error || !data) throw mapDbError(error ?? { message: 'Insert failed' });
  return mapPlayer(data);
}

export async function removeTournamentPlayer(token: string, playerId: string): Promise<void> {
  if (!isSupabaseServiceConfigured()) throw new Error('DATABASE_NOT_CONFIGURED');

  const supabase = await getServiceSupabase();
  const { data: registration, error: lookupError } = await supabase
    .from('tournament_registrations')
    .select('id, status')
    .eq('access_token', token)
    .maybeSingle();

  if (lookupError) throw new Error(lookupError.message);
  if (!registration) throw new Error('NOT_FOUND');
  if (isSquadLocked(registration.status as string)) throw new Error('SQUAD_LOCKED');

  const { error } = await supabase
    .from('tournament_players')
    .delete()
    .eq('id', playerId)
    .eq('registration_id', registration.id);

  if (error) throw mapDbError(error);
}

const EMPTY_BANK_DETAILS: TournamentBankDetails = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  paymentNote: '',
};

function mapBankDetails(row: Record<string, unknown>): TournamentBankDetails {
  return {
    bankName: (row.bank_name as string) || '',
    accountName: (row.account_name as string) || '',
    accountNumber: (row.account_number as string) || '',
    paymentNote: (row.payment_note as string) || '',
  };
}

export function tournamentBankDetailsAreSet(details: TournamentBankDetails): boolean {
  return Boolean(details.bankName && details.accountName && details.accountNumber);
}

export async function getTournamentBankDetails(): Promise<TournamentBankDetails> {
  if (!isSupabaseServiceConfigured()) return EMPTY_BANK_DETAILS;

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('tournament_bank_details')
    .select('bank_name, account_name, account_number, payment_note')
    .eq('id', 1)
    .maybeSingle();

  if (error || !data) return EMPTY_BANK_DETAILS;
  return mapBankDetails(data);
}

export async function updateTournamentBankDetails(
  input: TournamentBankDetails,
): Promise<TournamentBankDetails> {
  if (!isSupabaseServiceConfigured()) throw new Error('DATABASE_NOT_CONFIGURED');

  const supabase = await getServiceSupabase();
  const payload = {
    id: 1,
    bank_name: input.bankName.trim(),
    account_name: input.accountName.trim(),
    account_number: input.accountNumber.trim(),
    payment_note: input.paymentNote.trim(),
  };
  const { data, error } = await supabase
    .from('tournament_bank_details')
    .upsert(payload, { onConflict: 'id' })
    .select('bank_name, account_name, account_number, payment_note')
    .single();

  if (error || !data) throw new Error(error?.message || 'Update failed');
  return mapBankDetails(data);
}

export async function deleteTournamentRegistration(id: string): Promise<TournamentRegistration> {
  if (!isSupabaseServiceConfigured()) throw new Error('DATABASE_NOT_CONFIGURED');

  const existing = await getTournamentRegistrationById(id);
  if (!existing) throw new Error('NOT_FOUND');

  const supabase = await getServiceSupabase();

  // Approved and rejected squads block player deletes. Clear that lock first
  // so the registration and every player row can be removed.
  if (isSquadLocked(existing.status)) {
    const { error: unlockError } = await supabase
      .from('tournament_registrations')
      .update({ status: 'submitted' })
      .eq('id', id);
    if (unlockError) throw new Error(unlockError.message);
  }

  const { error: playersError } = await supabase
    .from('tournament_players')
    .delete()
    .eq('registration_id', id);
  if (playersError) {
    throw new Error(playersError.message.includes('SQUAD_LOCKED') ? 'SQUAD_LOCKED' : playersError.message);
  }

  const { error } = await supabase.from('tournament_registrations').delete().eq('id', id);
  if (error) throw new Error(error.message);

  return existing;
}

export async function updateTournamentRegistrationStatus(
  id: string,
  status: TournamentRegistrationStatus,
): Promise<TournamentRegistration> {
  if (!isSupabaseServiceConfigured()) throw new Error('DATABASE_NOT_CONFIGURED');

  const supabase = await getServiceSupabase();
  const { data, error } = await supabase
    .from('tournament_registrations')
    .update({ status })
    .eq('id', id)
    .select(REGISTRATION_SELECT)
    .single();

  if (error || !data) throw new Error(error?.message || 'Update failed');
  return mapRegistration(data);
}
