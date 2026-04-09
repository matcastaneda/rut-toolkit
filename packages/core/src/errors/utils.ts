/**
 * Validates that all error code keys in a mapping are UPPER_SNAKE_CASE.
 * Throws if any key is not in this format.
 */
type ValidateErrorCodes<T> = {
  [K in keyof T]: K extends string
    ? Uppercase<K> extends K
      ? T[K]
      : `Invalid error code key: "${K}" — must be UPPER_SNAKE_CASE`
    : never;
};

/**
 * A resolved error-code entry produced by {@link defineErrorCodes}.
 *
 * `toString()` returns the **code key** (not the message) so the object
 * can be used as a string identifier in template literals and comparisons:
 *
 * ```ts
 * const code = RUT_ERROR_CODES.RUT_EMPTY;
 * `${code}`; // "RUT_EMPTY"
 * ```
 */
export type RawError<K extends string = string> = {
  readonly code: K;
  readonly message: string;
  toString(): K;
};

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
