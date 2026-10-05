import { generateMediaKey, uploadFile } from '@/lib/storage/b2';
import { detectUploadMimeFromBytes, isAllowedUpload } from '@/lib/security/sanitize';

const MAX_TOURNAMENT_UPLOAD_BYTES = 5 * 1024 * 1024;

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const RECEIPT_MIME = new Set([...IMAGE_MIME, 'application/pdf']);

export class TournamentUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TournamentUploadError';
  }
}

async function storeFile(file: File, folder: string, allowed: Set<string>): Promise<string> {
  if (file.size > MAX_TOURNAMENT_UPLOAD_BYTES) {
    throw new TournamentUploadError('File exceeds the 5MB limit');
  }

  const mimeType = file.type.toLowerCase();
  if (!allowed.has(mimeType) || !isAllowedUpload(file.name, mimeType)) {
    throw new TournamentUploadError('File type is not allowed');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const header = buffer.subarray(0, 12);
  const detected = detectUploadMimeFromBytes(
    header.buffer.slice(header.byteOffset, header.byteOffset + header.byteLength),
    mimeType,
  );
  if (!detected || detected !== mimeType) {
    throw new TournamentUploadError('File content does not match a supported type');
  }

  const key = generateMediaKey(folder, file.name);
  return uploadFile(key, buffer, mimeType, { folder, filename: file.name });
}

export function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

export function storeTeamLogo(file: File): Promise<string> {
  return storeFile(file, 'tournament-logos', IMAGE_MIME);
}

export function storePaymentReceipt(file: File): Promise<string> {
  return storeFile(file, 'tournament-receipts', RECEIPT_MIME);
}
