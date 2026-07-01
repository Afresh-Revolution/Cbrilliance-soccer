const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPE[char] ?? char);
}

export function sanitizeText(value: string, maxLength = 5000): string {
  return escapeHtml(value.trim().slice(0, maxLength));
}

export function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

export function sanitizeFolder(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-_]/g, '').slice(0, 40) || 'media';
}

const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'pdf',
]);

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'application/pdf',
]);

export function isAllowedUpload(filename: string, contentType: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ALLOWED_EXTENSIONS.has(ext) && ALLOWED_MIME_TYPES.has(contentType.toLowerCase());
}

/** Magic-byte sniffing for common image types (client-side pre-upload check). */
const MAGIC_SIGNATURES: { mime: string; bytes: number[] }[] = [
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff] },
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] },
];

export function detectImageMimeFromBytes(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer.slice(0, 12));
  for (const sig of MAGIC_SIGNATURES) {
    if (sig.bytes.every((byte, i) => bytes[i] === byte)) {
      if (sig.mime === 'image/webp') {
        const webp = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
        return webp === 'WEBP' ? 'image/webp' : null;
      }
      return sig.mime;
    }
  }
  return null;
}

/** Magic-byte sniffing for video and PDF uploads. */
export function detectUploadMimeFromBytes(buffer: ArrayBuffer, declaredMime: string): string | null {
  const image = detectImageMimeFromBytes(buffer);
  if (image) return image;

  const bytes = new Uint8Array(buffer.slice(0, 12));
  const ascii = String.fromCharCode(...bytes);

  if (declaredMime === 'application/pdf' && ascii.startsWith('%PDF-')) {
    return 'application/pdf';
  }

  if (declaredMime === 'video/mp4') {
    const box = ascii.slice(4, 8);
    if (box === 'ftyp' || box === 'moov' || box === 'mdat') {
      return 'video/mp4';
    }
  }

  if (declaredMime === 'video/webm' && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return 'video/webm';
  }

  return null;
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
