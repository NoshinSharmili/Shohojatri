import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiRequestError } from "./client";

/**
 * Shows an API error on the form: on the field the API named in `detail.field` (mapped through
 * `fields` when the form names it differently), otherwise as a form-level ("root") error.
 */
export function showApiError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  message: string,
  fields: Partial<Record<string, Path<T>>> = {},
): void {
  const apiField = error instanceof ApiRequestError ? error.field : null;
  const field = apiField ? (fields[apiField] ?? (apiField as Path<T>)) : null;
  if (field) {
    setError(field, { type: "server", message }, { shouldFocus: true });
  } else {
    setError("root", { type: "server", message });
  }
}
