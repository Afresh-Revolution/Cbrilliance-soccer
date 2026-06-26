import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getEncryptionKey(): Buffer | null {
  const raw = process.env.SECRETS_ENCRYPTION_KEY?.trim();
  if (!raw || raw.length < 16) return null;
  return createHash('sha256').update(raw).digest();
}

/** Encrypt sensitive values at rest (e.g. stored credentials). Requires SECRETS_ENCRYPTION_KEY. */
export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  if (!key) {
    throw new Error('SECRETS_ENCRYPTION_KEY is not configured');
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `enc:v1:${iv.toString('base64url')}:${tag.toString('base64url')}:${encrypted.toString('base64url')}`;
}

/** Decrypt values produced by encryptSecret. */
export function decryptSecret(payload: string): string {
  const key = getEncryptionKey();
  if (!key) {
    throw new Error('SECRETS_ENCRYPTION_KEY is not configured');
  }

  if (!payload.startsWith('enc:v1:')) {
    throw new Error('Invalid encrypted payload');
  }

  const [, , ivB64, tagB64, dataB64] = payload.split(':');
  const iv = Buffer.from(ivB64, 'base64url');
  const tag = Buffer.from(tagB64, 'base64url');
  const data = Buffer.from(dataB64, 'base64url');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}

/** One-way hash for comparing secrets without storing plaintext. */
export function hashSecret(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function isSecretsEncryptionConfigured(): boolean {
  return getEncryptionKey() !== null;
}
