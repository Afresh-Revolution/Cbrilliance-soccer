import type { UserRole, Profile } from '@/types';
import { createClient, createServiceClient } from '@/lib/db/supabase/server';
import { isSupabaseApiConfigured, isSupabaseServiceConfigured } from '@/lib/db/env';
import { roleFromAuthUser, isAdminRole } from '@/lib/auth/rbac';
export interface AuthContext {
  userId: string;
  email: string;
  profile: Profile;
}

function mapProfile(row: {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name ?? '',
    role: row.role as UserRole,
    createdAt: row.created_at,
  };
}

export async function getAuthUser() {
  if (!isSupabaseApiConfigured()) return null;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseApiConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return mapProfile(data);
}

/** Server-only profile lookup — bypasses RLS (login bootstrap, admin checks). */
export async function getProfileWithServiceRole(userId: string): Promise<Profile | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfile(data);
}

/** Ensures an auth user has a profile row matching their invited admin role. */
export async function ensureAdminProfile(userId: string, email: string): Promise<Profile | null> {
  if (!isSupabaseServiceConfigured()) return null;

  const existing = await getProfileWithServiceRole(userId);
  if (existing) {
    const supabase = await createServiceClient();
    await supabase.auth.admin.updateUserById(userId, {
      app_metadata: { role: existing.role },
    });
    return existing;
  }

  const supabase = await createServiceClient();
  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
  if (userError || !userData.user) return null;

  const metaRole = roleFromAuthUser(userData.user);
  if (!metaRole || !isAdminRole(metaRole)) return null;

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email,
      full_name: (userData.user.user_metadata?.full_name as string) || 'CBFC Admin',
      role: metaRole,
    })
    .select('id, email, full_name, role, created_at')
    .single();

  if (error || !data) return null;

  await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role: data.role },
  });

  return mapProfile(data);
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const user = await getAuthUser();
  if (!user?.email) return null;

  const profile = await getProfile(user.id);
  if (profile) {
    return { userId: user.id, email: user.email, profile };
  }

  const metaRole = roleFromAuthUser(user);
  if (!metaRole) return null;

  return {
    userId: user.id,
    email: user.email,
    profile: {
      id: user.id,
      email: user.email,
      fullName: (user.user_metadata?.full_name as string) ?? '',
      role: metaRole,
      createdAt: user.created_at ?? new Date().toISOString(),
    },
  };
}

export async function requireAuthContext(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) {
    throw new Error('UNAUTHORIZED');
  }
  return ctx;
}
