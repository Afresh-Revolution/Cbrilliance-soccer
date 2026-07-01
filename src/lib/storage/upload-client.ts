import { fetchCsrfToken } from '@/lib/auth/csrf-client';
import { detectImageMimeFromBytes } from '@/lib/security/sanitize';

const MAX_BYTES = 10 * 1024 * 1024;

async function validateImageFileSignature(file: File): Promise<boolean> {
  if (!file.type.startsWith('image/')) return false;
  const header = await file.slice(0, 12).arrayBuffer();
  const detected = detectImageMimeFromBytes(header);
  return detected !== null && detected === file.type.toLowerCase();
}

type UploadResponse = {
  key: string;
  publicUrl: string;
  error?: string;
};

export async function uploadMediaFile(
  file: File,
  options?: { folder?: string },
): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error('File exceeds maximum size of 10MB');
  }

  if (file.type.startsWith('image/') && !(await validateImageFileSignature(file))) {
    throw new Error('File content does not match a supported image type');
  }

  const csrf = await fetchCsrfToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', options?.folder ?? 'media');

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'x-csrf-token': csrf },
    credentials: 'include',
    body: formData,
  });

  const data = (await response.json()) as UploadResponse;
  if (!response.ok || !data.publicUrl) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Upload failed');
  }

  return data.publicUrl;
}
