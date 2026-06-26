export async function fetchCsrfToken(): Promise<string> {
  const response = await fetch('/api/auth/csrf', { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch CSRF token');
  const data = await response.json();
  return data.csrfToken as string;
}

async function requestWithCsrf<T = unknown>(
  url: string,
  method: string,
  body: unknown | undefined,
  csrfToken: string,
): Promise<{ ok: boolean; data: T; status: number }> {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken,
    },
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  return { ok: response.ok, data, status: response.status };
}

export async function postWithCsrf<T = unknown>(
  url: string,
  body: unknown,
  csrfToken: string,
): Promise<{ ok: boolean; data: T; status: number }> {
  return requestWithCsrf<T>(url, 'POST', body, csrfToken);
}

export async function patchWithCsrf<T = unknown>(
  url: string,
  body: unknown,
  csrfToken: string,
): Promise<{ ok: boolean; data: T; status: number }> {
  return requestWithCsrf<T>(url, 'PATCH', body, csrfToken);
}

export async function deleteWithCsrf<T = unknown>(
  url: string,
  csrfToken: string,
): Promise<{ ok: boolean; data: T; status: number }> {
  return requestWithCsrf<T>(url, 'DELETE', undefined, csrfToken);
}
