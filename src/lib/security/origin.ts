import { NextRequest } from 'next/server';

function localhostOrigins(port: string): string[] {
  const p = port || '3000';
  return [`http://localhost:${p}`, `http://127.0.0.1:${p}`];
}

export function validateOrigin(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') {
    const host = request.nextUrl.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return true;
    }
  }

  const allowed = new Set<string>();
  const requestOrigin = `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  allowed.add(requestOrigin);
  localhostOrigins(request.nextUrl.port).forEach((o) => allowed.add(o));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      allowed.add(new URL(siteUrl).origin);
    } catch {
      // ignore invalid site url
    }
  }

  const origin = request.headers.get('origin');
  if (origin) return allowed.has(origin);

  const referer = request.headers.get('referer');
  if (referer) {
    return [...allowed].some((base) => referer.startsWith(base));
  }

  return process.env.NODE_ENV !== 'production';
}
