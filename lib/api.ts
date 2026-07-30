import { getAuthToken, clearAuth } from "@/store/auth";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type Options = Omit<RequestInit, "body"> & { body?: unknown };

let redirecting = false;

export async function apiFetch(path: string, { body, headers, ...rest }: Options = {}): Promise<Response> {
  const isFormData = body instanceof FormData;
  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      ...(!isFormData && body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...authHeaders(),
      ...(headers as Record<string, string> | undefined),
    },
    ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  });

  if (res.status === 401 && typeof window !== "undefined" && !redirecting) {
    redirecting = true;
    clearAuth();
    window.location.href = "/login";
  }

  return res;
}
