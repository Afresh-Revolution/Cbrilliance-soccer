import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/security/rate-limit';
import { validateOrigin } from '@/lib/security/origin';
import { validateCsrf } from '@/lib/security/csrf';
import { parseUuidParam } from '@/lib/security/params';

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function guardPublicPost(
  request: NextRequest,
  key: string,
  limit = 10,
  windowMs = 60 * 60 * 1000,
): Promise<NextResponse | null> {
  if (!validateOrigin(request)) {
    return jsonError('Invalid origin', 403);
  }

  const ip = getClientIp(request);
  const result = rateLimit(`${key}:${ip}`, limit, windowMs);
  if (!result.success) {
    return jsonError('Too many requests. Please try again later.', 429);
  }

  if (!(await validateCsrf(request))) {
    return jsonError('Invalid security token. Refresh the page and try again.', 403);
  }

  return null;
}

export function guardPublicGet(
  request: NextRequest,
  key: string,
  limit = 60,
  windowMs = 60 * 1000,
): NextResponse | null {
  const ip = getClientIp(request);
  const result = rateLimit(`${key}:${ip}`, limit, windowMs);
  if (!result.success) {
    return jsonError('Too many requests. Please try again later.', 429);
  }
  return null;
}

export function guardAuthPost(
  request: NextRequest,
  key: string,
  limit = 5,
  windowMs = 15 * 60 * 1000,
): NextResponse | null {
  const ip = getClientIp(request);
  const result = rateLimit(`${key}:${ip}`, limit, windowMs);
  if (!result.success) {
    return jsonError('Too many attempts. Please try again later.', 429);
  }

  if (!validateOrigin(request)) {
    return jsonError('Invalid origin', 403);
  }

  return null;
}

/** Rate limit + origin + CSRF for authenticated mutations. */
export async function guardAuthMutation(
  request: NextRequest,
  key: string,
  limit = 5,
  windowMs = 15 * 60 * 1000,
): Promise<NextResponse | null> {
  const blocked = guardAuthPost(request, key, limit, windowMs);
  if (blocked) return blocked;

  if (!(await validateCsrf(request))) {
    return jsonError('Invalid security token. Refresh the page and try again.', 403);
  }

  return null;
}

export function guardAuthGet(
  request: NextRequest,
  key: string,
  limit = 120,
  windowMs = 60 * 1000,
): NextResponse | null {
  const ip = getClientIp(request);
  const result = rateLimit(`${key}:${ip}`, limit, windowMs);
  if (!result.success) {
    return jsonError('Too many requests. Please try again later.', 429);
  }
  return null;
}

export function rejectInvalidUuid(id: string): NextResponse | null {
  if (!parseUuidParam(id)) {
    return jsonError('Invalid id', 400);
  }
  return null;
}

export function handleAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') return jsonError('Unauthorized', 401);
    if (error.message === 'FORBIDDEN') return jsonError('Forbidden', 403);
  }
  return jsonError('Internal server error', 500);
}
