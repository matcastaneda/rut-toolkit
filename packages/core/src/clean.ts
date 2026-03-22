import type { RutParts } from "./types";

const EMPTY_PARTS: RutParts = { body: "", dv: "" };

/**
 * Strips formatting characters, spaces, and leading zeros from a RUT.
 * The check digit `k` is always normalized to uppercase `K`.
 *
 * @param rut - Raw RUT string in any format.
 * @returns Cleaned RUT, or `""` if the input is empty or not a string.
 *
 * @example
 * cleanRut("12.345.678-9")  // "123456789"
 * cleanRut("12345678-K")    // "12345678K"
 * cleanRut("  6.543.210-k") // "6543210K"
 * cleanRut("")              // ""
 */
export function cleanRut(rut: string): string {
  if (typeof rut !== "string") return "";

  const cleaned = rut.replace(/[^0-9kK]/g, "").toUpperCase();

  if (cleaned.length === 0) return "";

  return cleaned.replace(/^0+/, "") || "0";
}

/**
 * Splits a RUT into its body (numeric part) and verification digit.
 * Accepts any format — the input is cleaned internally via {@link cleanRut}.
 *
 * @param rut - RUT string in any format.
 * @returns `{ body, dv }` — both are `""` when the input is invalid or too short.
 *
 * @example
 * splitRut("12.345.678-9") // { body: "12345678", dv: "9" }
 * splitRut("12345678K")    // { body: "12345678", dv: "K" }
 * splitRut("")             // { body: "", dv: "" }
 */
export function splitRut(rut: string): RutParts {
  const cleaned = cleanRut(rut);

  if (cleaned.length < 2) return EMPTY_PARTS;

  return {
    body: cleaned.slice(0, -1),
    dv: cleaned.slice(-1),
  };
}

/**
 * Zero-pads the body of a RUT to a fixed width.
 * Useful for normalizing RUTs for database storage or legacy systems.
 *
 * @param rut - RUT string in any format.
 * @param bodyLength - Desired character count for the body (digits before the DV). Defaults to `8`.
 * @returns The cleaned RUT with its body left-padded with zeros, or `""` if the input is invalid.
 *
 * @example
 * padRut("1.234.567-8")  // "012345678"  (body padded to 8)
 * padRut("12.345.678-9") // "123456789"  (body already 8 chars)
 */
export function padRut(rut: string, bodyLength = 8): string {
  const { body, dv } = splitRut(rut);

  if (!body) return "";

  return body.padStart(bodyLength, "0") + dv;
}
