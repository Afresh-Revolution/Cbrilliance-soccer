import { NextRequest, NextResponse } from 'next/server';
import { guardPublicGet } from '@/lib/security/api-guard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_KEY = /^(gallery|cbfc|media|academy|players|shop)\/[a-zA-Z0-9._/-]+$/;

function sanitizeMediaKey(parts: string[]): string | null {
  const key = parts.map((part) => decodeURIComponent(part)).join('/');
  if (!ALLOWED_KEY.test(key) || key.includes('..')) return null;
  return key;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const blocked = guardPublicGet(request, 'media-proxy', 120, 60 * 1000);
  if (blocked) return blocked;

  const { path } = await params;
  const key = sanitizeMediaKey(path);
  if (!key) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const { downloadFile } = await import('@/lib/storage/b2');
    const { buffer, contentType } = await downloadFile(key);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
