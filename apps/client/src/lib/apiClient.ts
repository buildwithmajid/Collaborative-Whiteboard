function readBaseUrl(): string {
  const value = import.meta.env.VITE_API_URL;
  if (!value) {
    throw new Error('VITE_API_URL is not set (see apps/client/.env.example)');
  }
  return value.replace(/\/+$/, '');
}

const API_BASE_URL = `${readBaseUrl()}/api`;

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** fetch wrapper for the REST API: prefixes the base URL, sends/parses JSON, throws ApiError on non-2xx. */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body: unknown = await res.json();
      if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
        message = body.error;
      }
    } catch {
      // Response had no JSON body; keep the generic message.
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}
