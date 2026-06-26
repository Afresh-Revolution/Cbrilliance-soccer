import { createHash } from 'crypto';
import https from 'https';
import { URL } from 'url';

type B2Auth = {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  accountId: string;
};

type B2UploadUrl = {
  bucketId: string;
  uploadUrl: string;
  authorizationToken: string;
};

let cachedAuth: B2Auth | null = null;

function getCredentials() {
  const keyId = process.env.B2_APPLICATION_KEY_ID;
  const appKey = process.env.B2_APPLICATION_KEY;
  const bucket = process.env.B2_BUCKET_NAME;

  if (!keyId || !appKey || !bucket) {
    throw new Error('Missing B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY, or B2_BUCKET_NAME');
  }

  return { keyId, appKey, bucket };
}

/** B2 requires URL-encoding but slashes in paths must stay unencoded. */
export function b2FileName(key: string): string {
  return key.split('/').map((part) => encodeURIComponent(part)).join('/');
}

function httpsRequest(
  targetUrl: string,
  method: 'GET' | 'POST' | 'HEAD',
  headers: Record<string, string>,
  body?: Buffer | string,
): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(targetUrl);
    const payload = body
      ? Buffer.isBuffer(body)
        ? body
        : Buffer.from(body)
      : undefined;

    const request = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: `${parsed.pathname}${parsed.search}`,
        method,
        headers: payload
          ? {
              ...headers,
              'Content-Length': String(payload.length),
            }
          : headers,
        family: 4,
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode ?? 0,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      },
    );

    request.on('error', reject);
    request.setTimeout(120_000, () => request.destroy(new Error(`B2 request timed out: ${targetUrl}`)));

    if (payload) request.write(payload);
    request.end();
  });
}

async function withRetry<T>(label: string, fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        const delayMs = attempt * 1500;
        console.warn(`${label} failed (attempt ${attempt}/${attempts}), retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

async function authorizeAccount(): Promise<B2Auth> {
  if (cachedAuth) return cachedAuth;

  const { keyId, appKey } = getCredentials();
  const basic = Buffer.from(`${keyId}:${appKey}`).toString('base64');

  const result = await withRetry('B2 authorize', () =>
    httpsRequest('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', 'GET', {
      Authorization: `Basic ${basic}`,
    }),
  );

  if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new Error(`B2 authorization failed (${result.statusCode}): ${result.body}`);
  }

  cachedAuth = JSON.parse(result.body) as B2Auth;
  return cachedAuth;
}

async function b2ApiPost<T>(auth: B2Auth, path: string, payload: unknown): Promise<T> {
  const body = JSON.stringify(payload);
  const result = await withRetry(`B2 ${path}`, () =>
    httpsRequest(`${auth.apiUrl}${path}`, 'POST', {
      Authorization: auth.authorizationToken,
      'Content-Type': 'application/json',
    }, body),
  );

  if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new Error(`B2 ${path} failed (${result.statusCode}): ${result.body}`);
  }

  return JSON.parse(result.body) as T;
}

async function getBucketId(auth: B2Auth, bucketName: string): Promise<string> {
  const data = await b2ApiPost<{ buckets: { bucketId: string; bucketName: string }[] }>(
    auth,
    '/b2api/v2/b2_list_buckets',
    { accountId: auth.accountId, bucketName },
  );

  const bucket = data.buckets.find((item) => item.bucketName === bucketName);
  if (!bucket) {
    throw new Error(`B2 bucket not found: ${bucketName}`);
  }

  return bucket.bucketId;
}

async function getNativeUploadUrl(auth: B2Auth, bucketId: string): Promise<B2UploadUrl> {
  return b2ApiPost<B2UploadUrl>(auth, '/b2api/v2/b2_get_upload_url', { bucketId });
}

export function getPublicUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_B2_PUBLIC_URL;
  if (base) return `${base.replace(/\/$/, '')}/${key}`;

  const downloadUrl = cachedAuth?.downloadUrl;
  const bucket = process.env.B2_BUCKET_NAME;
  if (downloadUrl && bucket) {
    return `${downloadUrl.replace(/\/$/, '')}/file/${bucket}/${key}`;
  }

  return key;
}

export async function uploadFileNative(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const { bucket } = getCredentials();
  const auth = await authorizeAccount();
  const bucketId = await getBucketId(auth, bucket);
  const upload = await getNativeUploadUrl(auth, bucketId);
  const bytes = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const sha1 = createHash('sha1').update(bytes).digest('hex');

  const result = await withRetry(`B2 upload ${key}`, () =>
    httpsRequest(
      upload.uploadUrl,
      'POST',
      {
        Authorization: upload.authorizationToken,
        'X-Bz-File-Name': b2FileName(key),
        'Content-Type': contentType,
        'X-Bz-Content-Sha1': sha1,
      },
      bytes,
    ),
  );

  if (result.statusCode < 200 || result.statusCode >= 300) {
    throw new Error(`B2 upload failed (${result.statusCode}): ${result.body}`);
  }

  return getPublicUrl(key);
}

export async function deleteFileNative(key: string, fileId?: string): Promise<void> {
  const auth = await authorizeAccount();

  if (!fileId) {
    const { bucket } = getCredentials();
    const bucketId = await getBucketId(auth, bucket);
    const listData = await b2ApiPost<{ files: { fileId: string; fileName: string }[] }>(
      auth,
      '/b2api/v2/b2_list_file_names',
      { bucketId, prefix: key, maxFileCount: 1 },
    );

    const match = listData.files.find((file) => file.fileName === key);
    if (!match) return;
    fileId = match.fileId;
  }

  await b2ApiPost(auth, '/b2api/v2/b2_delete_file_version', { fileId, fileName: key });
}

export type B2ClientUpload = {
  uploadUrl: string;
  authorizationToken: string;
  key: string;
  contentType: string;
};

export async function createNativeUpload(key: string, contentType: string): Promise<B2ClientUpload> {
  const { bucket } = getCredentials();
  const auth = await authorizeAccount();
  const bucketId = await getBucketId(auth, bucket);
  const upload = await getNativeUploadUrl(auth, bucketId);

  return {
    uploadUrl: upload.uploadUrl,
    authorizationToken: upload.authorizationToken,
    key,
    contentType,
  };
}

export async function remoteFileExists(publicUrl: string): Promise<boolean> {
  try {
    const result = await httpsRequest(publicUrl, 'HEAD', {});
    return result.statusCode >= 200 && result.statusCode < 300;
  } catch {
    return false;
  }
}
