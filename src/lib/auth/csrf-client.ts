export async function fetchCsrfToken(): Promise<string> {
  const response = await fetch('/api/auth/csrf', { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch CSRF token');
  const data = await response.json();
  return data.csrfToken as string;
}

export async function postWithCsrf<T = unknown>(
  url: string,
  body: unknown,
  csrfToken: string,
): Promise<{ ok: boolean; data: T; status: number }> {
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
