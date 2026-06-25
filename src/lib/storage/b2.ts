import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getB2Client() {
  return new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.B2_REGION || 'us-west-004',
    credentials: {
      accessKeyId: process.env.B2_APPLICATION_KEY_ID!,
      secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
  });
}

export function getPublicUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_B2_PUBLIC_URL;
  if (!base) return key;
  return `${base.replace(/\/$/, '')}/${key}`;
}

export async function getUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const client = getB2Client();
  const command = new PutObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn });
}

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const client = getB2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return getPublicUrl(key);
}

export async function deleteFile(key: string): Promise<void> {
  const client = getB2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME!,
      Key: key,
    })
  );
}

import { sanitizeFolder } from '@/lib/security/sanitize';

export function generateMediaKey(
  folder: string,
  filename: string,
): string {
  const safeFolder = sanitizeFolder(folder);
  const ext = (filename.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${safeFolder}/${unique}.${ext || 'bin'}`;
}
