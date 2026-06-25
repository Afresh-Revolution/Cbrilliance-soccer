import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/security/rate-limit';
import { validateOrigin } from '@/lib/security/origin';

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function guardPublicPost(
  request: NextRequest,
  key: string,
  limit = 10,
  windowMs = 60 * 60 * 1000,
): NextResponse | null {
  if (!validateOrigin(request)) {
    return jsonError('Invalid origin', 403);
  }

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

export function handleAuthError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') return jsonError('Unauthorized', 401);
    if (error.message === 'FORBIDDEN') return jsonError('Forbidden', 403);
  }
  return jsonError('Internal server error', 500);
}
