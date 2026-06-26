import { NextRequest, NextResponse } from 'next/server';
import { guardPublicGet } from '@/lib/security/api-guard';
import { generateCsrfToken, setCsrfCookie } from '@/lib/security/csrf';

export async function GET(request: NextRequest) {
  const blocked = guardPublicGet(request, 'auth-csrf', 30, 60 * 1000);
  if (blocked) return blocked;

  const token = generateCsrfToken();
  const response = NextResponse.json({ csrfToken: token });
  await setCsrfCookie(response, token);
  return response;
}
