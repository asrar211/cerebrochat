import { NextResponse } from "next/server";
import type { ApiError, ApiFieldErrors, ApiSuccess } from "@/types/api";
import { zodErrorsToFieldMap } from "@/lib/validation/format";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, init);
}

export function jsonError(
  message: string,
  status = 400,
  code = "bad_request",
  fieldErrors?: ApiFieldErrors
) {
  return NextResponse.json<ApiError>(
    {
      ok: false,
      error: {
        message,
        code,
        fieldErrors,
      },
    },
    { status }
  );
}

export { zodErrorsToFieldMap };
