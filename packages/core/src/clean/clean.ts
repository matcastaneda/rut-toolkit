import type { RutDv, ValidRut } from "../types";
import type {
  FilledRutComponents,
  RutCleanOptions,
  RutComponents,
} from "./types";

const EMPTY_RUT_COMPONENTS: Readonly<RutComponents> = Object.freeze({
  body: "",
  dv: "",
});

/**
 * Strips formatting characters, spaces, and optionally leading zeros from a RUT.
 * The check digit `k` is always normalized to uppercase `K`.
 *
 * @param rut - Raw RUT string in any format.
 * @param options - Configures the cleaning behavior (e.g., preserving leading zeros).
 * @returns Cleaned RUT, or `""` if the input is empty or not a string.
 *
 * @example
 * cleanRut("12.345.678-9")                             // "123456789"
 * cleanRut("  06.543.210-k")                           // "6543210K"
 * cleanRut("06.543.210-k", { keepLeadingZeros: true }) // "06543210K"
 */
export function cleanRut(
  rut: ValidRut,
  options?: Readonly<RutCleanOptions>,
): ValidRut;
export function cleanRut(
  rut: string,
  options?: Readonly<RutCleanOptions>,
): string;
export function cleanRut(
  rut: string,
  options: Readonly<RutCleanOptions> = {},
): string {
  if (typeof rut !== "string") {
    return "";
  }

  const cleaned = rut.replace(/[^0-9kK]/g, "").toUpperCase();

  if (cleaned.length === 0) {
    return "";
  }

  if (options.keepLeadingZeros) {
    return cleaned;
  }

  return cleaned.replace(/^0+/, "") || "0";
}

/**
 * Splits a RUT into its body (numeric part) and verification digit.
 * Accepts any format — the input is cleaned internally via {@link cleanRut}.
 *
 * @param rut - RUT string in any format.
 * @param options - Passed down to `cleanRut` to control zero stripping.
 * @returns `{ body, dv }` — both are `""` when the input is invalid or too short.
 *
 * @example
 * splitRut("01234567-K", { keepLeadingZeros: true }) // { body: "01234567", dv: "K" }
 */
export function splitRut(
  rut: ValidRut,
  options?: Readonly<RutCleanOptions>,
): FilledRutComponents;
export function splitRut(
  rut: string,
  options?: Readonly<RutCleanOptions>,
): RutComponents;
export function splitRut(
  rut: string,
  options: Readonly<RutCleanOptions> = {},
): RutComponents {
  const cleaned = cleanRut(rut, options);

  if (cleaned.length < 2) {
    return EMPTY_RUT_COMPONENTS;
  }

  return {
    body: cleaned.slice(0, -1),
    dv: cleaned.slice(-1) as RutDv,
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
export function padRut(rut: ValidRut, bodyLength?: number): string;
export function padRut(rut: string, bodyLength?: number): string;
export function padRut(rut: string, bodyLength = 8): string {
  const { body, dv } = splitRut(rut);

  if (!body) {
    return "";
  }

  return body.padStart(bodyLength, "0") + dv;
}
