# CBFC — Community Based Football Club

Premium football ecosystem platform built with Next.js 15, Supabase, and Backblaze B2.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **SCSS** modular architecture (no Tailwind)
- **Framer Motion** animations
- **Supabase** (PostgreSQL + Auth)
- **Backblaze B2** (S3-compatible media storage)

## Getting Started

```bash
bun install
cp .env.example .env.local
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands: `bun run build`, `bun run start`, `bun run lint`.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values from the Supabase dashboard.

### Supabase — two connection types

| Variable | Where to find it | Used for |
|----------|------------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → **API** → Project URL | App auth, REST queries, storage (`@supabase/supabase-js`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Settings → **API** → publishable key | Browser + server Supabase client |
| `SUPABASE_SECRET_KEY` | Settings → **API** → secret key | Server-only writes (forms, admin, audit logs) |
| `DATABASE_URL` | Settings → **Database** → Connection string | Direct Postgres (migrations, `psql`, ORMs) |

Legacy names `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` still work.

The pooler/session URL goes in `DATABASE_URL`. The app uses the API URL + keys for Supabase JS client access.

### Backblaze B2

| Variable | Description |
|----------|-------------|
| `B2_APPLICATION_KEY_ID` | Backblaze key ID |
| `B2_APPLICATION_KEY` | Backblaze application key |
| `B2_BUCKET_NAME` | B2 bucket name |
| `B2_ENDPOINT` | B2 S3 endpoint |
| `NEXT_PUBLIC_B2_PUBLIC_URL` | Public URL for uploaded files |

Without Supabase API keys configured, the app runs with built-in seed/mock data.

## Database Setup

1. Run `supabase/schema.sql` in the Supabase **SQL Editor**, or connect with the session pooler:

```bash
psql "$DATABASE_URL" -f supabase/schema.sql
```

2. Add your **publishable** and **secret** keys from Settings → API to `.env`.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Cinematic homepage |
| `/academy` | Academy programmes & registration |
| `/players` | Player directory with filters |
| `/player/[slug]` | Full player profile |
| `/agency` | Agency services & scout inquiry |
| `/club` | Professional club section |
| `/video-hub` | Scouting video library |
| `/player-movement` | Player pathway tracker |
| `/news` | News & media center |
| `/contact` | Contact form |
| `/admin` | Role-based admin dashboard |

## Project Structure

```
src/
  app/           # Next.js routes (public + admin + API)
  components/    # Reusable UI components
  features/      # Feature modules
  lib/           # DB, storage, validators, data layer
  styles/        # SCSS architecture
  types/         # TypeScript interfaces
supabase/        # Database schema
```

## Media Uploads

Use `POST /api/upload` with `{ filename, contentType, folder }` to get a presigned Backblaze B2 upload URL.

To publish CBFC player photos and logo from `assets/media/` to B2 and sync Supabase:

```bash
bun --env-file=.env run upload-cbfc-assets
```

In local dev, images are served from `public/media/` until production (or set `NEXT_PUBLIC_USE_B2_MEDIA=true` to test B2 URLs locally).

## Admin

1. Create a user in Supabase Auth
2. Insert a profile row with the desired role (`super_admin`, `content_admin`, `academy_staff`)
3. Sign in at `/admin/login`
