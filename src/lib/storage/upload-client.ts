import { fetchCsrfToken, postWithCsrf } from '@/lib/auth/csrf-client';
import { detectImageMimeFromBytes } from '@/lib/security/sanitize';

const MAX_BYTES = 10 * 1024 * 1024;

async function validateImageFileSignature(file: File): Promise<boolean> {
  if (!file.type.startsWith('image/')) return false;
  const header = await file.slice(0, 12).arrayBuffer();
  const detected = detectImageMimeFromBytes(header);
  return detected !== null && detected === file.type.toLowerCase();
}

function b2FileName(key: string): string {
  return key.split('/').map((part) => encodeURIComponent(part)).join('/');
}

async function sha1Hex(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hash = await crypto.subtle.digest('SHA-1', buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

type PresignResponse = {
  key: string;
  uploadUrl: string;
  authorizationToken: string;
  contentType: string;
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
  const { ok, data } = await postWithCsrf<PresignResponse>(
    '/api/upload',
    {
      filename: file.name,
      contentType: file.type,
      folder: options?.folder ?? 'media',
      fileSize: file.size,
    },
    csrf,
  );

  if (!ok || !data.publicUrl) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Upload failed');
  }

  const sha1 = await sha1Hex(file);
  const uploadResponse = await fetch(data.uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: data.authorizationToken,
      'X-Bz-File-Name': b2FileName(data.key),
      'Content-Type': data.contentType,
      'X-Bz-Content-Sha1': sha1,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload file to storage');
  }

  return data.publicUrl;
}
