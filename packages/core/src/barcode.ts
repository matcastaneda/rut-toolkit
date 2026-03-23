import { cleanRut } from "./clean";
import type { BarcodeAnalysis, ValidRut } from "./types";
import { isValidRut } from "./validate";

/**
 * Domain constants for the Chilean Registro Civil.
 * Matching the base domain ensures compatibility with both old and new URL formats.
 */
const SIDIV_DOMAIN = "registrocivil.cl";

/** * Matches a RUT-like pattern: 1–9 digits, optional separator, then a DV.
 * Optimized with word boundaries and non-capturing groups where applicable.
 */
const RUT_PATTERN = /\b(\d{1,9})\s*[-.]?\s*([0-9kK])\b/i;

/** Matches the `RUN` query parameter from a Registro Civil URL. */
const RUN_PARAM_RE = /[?&]RUN=([^&]+)/i;

/**
 * Checks whether a string looks like data scanned from a Chilean ID card barcode.
 *
 * @param input - Raw string from a barcode scanner.
 * @returns `true` if the input contains the Registro Civil domain and a `RUN=` parameter.
 *
 * @example
 * isIdBarcode("portal.nuevosidiv.registrocivil.cl/document-validity?RUN=12345678-5&type=CEDULA") // true
 * isIdBarcode("random text") // false
 */
export function isIdBarcode(input: string): boolean {
  if (typeof input !== "string") return false;

  return input.includes(SIDIV_DOMAIN) && RUN_PARAM_RE.test(input);
}

/**
 * High-level analyzer that extracts the RUT and identifies the barcode's source.
 *
 * @param barcode - Raw string from a barcode scanner.
 * @returns An object containing the validated RUT and the identified source.
 *
 * @example
 * analyzeIdBarcode("portal.nuevosidiv.registrocivil.cl/document-validity?RUN=12345678-5&type=CEDULA")
 * // { rut: ValidRut "123456785", source: "QR_FRONT" }
 *
 * analyzeIdBarcode("RUT: 12.345.678-5 some extra data")
 * // { rut: ValidRut "123456785", source: "PDF417_REAR" }
 */
export function analyzeIdBarcode(barcode: string): BarcodeAnalysis {
  if (typeof barcode !== "string" || barcode.trim().length === 0) {
    return Object.freeze({ rut: null, source: "UNKNOWN" });
  }

  if (isIdBarcode(barcode)) {
    return Object.freeze({
      rut: parseIdBarcode(barcode),
      source: "QR_FRONT",
    });
  }

  const rutFromRaw = parseIdBarcode(barcode);

  return Object.freeze({
    rut: rutFromRaw,
    source: rutFromRaw ? "PDF417_REAR" : "UNKNOWN",
  });
}

/**
 * Extracts and validates a RUT from a Chilean ID card barcode string.
 * Supports the Registro Civil URL format (`RUN=` parameter) and
 * falls back to scanning for a RUT pattern in the raw string.
 *
 * @param barcode - Raw string from a barcode scanner.
 * @returns The validated RUT as a {@link ValidRut}, or `null` if no valid RUT is found.
 *
 * @example
 * parseIdBarcode("portal.nuevosidiv.registrocivil.cl/document-validity?RUN=12345678-5&type=CEDULA")
 * // ValidRut "123456785"
 *
 * parseIdBarcode("RUT: 12.345.678-5 some extra data")
 * // ValidRut "123456785"
 *
 * parseIdBarcode("invalid data")
 * // null
 */
export function parseIdBarcode(barcode: string): ValidRut | null {
  if (typeof barcode !== "string" || barcode.trim().length === 0) {
    return null;
  }

  const candidate = extractFromUrl(barcode) ?? extractFromRaw(barcode);

  if (!candidate) {
    return null;
  }

  const cleaned = cleanRut(candidate);

  if (!isValidRut(cleaned)) {
    return null;
  }

  return cleaned as ValidRut;
}

/**
 * Attempts to extract the RUN parameter from a URL.
 */
function extractFromUrl(input: string): string | null {
  if (!input.includes(SIDIV_DOMAIN)) return null;

  const match = RUN_PARAM_RE.exec(input);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/**
 * Attempts to extract a RUT pattern from raw text.
 */
function extractFromRaw(input: string): string | null {
  const match = RUT_PATTERN.exec(input);
  if (!match) return null;

  return `${match[1]}${match[2]}`;
}
