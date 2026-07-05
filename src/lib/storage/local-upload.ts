import fs from 'fs/promises';
import path from 'path';
import { sanitizeFolder } from '@/lib/security/sanitize';

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads');

function buildKey(folder: string, filename: string): string {
  const safeFolder = sanitizeFolder(folder);
  const ext = (filename.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${safeFolder}/${unique}.${ext || 'bin'}`;
}

/** Dev/local fallback — writes to public/uploads and returns a site-relative URL. */
export async function uploadFileLocal(
  folder: string,
  filename: string,
  body: Buffer | Uint8Array,
): Promise<{ key: string; publicUrl: string }> {
  const relativeKey = buildKey(folder, filename);
  const filePath = path.join(UPLOAD_ROOT, relativeKey);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, body);
  return {
    key: `uploads/${relativeKey}`,
    publicUrl: `/uploads/${relativeKey}`,
  };
}
