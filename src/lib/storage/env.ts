/** True when Backblaze B2 credentials are available for server uploads. */
export function isB2Configured(): boolean {
  const keyId = process.env.B2_APPLICATION_KEY_ID;
  const appKey = process.env.B2_APPLICATION_KEY;
  const bucket = process.env.B2_BUCKET_NAME;
  return Boolean(keyId && appKey && bucket);
}
