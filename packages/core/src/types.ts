export declare const __brand: unique symbol;

/**
 * A branded string that has been validated as a structurally correct Chilean RUT.
 * Obtain one via {@link isRut} (type guard) or {@link toValidRut} (throws on failure).
 * At runtime this is a plain cleaned string (e.g. `"123456785"`), zero overhead.
 */
export type ValidRut = string & { readonly [__brand]: "ValidRut" };

/**
 * Strict type for a verification digit.
 * Empty string is allowed for incomplete/invalid splits.
 */
export type RutDv =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "K"
  | "k"
  | "";
