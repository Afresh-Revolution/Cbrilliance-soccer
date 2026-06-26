/** Backblaze B2 object keys for CBFC media (upload via `bun run upload-cbfc-assets`). */
export const CBFC_MEDIA_KEYS = {
  logo: 'cbfc/logo/cbfc-logo.jpg',
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
  [CBFC_MEDIA_KEYS.logo]: '/media/CBFC%20Logo.jpg',
  [CBFC_MEDIA_KEYS.tata.side]: '/media/Tata-side.png',
  [CBFC_MEDIA_KEYS.tata.action]: '/media/Tata-action.png',
  [CBFC_MEDIA_KEYS.tata.action2]: '/media/Tata-action2.png',
  [CBFC_MEDIA_KEYS.tata.back]: '/media/Tata-back.png',
  [CBFC_MEDIA_KEYS.chocho.side]: '/media/Chocho-side.png',
  [CBFC_MEDIA_KEYS.chocho.action]: '/media/Chocho-action.png',
  [CBFC_MEDIA_KEYS.chocho.back]: '/media/Chocho-back.png',
};

export function b2MediaUrl(key: string): string {
  const local = LOCAL_MEDIA[key] || '';
  const base = process.env.NEXT_PUBLIC_B2_PUBLIC_URL;
  const useB2 =
    process.env.NEXT_PUBLIC_USE_B2_MEDIA === 'true' ||
    process.env.NODE_ENV === 'production';

  if (useB2 && base) return `${base.replace(/\/$/, '')}/${key}`;
  return local;
}

export const CBFC_MEDIA = {
  logo: b2MediaUrl(CBFC_MEDIA_KEYS.logo),
  tata: {
    side: b2MediaUrl(CBFC_MEDIA_KEYS.tata.side),
    action: b2MediaUrl(CBFC_MEDIA_KEYS.tata.action),
    action2: b2MediaUrl(CBFC_MEDIA_KEYS.tata.action2),
    back: b2MediaUrl(CBFC_MEDIA_KEYS.tata.back),
  },
  chocho: {
    side: b2MediaUrl(CBFC_MEDIA_KEYS.chocho.side),
    action: b2MediaUrl(CBFC_MEDIA_KEYS.chocho.action),
    back: b2MediaUrl(CBFC_MEDIA_KEYS.chocho.back),
  },
};

export const CBFC_FALLBACK_PLAYER_PHOTO = CBFC_MEDIA.tata.side;
