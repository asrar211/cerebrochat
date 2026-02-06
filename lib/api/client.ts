import type { ApiError, ApiResponse } from "@/types/api";

export class ApiClientError extends Error {
  code: string;
  fieldErrors?: Record<string, string>;

  constructor(error: ApiError["error"]) {
    super(error.message);
    this.code = error.code;
    this.fieldErrors = error.fieldErrors;
  }
}

async function parseJsonSafe<T>(res: Response) {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function requestJson<T>(
  url: string,
  options: RequestInit & { body?: unknown } = {}
) {
  const hasBody = options.body !== undefined;
  const headers = {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });

  const data = await parseJsonSafe<ApiResponse<T>>(res);

  if (!res.ok || !data?.ok) {
    if (data && "error" in data) {
      throw new ApiClientError(data.error);
    }
    throw new Error("Request failed");
  }

  return data.data;
}
