import { cleanRut, splitRut } from "./clean";
import { RutError } from "./errors";
import type { RutResult, ValidRut } from "./types";

/**
 * The weights used to calculate the verification digit.
 */
const DV_WEIGHTS = [2, 3, 4, 5, 6, 7] as const;

/**
 * A set of suspicious RUT bodies that are unlikely to belong to a real person or entity.
 * @example
 * const suspiciousBodies = new Set([
 *   "11111111",
 *   "22222222",
 *   "33333333",
 * ]);
 */
const SUSPICIOUS_BODIES = new Set([
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
 * @param body - Numeric body of the RUT (digits only, no DV).
 * @returns The expected DV (`"0"`–`"9"` or `"K"`), or `""` if the body is empty or non-numeric.
 *
 * @example
 * calculateDv("12345678") // "5"
 * calculateDv("6543210")  // "K"
 */
export function calculateDv(body: string): string {
  if (!body || !/^\d+$/.test(body)) return "";

  let sum = 0;
  let w = 0;

  for (let i = body.length - 1; i >= 0; i--) {
    const weight = DV_WEIGHTS[w % 6] ?? 2;
    sum += (body.charCodeAt(i) - 48) * weight;
    w++;
  }

  const remainder = 11 - (sum % 11);

  if (remainder === 11) return "0";
  if (remainder === 10) return "K";
  return String(remainder);
}

/**
 * Checks whether a given DV matches the expected one for a RUT body.
 *
 * @param body - Numeric body of the RUT.
 * @param dv - The verification digit to check against.
 * @returns `true` if `dv` matches the computed DV for `body`.
 *
 * @example
 * verifyDv("12345678", "5") // true
 * verifyDv("12345678", "0") // false
 */
export function verifyDv(body: string, dv: string): boolean {
  const expected = calculateDv(body);
  return expected !== "" && expected === dv.toUpperCase();
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
 * if (isValidRut(input)) {
 *   // `input` is narrowed to ValidRut here
 *   saveToDb(input);
 * }
 */
export function isValidRut(rut: string): boolean {
  if (typeof rut !== "string") return false;

  const { body, dv } = splitRut(rut);

  if (!body) return false;

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
 * const rut = parseRut("12.345.678-5"); // ValidRut "123456785"
 * const bad = parseRut("12345678-0");   // throws RutError
 */
export function parseRut(rut: string): ValidRut {
  if (rut == null || typeof rut !== "string") {
    throw new RutError("RUT_NULLISH");
  }

  const trimmed = rut.trim();
  if (trimmed.length === 0) throw new RutError("RUT_EMPTY", rut);
  if (/[^0-9kK.\-\s]/.test(trimmed))
    throw new RutError("RUT_INVALID_CHARACTERS", rut);

  const cleaned = cleanRut(rut);

  if (cleaned.length < 2) throw new RutError("RUT_TOO_SHORT", rut);
  if (cleaned.length > 10) throw new RutError("RUT_TOO_LONG", rut);

  const { body, dv } = splitRut(rut);

  if (!body) throw new RutError("RUT_DV_MISSING", rut);
  if (!/^\d+$/.test(body)) throw new RutError("RUT_BODY_NOT_NUMERIC", rut);
  if (!/^[\dkK]$/.test(dv)) throw new RutError("RUT_DV_INVALID", rut);

  if (!verifyDv(body, dv)) throw new RutError("RUT_DV_MISMATCH", rut);

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
 * isSuspiciousRut("11.111.111-1") // true
 * isSuspiciousRut("12.345.678-5") // false
 */
export function isSuspiciousRut(rut: string): boolean {
  const { body } = splitRut(rut);

  if (!body) return false;

  return SUSPICIOUS_BODIES.has(body);
}

/**
 * Throws if the RUT matches a known suspicious pattern.
 *
 * @param rut - RUT string in any format.
 * @throws {RutError} `RUT_SUSPICIOUS` when the RUT body matches a known fake pattern.
 *
 * @example
 * assertNotSuspiciousRut("12.345.678-5") // ok
 * assertNotSuspiciousRut("11.111.111-1") // throws RutError
 */
export function assertNotSuspiciousRut(rut: string): void {
  if (isSuspiciousRut(rut)) throw new RutError("RUT_SUSPICIOUS", rut);
}

/**
 * Non-throwing variant of {@link parseRut}.
 * Returns a discriminated union instead of throwing on invalid input.
 *
 * @param rut - RUT string in any format.
 * @returns `{ ok: true, rut: ValidRut }` on success, `{ ok: false, code, message }` on failure.
 *
 * @example
 * const result = safeParseRut("12.345.678-5");
 * if (result.ok) {
 *   console.log(result.rut); // ValidRut "123456785"
 * } else {
 *   console.log(result.code); // ErrorCode
 * }
 */
export function safeParseRut(rut: string): RutResult {
  try {
    return { ok: true, rut: parseRut(rut) };
  } catch (error) {
    if (error instanceof RutError) {
      return { ok: false, code: error.code, message: error.message };
    }
    return {
      ok: false,
      code: "SYSTEM_UNEXPECTED",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
