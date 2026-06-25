/**
 * One-time admin bootstrap. Run:
 *   ADMIN_SEED_EMAIL=you@example.com ADMIN_SEED_PASSWORD='YourPass123' bun run seed-admin
 */
import { createClient } from '@supabase/supabase-js';
import { SQL } from 'bun';
import {
  getSupabaseApiUrl,
  getSupabaseServiceRoleKey,
  getSupabaseSecretKeyError,
  getDatabaseUrl,
} from '../src/lib/db/env';

const url = getSupabaseApiUrl();
const serviceKey = getSupabaseServiceRoleKey();
const secretKeyError = getSupabaseSecretKeyError();
const email = process.env.ADMIN_SEED_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_SEED_PASSWORD;
const databaseUrl = getDatabaseUrl();

if (!url) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL in .env');
  process.exit(1);
}

if (secretKeyError || !serviceKey) {
  console.error(secretKeyError ?? 'Missing SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

if (!email || !password) {
  console.error('Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD before running seed-admin.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserIdByEmail(targetEmail: string): Promise<string | null> {
  if (!databaseUrl) return null;

  try {
    const sql = new SQL(databaseUrl);
    const rows = await sql`
      SELECT id::text AS id
      FROM auth.users
      WHERE lower(email) = lower(${targetEmail})
      LIMIT 1
    `;
    return rows[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function upsertProfile(userId: string, adminEmail: string) {
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    email: adminEmail,
    full_name: 'CBFC Admin',
    role: 'super_admin',
  });

  if (profileError) throw profileError;

  await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role: 'super_admin' },
  });
}

async function main() {
  const adminEmail = email!;

  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: password!,
    email_confirm: true,
    user_metadata: { full_name: 'CBFC Admin', role: 'super_admin' },
  });

  if (!error && data.user) {
    await upsertProfile(data.user.id, adminEmail);
    console.log(`Created admin user: ${adminEmail}`);
    return;
  }

  const alreadyExists =
    error?.message?.toLowerCase().includes('already') ||
    error?.message?.toLowerCase().includes('registered') ||
    error?.status === 422;

  if (!alreadyExists) {
    throw error ?? new Error('Failed to create admin user');
  }

  const existingId = await findUserIdByEmail(adminEmail);
  if (!existingId) {
    throw new Error(
      `User ${adminEmail} already exists but could not be looked up. ` +
        'Ensure DATABASE_URL is set in .env, then run seed-admin again.',
    );
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(existingId, {
    password: password!,
    email_confirm: true,
  });
  if (updateError) throw updateError;

  await upsertProfile(existingId, adminEmail);
  console.log(`Updated existing admin user: ${adminEmail}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
