import { uploadFileNative, deleteFileNative, downloadFileNative } from '@/lib/storage/b2-native';
import { isB2Configured } from '@/lib/storage/env';
import { uploadFileLocal } from '@/lib/storage/local-upload';
import { sanitizeFolder } from '@/lib/security/sanitize';

export { getPublicUrl } from '@/lib/storage/b2-native';
export { isB2Configured } from '@/lib/storage/env';

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
  options?: { folder?: string; filename?: string },
): Promise<string> {
  if (isB2Configured()) {
    return uploadFileNative(key, body, contentType);
  }

  const folder = options?.folder ?? key.split('/')[0] ?? 'media';
  const filename = options?.filename ?? key.split('/').pop() ?? 'upload.bin';
  const local = await uploadFileLocal(folder, filename, body);
  return local.publicUrl;
}

export async function deleteFile(key: string): Promise<void> {
  if (!isB2Configured()) return;
  await deleteFileNative(key);
}

export async function downloadFile(
  key: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  if (!isB2Configured()) {
    throw new Error('B2_NOT_CONFIGURED');
  }
  return downloadFileNative(key);
}

export function generateMediaKey(folder: string, filename: string): string {
  const safeFolder = sanitizeFolder(folder);
  const ext = (filename.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${safeFolder}/${unique}.${ext || 'bin'}`;
}
