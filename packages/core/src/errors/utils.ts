import type { RawError, ValidateErrorCodes } from "./types";

/**
 * Builds a frozen, strongly-typed error-code registry from a
 * `{ CODE: "message" }` mapping. Keys must be `UPPER_SNAKE_CASE`.
 */
export function defineErrorCodes<const T extends Record<string, string>>(
  codes: ValidateErrorCodes<T>,
): { readonly [K in keyof T]: RawError<K & string> } {
  const result: Record<string, RawError> = {};

  for (const key in codes) {
    result[key] = {
      code: key,
      message: codes[key] as string,
      toString: () => key,
    };
  }

  return result as { readonly [K in keyof T]: RawError<K & string> };
}
