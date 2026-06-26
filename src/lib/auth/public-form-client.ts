'use client';

/** CSRF-protected POST for public site forms (contact, academy, scout). */

async function fetchCsrfToken(): Promise<string> {
  const response = await fetch('/api/auth/csrf', { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch security token');
  const data = await response.json();
  return data.csrfToken as string;
}

export async function postPublicForm<T = unknown>(
  url: string,
  body: unknown,
): Promise<{ ok: boolean; data: T; status: number }> {
  const csrfToken = await fetchCsrfToken();
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return { ok: response.ok, data, status: response.status };
}
