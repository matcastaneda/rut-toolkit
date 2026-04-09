import { splitRut } from "../clean";
import type { RutDv, ValidRut } from "../types";
import type { FormattedRut, RutFormatOptions, RutMaskOptions } from "./types";

const DOTS_RE = /\B(?=(\d{3})+(?!\d))/g;

/**
 * Formats a RUT into the standard Chilean format.
 * Accepts any format — the input is cleaned and split automatically.
 *
 * @param rut - RUT string in any format.
 * @param options - Control dots and hyphen. Both default to `true`.
 * @returns The formatted RUT, or `""` if the input is invalid.
 *
 * @example
 * formatRut("123456785")                                         // "12.345.678-5"
 * formatRut("123456785", { withDots: false })                    // "12345678-5"
 * formatRut("123456785", { withDots: false, withHyphen: false }) // "123456785"
 */
export function formatRut(
  rut: ValidRut,
  options?: Readonly<RutFormatOptions>,
): FormattedRut;
export function formatRut(
  rut: string,
  options?: Readonly<RutFormatOptions>,
): string;
export function formatRut(
  rut: string,
  options: Readonly<RutFormatOptions> = {},
): string {
  const { body, dv } = splitRut(rut);

  if (!body) {
    return "";
  }

  return assembleRutParts(body, dv, options);
}

function assembleRutParts(
  body: string,
  dv: RutDv,
  opts: Readonly<RutFormatOptions>,
): string {
  const {
    withDots = true,
    withHyphen = true,
    uppercaseDv = true,
    padBodyLength,
  } = opts;

  let finalBody = body;
  if (padBodyLength !== undefined && finalBody.length < padBodyLength) {
    finalBody = finalBody.padStart(padBodyLength, "0");
  }

  if (withDots) {
    finalBody = finalBody.replace(DOTS_RE, ".");
  }

  const separator = withHyphen ? "-" : "";

  const finalDv = uppercaseDv ? dv.toUpperCase() : dv.toLowerCase();

  return `${finalBody}${separator}${finalDv}`;
}

/**
 * Masks a RUT by hiding certain positions.
 *
 * **Without `pattern`:** The first group of digits (before the first dot) and the DV
 * stay visible; the rest is replaced with `maskChar`, preserving the standard dotted grouping.
 *
 * **With `pattern`:** Each character maps 1:1 aligned from the **right** against the fully
 * formatted RUT (dots and hyphen).
 * - Use `X` or `x` to pass the original digit through.
 * - Use `*` to mask a digit with `maskChar`.
 * - Dots (`.`) and hyphens (`-`) from the formatted RUT are always preserved.
 * - Any unrecognized character in the pattern defaults to being masked for safety.
 *
 * @param rut - RUT string in any format.
 * @param options - Object containing `pattern` and/or `maskChar`.
 * @returns The masked RUT, or `""` if the input is invalid.
 *
 * @remarks
 * **Pattern length:** The pattern is right-aligned with the formatted string. If the pattern
 * is **shorter**, missing positions on the **left** behave as pass-through (`X`). If the pattern
 * is **longer**, extra characters on the **left** are ignored.
 *
 * @example
 * maskRut("12.345.678-5")                               // "12.***.***-5"
 * maskRut("12.345.678-5", { pattern: "XX.***.***-X" })  // "12.***.***-5"
 * maskRut("4.716.137-1", { pattern: "*.XXX.XXX-X" })    // "*.716.137-1"
 * maskRut("12.345.678-5", { maskChar: "•" })            // "12.•••.•••-5"
 */
export function maskRut(
  rut: ValidRut,
  options?: Readonly<RutMaskOptions>,
): string;
export function maskRut(
  rut: string,
  options?: Readonly<RutMaskOptions>,
): string;
export function maskRut(
  rut: string,
  options: Readonly<RutMaskOptions> = {},
): string {
  const { body, dv } = splitRut(rut);

  if (!body) {
    return "";
  }

  const { pattern, maskChar = "*" } = options;

  const formatted = assembleRutParts(body, dv, {
    withDots: true,
    withHyphen: true,
  });

  if (pattern) {
    return applyMaskPattern(formatted, pattern, maskChar);
  }

  const parts = formatted.split(".");
  if (parts.length > 1) {
    const [firstGroup = ""] = parts;
    const restLen = body.length - firstGroup.length;
    const maskedBody = firstGroup + "*".repeat(restLen);
    const dottedBody = insertDotsFromRight(maskedBody).replace(/\*/g, maskChar);

    return `${dottedBody}-${dv}`;
  }

  const visible = Math.min(1, body.length);
  const maskedBody = body.slice(0, visible) + "*".repeat(body.length - visible);
  const finalDottedBody = insertDotsFromRight(maskedBody).replace(
    /\*/g,
    maskChar,
  );

  return `${finalDottedBody}-${dv}`;
}

function applyMaskPattern(
  formatted: string,
  pattern: string,
  maskChar: string,
): string {
  let result = "";
  let fIdx = formatted.length - 1;
  let pIdx = pattern.length - 1;

  while (fIdx >= 0) {
    const fChar = formatted[fIdx];
    const pChar = pIdx >= 0 ? pattern.charAt(pIdx).toUpperCase() : "X";

    const isSeparator = fChar === "." || fChar === "-";

    if (isSeparator) {
      result = fChar + result;
    } else if (pChar === "X") {
      result = fChar + result;
    } else {
      result = maskChar + result;
    }

    fIdx--;
    pIdx--;
  }

  return result;
}

function insertDotsFromRight(segment: string): string {
  if (segment.length <= 3) {
    return segment;
  }

  const parts: string[] = [];
  let i = segment.length;

  while (i > 0) {
    const start = Math.max(0, i - 3);
    parts.unshift(segment.slice(start, i));
    i = start;
  }

  return parts.join(".");
}

/**
 * Builds a formatted RUT string from a numeric body and verification digit.
 * The DV `k` is normalized to uppercase `K`. No structural validation is performed.
 *
 * @param body - Numeric body of the RUT (as a number or string).
 * @param dv - Verification digit (`"0"`–`"9"` or `"K"`).
 * @param options - Control dots and hyphen. Both default to `true`.
 * @returns The assembled RUT, or `""` if either part is empty/invalid.
 *
 * @example
 * buildRut(12345678, "5")                                          // "12.345.678-5"
 * buildRut(12345678, "5", { withDots: true, withHyphen: true })    // "12.345.678-5"
 * buildRut(12345678, "k", { withDots: false, withHyphen: false })  // "12345678K"
 */
export function buildRut(
  body: number | string,
  dv: string | number,
  options: Readonly<RutFormatOptions> = {},
): string {
  const bodyStr = String(body);
  const dvStr = String(dv).trim();

  if (!bodyStr || /^0+$/.test(bodyStr) || dvStr === "") {
    return "";
  }

  const normalizedDv = dvStr.toUpperCase() as RutDv;
  return assembleRutParts(bodyStr, normalizedDv, options);
}

/**
 * Formats a RUT into compact form: no dots, with hyphen (`12345678-5`).
 * Standard format for persistence, APIs, and SII electronic tax documents.
 *
 * @param rut - RUT string in any format.
 * @returns The compact RUT, or `""` if the input is invalid.
 *
 * @example
 * toCompactRut("12.345.678-5") // "12345678-5"
 * toCompactRut("123456785")    // "12345678-5"
 */
export function toCompactRut(rut: ValidRut): FormattedRut;
export function toCompactRut(rut: string): string;
export function toCompactRut(rut: string): string {
  return formatRut(rut, { withDots: false });
}

/**
 * Converts a compact RUT into the standard dotted presentation format.
 *
 * @param rut - RUT string in any format (typically compact from a DB or API).
 * @returns The formatted RUT with dots and hyphen, or `""` if the input is invalid.
 *
 * @example
 * fromCompactRut("12345678-5") // "12.345.678-5"
 */
export function fromCompactRut(rut: ValidRut): FormattedRut;
export function fromCompactRut(rut: string): string;
export function fromCompactRut(rut: string): string {
  return formatRut(rut);
}

/**
 * Alias for {@link toCompactRut}. Matches the SII DTE convention.
 *
 * @param rut - RUT string in any format.
 * @returns The compact RUT for SII electronic tax documents.
 */
export function toSiiRut(rut: ValidRut): FormattedRut;
export function toSiiRut(rut: string): string;
export function toSiiRut(rut: string): string {
  return toCompactRut(rut);
}
