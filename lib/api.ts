import { getAuthToken } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type Options = Omit<RequestInit, "body"> & { body?: unknown };

export async function apiFetch(path: string, { body, headers, ...rest }: Options = {}): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...authHeaders(),
      ...(headers as Record<string, string> | undefined),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}
