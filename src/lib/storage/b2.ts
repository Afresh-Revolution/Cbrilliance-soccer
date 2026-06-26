import { uploadFileNative, deleteFileNative, createNativeUpload } from '@/lib/storage/b2-native';
import { sanitizeFolder } from '@/lib/security/sanitize';

export { getPublicUrl } from '@/lib/storage/b2-native';

export async function getUploadUrl(key: string, contentType: string) {
  return createNativeUpload(key, contentType);
}

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  return uploadFileNative(key, body, contentType);
}

export async function deleteFile(key: string): Promise<void> {
  await deleteFileNative(key);
}

export function generateMediaKey(folder: string, filename: string): string {
  const safeFolder = sanitizeFolder(folder);
  const ext = (filename.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${safeFolder}/${unique}.${ext || 'bin'}`;
}
