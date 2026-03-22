import { cleanRut } from "./clean";
import type { ValidRut } from "./types";
import { isValidRut } from "./validate";

/**
 * Core domain from the Chilean Registro Civil ID card barcode (PDF417/QR).
 * Paths change between old and new CI versions, so matching the domain is safer.
 */
const SIDIV_DOMAIN = "registrocivil.cl";

/** Matches a RUT-like pattern anywhere in a string: 1–9 digits, optional separator, then a DV. */
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
  if (!input || typeof input !== "string") return false;

  return input.includes(SIDIV_DOMAIN) && input.includes("RUN=");
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
  if (!barcode || barcode.trim().length === 0) return null;

  const candidate = extractFromUrl(barcode) ?? extractFromRaw(barcode);

  if (!candidate) return null;

  const cleaned = cleanRut(candidate);

  if (!isValidRut(cleaned)) return null;

  return cleaned as ValidRut;
}

function extractFromUrl(input: string): string | null {
  if (!input.includes(SIDIV_DOMAIN)) return null;

  const match = RUN_PARAM_RE.exec(input);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function extractFromRaw(input: string): string | null {
  const match = RUT_PATTERN.exec(input);
  if (!match?.[1] || !match[2]) return null;

  return `${match[1]}${match[2]}`;
}
