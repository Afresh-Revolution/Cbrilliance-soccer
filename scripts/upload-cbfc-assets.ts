/**
 * Upload CBFC media from assets/media to Backblaze B2 and sync Supabase content URLs.
 * Run: bun --env-file=.env run upload-cbfc-assets
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { uploadFile, getPublicUrl } from '../src/lib/storage/b2';
import { remoteFileExists } from '../src/lib/storage/b2-native';
import { CBFC_MEDIA_KEYS } from '../src/lib/data/cbfc-media';
import {
  getSupabaseApiUrl,
  getSupabaseServiceRoleKey,
  isSupabaseApiConfigured,
} from '../src/lib/db/env';

const ROOT = join(import.meta.dir, '..');
const MEDIA_DIR = join(ROOT, 'assets', 'media');

const UPLOADS: { file: string; key: string; contentType: string }[] = [
  { file: 'CBFC Logo.jpg', key: CBFC_MEDIA_KEYS.logo, contentType: 'image/jpeg' },
  { file: 'Tata-side.png', key: CBFC_MEDIA_KEYS.tata.side, contentType: 'image/png' },
  { file: 'Tata-action.png', key: CBFC_MEDIA_KEYS.tata.action, contentType: 'image/png' },
  { file: 'Tata-action2.png', key: CBFC_MEDIA_KEYS.tata.action2, contentType: 'image/png' },
  { file: 'Tata-back.png', key: CBFC_MEDIA_KEYS.tata.back, contentType: 'image/png' },
  { file: 'Chocho-side.png', key: CBFC_MEDIA_KEYS.chocho.side, contentType: 'image/png' },
  { file: 'Chocho-action.png', key: CBFC_MEDIA_KEYS.chocho.action, contentType: 'image/png' },
  { file: 'Chocho-back.png', key: CBFC_MEDIA_KEYS.chocho.back, contentType: 'image/png' },
];

async function uploadAll(): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};

  for (const item of UPLOADS) {
    const existingUrl = getPublicUrl(item.key);
    if (await remoteFileExists(existingUrl)) {
      urls[item.key] = existingUrl;
      console.log(`Skipped ${item.file} (already on B2)`);
      continue;
    }

    const filePath = join(MEDIA_DIR, item.file);
    if (!existsSync(filePath)) {
      console.error(`Missing file: ${filePath}`);
      process.exit(1);
    }

    const body = readFileSync(filePath);
    const url = await uploadFile(item.key, body, item.contentType);
    urls[item.key] = url;
    console.log(`Uploaded ${item.file} → ${url}`);

    // Brief pause between uploads to avoid connection churn on Windows/Bun.
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return urls;
}

async function syncSupabase(urls: Record<string, string>) {
  if (!isSupabaseApiConfigured()) {
    console.log('Supabase not configured — skipped database sync.');
    return;
  }

  const url = getSupabaseApiUrl()!;
  const key = getSupabaseServiceRoleKey();
  if (!key) {
    console.log('Missing SUPABASE_SECRET_KEY — skipped database sync.');
    return;
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const tataPhoto = urls[CBFC_MEDIA_KEYS.tata.side];
  const chochoPhoto = urls[CBFC_MEDIA_KEYS.chocho.side];
  const tataImages = [
    urls[CBFC_MEDIA_KEYS.tata.action],
    urls[CBFC_MEDIA_KEYS.tata.action2],
    urls[CBFC_MEDIA_KEYS.tata.back],
  ];
  const chochoImages = [
    urls[CBFC_MEDIA_KEYS.chocho.action],
    urls[CBFC_MEDIA_KEYS.chocho.back],
  ];

  const players = [
    {
      full_name: 'Tata',
      slug: 'tata',
      profile_photo: tataPhoto,
      date_of_birth: '2006-03-15',
      nationality: 'Nigeria',
      position: 'forward',
      height: '1.82m',
      weight: '76kg',
      preferred_foot: 'right',
      biography:
        'A dynamic forward with exceptional pace and finishing ability. Tata has progressed through the CBFC development pathway and is known for clinical finishing and intelligent movement off the ball.',
      strengths: { pace: 92, vision: 78, passing: 75, dribbling: 85, finishing: 88, tackling: 45, leadership: 70, strength: 72 },
      statistics: { matchesPlayed: 48, goals: 32, assists: 12, cleanSheets: 0, minutesPlayed: 3840 },
      achievements: [],
      previous_clubs: [{ id: 'c1', name: 'CBFC Academy', period: '2020 - Present' }],
      videos: [],
      images: tataImages,
      movement_history: [{ id: 'm1', type: 'academy_entry', title: 'Joined CBFC Academy', date: '2020-09-01' }],
      status: 'on_trial',
      academy_graduate: true,
      professional_player: false,
      featured: true,
    },
    {
      full_name: 'Chocho',
      slug: 'chocho',
      profile_photo: chochoPhoto,
      date_of_birth: '2005-08-22',
      nationality: 'Nigeria',
      position: 'midfielder',
      height: '1.78m',
      weight: '72kg',
      preferred_foot: 'both',
      biography:
        'An elegant midfielder with exceptional vision and passing range. Chocho controls the tempo of games and has been a standout performer in the CBFC setup.',
      strengths: { pace: 75, vision: 92, passing: 90, dribbling: 82, finishing: 70, tackling: 78, leadership: 85, strength: 74 },
      statistics: { matchesPlayed: 62, goals: 8, assists: 24, cleanSheets: 0, minutesPlayed: 5200 },
      achievements: [],
      previous_clubs: [{ id: 'c2', name: 'CBFC Academy', period: '2019 - Present' }],
      videos: [],
      images: chochoImages,
      movement_history: [{ id: 'm2', type: 'academy_entry', title: 'Joined CBFC Academy', date: '2019-09-01' }],
      status: 'in_development',
      academy_graduate: true,
      professional_player: false,
      featured: true,
    },
  ];

  for (const player of players) {
    const { error } = await supabase.from('players').upsert(player, { onConflict: 'slug' });
    if (error) console.warn(`Player sync (${player.slug}):`, error.message);
    else console.log(`Synced player: ${player.full_name}`);
  }

  const gallery = [
    { title: 'Tata — In Action', image_url: urls[CBFC_MEDIA_KEYS.tata.action], category: 'training', sort_order: 1 },
    { title: 'Tata — Match Day', image_url: urls[CBFC_MEDIA_KEYS.tata.action2], category: 'matchday', sort_order: 2 },
    { title: 'Chocho — In Action', image_url: urls[CBFC_MEDIA_KEYS.chocho.action], category: 'training', sort_order: 3 },
    { title: 'Chocho — Tournament', image_url: urls[CBFC_MEDIA_KEYS.chocho.back], category: 'tournament', sort_order: 4 },
  ];

  await supabase.from('gallery_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: galleryError } = await supabase.from('gallery_items').insert(gallery);
  if (galleryError) console.warn('Gallery sync:', galleryError.message);
  else console.log('Synced gallery items');

  const { data: newsRows } = await supabase.from('news_articles').select('id, slug');
  if (newsRows?.length) {
    const coverBySlug: Record<string, string> = {
      'cbfc-academy-elite-summer-programme-2025': urls[CBFC_MEDIA_KEYS.tata.action],
      'marcus-okonkwo-european-trial': urls[CBFC_MEDIA_KEYS.tata.side],
      'cbfc-professional-victory': urls[CBFC_MEDIA_KEYS.chocho.action],
      'international-scouting-network-expands': urls[CBFC_MEDIA_KEYS.chocho.back],
    };

    for (const row of newsRows) {
      const cover = coverBySlug[row.slug];
      if (!cover) continue;
      await supabase.from('news_articles').update({ cover_image: cover }).eq('id', row.id);
    }
    console.log('Updated news cover images where slugs matched');
  }

  const { data: videoRows } = await supabase.from('videos').select('id, title');
  if (videoRows?.length) {
    for (const row of videoRows) {
      const thumb = row.title.toLowerCase().includes('chocho')
        ? chochoPhoto
        : tataPhoto;
      await supabase.from('videos').update({ thumbnail: thumb }).eq('id', row.id);
    }
    console.log('Updated video thumbnails');
  }

  await supabase
    .from('players')
    .update({ profile_photo: tataPhoto })
    .like('profile_photo', '%unsplash.com%');

  await supabase
    .from('news_articles')
    .update({ cover_image: urls[CBFC_MEDIA_KEYS.tata.action] })
    .like('cover_image', '%unsplash.com%');

  await supabase
    .from('videos')
    .update({ thumbnail: tataPhoto })
    .like('thumbnail', '%unsplash.com%');

  console.log('Replaced remaining Unsplash URLs in Supabase');
}

async function main() {
  if (!process.env.B2_APPLICATION_KEY_ID || !process.env.NEXT_PUBLIC_B2_PUBLIC_URL) {
    console.error('Set B2 credentials and NEXT_PUBLIC_B2_PUBLIC_URL in .env');
    process.exit(1);
  }

  const urls = await uploadAll();
  await syncSupabase(urls);
  console.log('\nDone. Restart the dev server to pick up media URLs.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
