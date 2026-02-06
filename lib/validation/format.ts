import type { ZodError } from "zod";
import type { ApiFieldErrors } from "@/types/api";

export function zodErrorsToFieldMap(error: ZodError) {
  const fieldErrors = error.flatten()
    .fieldErrors as Record<string, string[] | undefined>;
  const mapped: ApiFieldErrors = {};

  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages && messages.length > 0) {
      mapped[field] = messages[0] ?? "Invalid value";
    }
  }

  return mapped;
}
