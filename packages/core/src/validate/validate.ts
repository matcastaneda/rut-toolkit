import { cleanRut } from "../clean";
import type { RutErrorCode, RutErrorMeta } from "../errors";
import { RUT_ERROR_META, RutError } from "../errors";
import type { RutDv, ValidRut } from "../types";

/**
 * A set of placeholder RUT bodies that are structurally valid but
 * unlikely to belong to a real person or entity (e.g., testing RUTs).
 * * @example
 * const placeholders = new Set([
 * "11111111",
 * "22222222",
 * ]);
 */
const PLACEHOLDER_RUTS = new Set([
  "0",
  "1",
  "11111111",
  "22222222",
  "33333333",
  "44444444",
  "55555555",
  "66666666",
  "77777777",
  "88888888",
  "99999999",
  "12345678",
]);

/**
 * Computes the verification digit (dígito verificador) for a RUT body
 * using the standard modulo 11 algorithm.
 *
 * @param body - Numeric body of the RUT (can be a number or string).
 * @returns The expected DV (`"0"`–`"9"` or `"K"`), or `""` if the body is empty or non-numeric.
 *
 * @example
 * calculateDv("12345678") // "5"
 * calculateDv("6")        // "K"
 */
export function calculateDv(body: string | number): RutDv {
  const bodyText = String(body).trim();
  if (!bodyText || !/^\d+$/.test(bodyText)) {
    return "";
  }

  let sum = 0;
  let multiplier = 2;

  for (let i = bodyText.length - 1; i >= 0; i--) {
    sum += (bodyText.charCodeAt(i) - 48) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);

  if (remainder === 11) return "0";
  if (remainder === 10) return "K";

  return String(remainder) as RutDv;
}

/**
 * Checks whether a given DV matches the expected one for a RUT body.
 *
 * @param body - Numeric body of the RUT.
 * @param expectedDv - The verification digit to check against.
 * @returns `true` if `expectedDv` matches the computed DV for `body`.
 *
 * @example
 * verifyDv("12345678", "5") // true
 * verifyDv("12345678", "0") // false
 */
export function verifyDv(body: string, expectedDv: RutDv): boolean {
  if (!expectedDv) return false;

  const calculatedDv = calculateDv(body);
  return calculatedDv === expectedDv.toUpperCase();
}

/**
 * Validates a complete Chilean RUT (body + verification digit).
 * Accepts any format — the input is cleaned and split automatically.
 *
 * Also acts as a TypeScript type guard: inside a truthy branch the
 * value is narrowed to {@link ValidRut}.
 *
 * @param rut - RUT string in any format.
 * @returns `true` if the RUT has a valid structure and its DV is correct.
 *
 * @example
 * if (isRut(input)) {
 *   // `input` is narrowed to ValidRut here
 *   saveToDb(input);
 * }
 */
export function isRut(rut: string): rut is ValidRut {
  if (typeof rut !== "string") {
    return false;
  }

  const cleaned = cleanRut(rut);

  if (cleaned.length < 2) {
    return false;
  }

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1) as RutDv;

  return verifyDv(body, dv);
}

/**
 * Cleans and validates a RUT, returning a branded {@link ValidRut} string.
 * Throws {@link RutError} if the input is not a valid RUT.
 *
 * @param rut - RUT string in any format.
 * @returns The cleaned RUT as a {@link ValidRut} (e.g. `"123456785"`).
 * @throws {RutError} When the RUT is invalid.
 *
 * @example
 * const rut = toValidRut("12.345.678-5"); // ValidRut "123456785"
 * const bad = toValidRut("12345678-0");   // throws RutError
 */
export function toValidRut(rut: string): ValidRut {
  if (rut == null || typeof rut !== "string") {
    throw new RutError("RUT_NULLISH");
  }

  const trimmed = rut.trim();
  if (trimmed.length === 0) {
    throw new RutError("RUT_EMPTY", rut);
  }

  if (/[^0-9kK.\-\s]/.test(trimmed)) {
    throw new RutError("RUT_INVALID_CHARACTERS", rut);
  }

  const cleaned = cleanRut(trimmed);

  if (cleaned.length < 2) {
    throw new RutError("RUT_TOO_SHORT", rut);
  }
  if (cleaned.length > 10) {
    throw new RutError("RUT_TOO_LONG", rut);
  }

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1) as RutDv;

  if (!/^\d+$/.test(body)) {
    throw new RutError("RUT_BODY_NOT_NUMERIC", rut);
  }

  if (!verifyDv(body, dv)) {
    throw new RutError("RUT_DV_MISMATCH", rut);
  }

  return cleaned as ValidRut;
}

/**
 * Detects commonly used fake or placeholder RUTs (e.g. `11.111.111-1`).
 * A suspicious RUT can still be structurally valid — this checks for known patterns
 * that are unlikely to belong to a real person or entity.
 *
 * @param rut - RUT string in any format.
 * @returns `true` if the RUT body matches a known suspicious pattern.
 *
 * @example
 * isPlaceholderRut("11.111.111-1") // true
 * isPlaceholderRut("12.345.678-5") // false
 */
export function isPlaceholderRut(rut: string): boolean {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 2) {
    return false;
  }
  return PLACEHOLDER_RUTS.has(cleaned.slice(0, -1));
}

/**
 * Throws if the RUT matches a known suspicious pattern.
 * Returns the input unchanged so it can be used inline.
 *
 * @param rut - RUT string in any format.
 * @returns The same `rut` value, preserving its original type.
 * @throws {RutError} `RUT_SUSPICIOUS` when the RUT body matches a known fake pattern.
 *
 * @example
 * const safe = ensureRealRut("12.345.678-5"); // "12.345.678-5"
 * ensureRealRut("11.111.111-1"); // throws RutError
 */
export function ensureRealRut<T extends string>(rut: T): T {
  if (isPlaceholderRut(rut)) {
    throw new RutError("RUT_SUSPICIOUS", rut);
  }
  return rut;
}

export type RutParseResult =
  | { readonly ok: true; readonly rut: ValidRut }
  | {
      readonly ok: false;
      readonly code: RutErrorCode;
      readonly message: string;
      readonly meta: RutErrorMeta;
    };

/**
 * Non-throwing variant of {@link toValidRut}.
 * Returns a discriminated union instead of throwing on invalid input.
 *
 * @param rut - RUT string in any format.
 * @returns `{ ok: true, rut: ValidRut }` on success, `{ ok: false, code, message }` on failure.
 *
 * @example
 * const result = tryParseRut("12.345.678-5");
 * if (result.ok) {
 *   console.log(result.rut); // ValidRut "123456785"
 * } else {
 *   console.log(result.code); // RutErrorCode
 * }
 */
export function tryParseRut(rut: string): RutParseResult {
  try {
    return { ok: true, rut: toValidRut(rut) };
  } catch (error) {
    if (error instanceof RutError) {
      return {
        ok: false,
        code: error.code,
        message: error.message,
        meta: error.meta,
      };
    }

    return {
      ok: false,
      code: "SYSTEM_UNEXPECTED",
      message: error instanceof Error ? error.message : "Unknown error",
      meta: RUT_ERROR_META.SYSTEM_UNEXPECTED,
    };
  }
}
