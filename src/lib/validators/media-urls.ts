import { z } from 'zod';

const BLOCKED_PROTOCOL = /^(javascript|data|vbscript|file):/i;

const EMBED_VIDEO_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'vimeo.com',
  'www.vimeo.com',
  'player.vimeo.com',
]);

function isAllowedVideoHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (EMBED_VIDEO_HOSTS.has(host)) return true;
  if (host.endsWith('.youtube.com') || host.endsWith('.youtube-nocookie.com')) return true;
  if (host.endsWith('.vimeo.com')) return true;
  if (host.includes('backblazeb2.com') || host.includes('backblaze.com')) return true;
  return false;
}

export function isSafeMediaUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (BLOCKED_PROTOCOL.test(trimmed)) return false;
  if (trimmed.startsWith('/')) return !trimmed.includes('..');

  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function isSafeVideoEmbedUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || BLOCKED_PROTOCOL.test(trimmed)) return false;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    return isAllowedVideoHost(url.hostname);
  } catch {
    return false;
  }
}

export const safeMediaUrlSchema = z
  .string()
  .max(2048)
  .refine(isSafeMediaUrl, 'Invalid media URL');

export const safeVideoUrlSchema = z
  .string()
  .min(5)
  .max(2048)
  .refine(isSafeVideoEmbedUrl, 'Video URL must be a valid HTTPS embed or media link');

export const optionalSafeMediaUrlSchema = safeMediaUrlSchema.optional().or(z.literal(''));
