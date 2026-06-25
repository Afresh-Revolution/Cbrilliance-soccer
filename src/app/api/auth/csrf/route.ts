import { NextResponse } from 'next/server';
import { generateCsrfToken, setCsrfCookie } from '@/lib/security/csrf';

export async function GET() {
  const token = generateCsrfToken();
  const response = NextResponse.json({ csrfToken: token });
  await setCsrfCookie(response, token);
  return response;
}
