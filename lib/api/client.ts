import type { ApiError, ApiResponse } from "@/types/api";

/**
 * Structured API error thrown when backend responds with { ok: false }
 */
export class ApiClientError extends Error {
  code: string;
  fieldErrors?: Record<string, string>;

  constructor(error: ApiError["error"]) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.fieldErrors = error.fieldErrors;
  }
}

/**
 * Safely parse JSON without throwing
 */
async function parseJsonSafe<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Typed JSON request helper
 */
export async function requestJson<T>(
  url: string,
  options: Omit<RequestInit, "body"> & { body?: unknown } = {}
): Promise<T> {
  const isJsonBody =
    options.body !== undefined &&
    typeof options.body === "object" &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof Blob);

  const headers: HeadersInit = {
    ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
    body: isJsonBody
      ? JSON.stringify(options.body)
      : (options.body as BodyInit | undefined),
  });

  const data = await parseJsonSafe<ApiResponse<T>>(res);

  if (!res.ok || !data) {
    throw new Error("Request failed");
  }

  if (data.ok === false) {
    throw new ApiClientError(data.error);
  }

  return data.data;
}