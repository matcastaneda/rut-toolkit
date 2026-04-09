/** Supported i18n locales for error messages. */
export type RutLocale = "es" | "en";

/**
 * Validates that all error code keys in a mapping are UPPER_SNAKE_CASE.
 * Throws if any key is not in this format.
 */
export type ValidateErrorCodes<T> = {
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
