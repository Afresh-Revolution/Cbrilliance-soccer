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

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
