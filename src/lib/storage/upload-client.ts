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

export interface UploadMediaOptions {
  folder?: string;
  onProgress?: (percent: number) => void;
}

export async function uploadMediaFile(
  file: File,
  options?: UploadMediaOptions,
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

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    xhr.withCredentials = true;
    xhr.setRequestHeader('x-csrf-token', csrf);

    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable || !options?.onProgress) return;
      options.onProgress(Math.round((event.loaded / event.total) * 100));
    });

    xhr.addEventListener('load', () => {
      let data: UploadResponse = { key: '', publicUrl: '' };
      try {
        data = JSON.parse(xhr.responseText) as UploadResponse;
      } catch {
        reject(new Error('Upload failed'));
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300 || !data.publicUrl) {
        const message = typeof data.error === 'string'
          ? data.error
          : xhr.status >= 500
            ? 'Server error during upload. Refresh the page and try again.'
            : 'Upload failed';
        reject(new Error(message));
        return;
      }

      options?.onProgress?.(100);
      resolve(data.publicUrl);
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    xhr.send(formData);
  });
}
