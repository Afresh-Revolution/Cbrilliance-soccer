/** Backblaze B2 object keys for CBFC media (upload via `bun run upload-cbfc-assets`). */
export const CBFC_MEDIA_KEYS = {
  logo: 'cbfc/logo/cbfc-logo.png',
  tata: {
    side: 'cbfc/players/tata-side.png',
    action: 'cbfc/players/tata-action.png',
    action2: 'cbfc/players/tata-action2.png',
    back: 'cbfc/players/tata-back.png',
  },
  chocho: {
    side: 'cbfc/players/chocho-side.png',
    action: 'cbfc/players/chocho-action.png',
    back: 'cbfc/players/chocho-back.png',
  },
} as const;

const LOCAL_MEDIA: Record<string, string> = {
  [CBFC_MEDIA_KEYS.logo]: '/media/CBFC Logo.png',
  'cbfc/logo/cbfc-logo.jpg': '/media/CBFC Logo.png',
  [CBFC_MEDIA_KEYS.tata.side]: '/media/Tata-side.png',
  [CBFC_MEDIA_KEYS.tata.action]: '/media/Tata-action.png',
  [CBFC_MEDIA_KEYS.tata.action2]: '/media/Tata-action2.png',
  [CBFC_MEDIA_KEYS.tata.back]: '/media/Tata-back.png',
  [CBFC_MEDIA_KEYS.chocho.side]: '/media/Chocho-side.png',
  [CBFC_MEDIA_KEYS.chocho.action]: '/media/Chocho-action.png',
  [CBFC_MEDIA_KEYS.chocho.back]: '/media/Chocho-back.png',
};

const MEDIA_KEY_PREFIXES = ['cbfc/', 'gallery/', 'media/'] as const;

export function shouldUseB2Media(): boolean {
  const base = process.env.NEXT_PUBLIC_B2_PUBLIC_URL;
  return (
    Boolean(base) &&
    (process.env.NEXT_PUBLIC_USE_B2_MEDIA === 'true' || process.env.NODE_ENV === 'production')
  );
}

function b2UrlForKey(key: string): string {
  const base = process.env.NEXT_PUBLIC_B2_PUBLIC_URL!.replace(/\/$/, '');
  return `${base}/${key}`;
}

export function mediaProxyPath(key: string): string {
  return `/api/media/${key.split('/').map(encodeURIComponent).join('/')}`;
}

/** Extract a B2 object key from a stored URL or key string. */
export function extractMediaKey(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (LOCAL_MEDIA[trimmed]) return trimmed;

  const base = process.env.NEXT_PUBLIC_B2_PUBLIC_URL?.replace(/\/$/, '');
  if (base && trimmed.startsWith(`${base}/`)) {
    return trimmed.slice(base.length + 1);
  }

  const fileMarker = '/file/';
  const fileIdx = trimmed.indexOf(fileMarker);
  if (fileIdx !== -1) {
    const afterBucket = trimmed.slice(fileIdx + fileMarker.length);
    const slash = afterBucket.indexOf('/');
    if (slash !== -1) return afterBucket.slice(slash + 1);
  }

  for (const prefix of MEDIA_KEY_PREFIXES) {
    const idx = trimmed.indexOf(prefix);
    if (idx !== -1) return trimmed.slice(idx);
  }

  return null;
}

export function isRemoteMediaUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}

/** Normalize any media reference to the canonical B2 public URL for database storage. */
export function canonicalMediaStorageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';

  const base = process.env.NEXT_PUBLIC_B2_PUBLIC_URL?.replace(/\/$/, '');
  const key = extractMediaKey(trimmed);

  if (key && base) return `${base}/${key}`;

  for (const [mediaKey, path] of Object.entries(LOCAL_MEDIA)) {
    if (trimmed === path && base) return `${base}/${mediaKey}`;
  }

  return trimmed;
}

/**
 * Resolve any stored media reference (B2 URL, object key, or local path)
 * to the correct URL for the current environment.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url?.trim()) return '';

  const trimmed = url.trim();
  const key = extractMediaKey(trimmed);

  if (key) {
    const localPath = LOCAL_MEDIA[key];
    if (localPath && !shouldUseB2Media()) return localPath;
    if (shouldUseB2Media()) return b2UrlForKey(key);
    return mediaProxyPath(key);
  }

  if (trimmed.startsWith('/')) return trimmed;

  for (const [mediaKey, path] of Object.entries(LOCAL_MEDIA)) {
    const filename = mediaKey.split('/').pop();
    if (filename && trimmed.includes(filename)) return path;
  }

  return trimmed;
}

/** Skip Next.js image optimization for B2 and proxied media URLs. */
export function shouldBypassImageOptimizer(url: string): boolean {
  const resolved = resolveMediaUrl(url);
  return isRemoteMediaUrl(resolved) || resolved.startsWith('/api/media/');
}

export function resolveMediaUrls(urls: string[] | null | undefined): string[] {
  return (urls ?? []).map(resolveMediaUrl).filter(Boolean);
}

export const CBFC_MEDIA = {
  logo: resolveMediaUrl(CBFC_MEDIA_KEYS.logo),
  tata: {
    side: resolveMediaUrl(CBFC_MEDIA_KEYS.tata.side),
    action: resolveMediaUrl(CBFC_MEDIA_KEYS.tata.action),
    action2: resolveMediaUrl(CBFC_MEDIA_KEYS.tata.action2),
    back: resolveMediaUrl(CBFC_MEDIA_KEYS.tata.back),
  },
  chocho: {
    side: resolveMediaUrl(CBFC_MEDIA_KEYS.chocho.side),
    action: resolveMediaUrl(CBFC_MEDIA_KEYS.chocho.action),
    back: resolveMediaUrl(CBFC_MEDIA_KEYS.chocho.back),
  },
};

export const CBFC_FALLBACK_PLAYER_PHOTO = CBFC_MEDIA.tata.side;
