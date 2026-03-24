import { splitRut } from "./clean";
import type { FormatOptions } from "./types";

const DOTS_RE = /\B(?=(\d{3})+(?!\d))/g;

function dotGroupFromRight(segment: string): string {
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

function assemble(
  body: string,
  dv: string,
  opts: Readonly<FormatOptions>,
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
 * Formats a RUT into the standard Chilean format.
 * Accepts any format — the input is cleaned and split automatically.
 *
 * @param rut - RUT string in any format.
 * @param options - Control dots and hyphen. Both default to `true`.
 * @returns The formatted RUT, or `""` if the input is invalid.
 *
 * @example
 * formatRut("123456785")                                    // "12.345.678-5"
 * formatRut("123456785", { withDots: false })               // "12345678-5"
 * formatRut("123456785", { withDots: false, withHyphen: false }) // "123456785"
 */
export function formatRut(
  rut: string,
  options: Readonly<FormatOptions> = {},
): string {
  const { body, dv } = splitRut(rut);

  if (!body) {
    return "";
  }

  return assemble(body, dv, options);
}

/**
 * Masks a RUT by hiding certain positions. Without a pattern, the first group of digits
 * (before the first dot) and the DV stay visible; the rest is replaced with `*`,
 * preserving the standard dotted grouping (e.g. `12.***.***-5` or `4.***.***-1`).
 *
 * With a pattern, each character maps 1:1 aligned from the **right** against the fully
 * formatted RUT (dots and hyphen). Use `*` to mask a digit; any other pattern character
 * keeps the original formatted character. Dots and hyphens are never replaced by `*` when
 * the pattern says mask — separators are always preserved in that case.
 *
 * @param rut - RUT string in any format.
 * @param pattern - Optional mask pattern. `*` = hide digit; any other char = pass-through for that column.
 * @returns The masked RUT, or `""` if the input is invalid.
 *
 * @remarks
 * **Default (no pattern):** If the dotted body has no `.` (very short bodies), only the
 * first digit of the body stays visible and the rest is masked, then re-dotted.
 *
 * **Pattern length:** The pattern is right-aligned with the formatted string. If the pattern
 * is **shorter**, missing positions on the **left** behave as pass-through (leading digits
 * can stay visible). If the pattern is **longer**, extra characters on the **left** are
 * ignored.
 *
 * @example
 * maskRut("12.345.678-5")                    // "12.***.***-5"
 * maskRut("1.234.567-5")                     // "1.***.***-5"
 * maskRut("12.345.678-5", "XX.XXX.XXX-*")   // "12.345.678-*"
 * maskRut("4.716.137-1", "*.XXX.XXX-X")     // "*.716.137-1"
 */
export function maskRut(rut: string, pattern?: string): string {
  const { body, dv } = splitRut(rut);

  if (!body) {
    return "";
  }

  const formatted = assemble(body, dv, { withDots: true, withHyphen: true });

  if (pattern) {
    return applyPattern(formatted, pattern);
  }

  const parts = formatted.split(".");
  if (parts.length > 1) {
    const firstGroup = parts[0];
    if (!firstGroup) {
      return "";
    }
    const restLen = body.length - firstGroup.length;
    const maskedBody = firstGroup + "*".repeat(restLen);
    const dottedBody = dotGroupFromRight(maskedBody);

    return `${dottedBody}-${dv}`;
  }

  const visible = Math.min(1, body.length);
  const maskedBody = body.slice(0, visible) + "*".repeat(body.length - visible);

  return `${dotGroupFromRight(maskedBody)}-${dv}`;
}

function applyPattern(formatted: string, pattern: string): string {
  let result = "";
  let fIdx = formatted.length - 1;
  let pIdx = pattern.length - 1;

  while (fIdx >= 0) {
    const fChar = formatted[fIdx];
    const pChar = pIdx >= 0 ? pattern[pIdx] : "X";

    if (pChar === "*") {
      result = fChar === "." || fChar === "-" ? fChar + result : `*${result}`;
    } else {
      result = fChar + result;
    }

    fIdx--;
    pIdx--;
  }

  return result;
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
  options: Readonly<FormatOptions> = {},
): string {
  const bodyStr = String(body);
  const dvStr = String(dv);

  if (!bodyStr || /^0+$/.test(bodyStr) || dvStr.trim() === "") {
    return "";
  }

  return assemble(bodyStr, dvStr.toUpperCase(), options);
}

/**
 * Formats a RUT into compact form: no dots, with hyphen (`12345678-5`).
 * Standard format for persistence, APIs, and SII electronic tax documents.
 *
 * @param rut - RUT string in any format.
 * @returns The compact RUT, or `""` if the input is invalid.
 *
 * @example
 * toCompactFormat("12.345.678-5") // "12345678-5"
 * toCompactFormat("123456785")    // "12345678-5"
 */
export function toCompactFormat(rut: string): string {
  return formatRut(rut, { withDots: false });
}

/**
 * Converts a compact RUT into the standard dotted presentation format.
 *
 * @param rut - RUT string in any format (typically compact from a DB or API).
 * @returns The formatted RUT with dots and hyphen, or `""` if the input is invalid.
 *
 * @example
 * fromCompactFormat("12345678-5") // "12.345.678-5"
 */
export function fromCompactFormat(rut: string): string {
  return formatRut(rut);
}

/**
 * Alias for {@link toCompactFormat}. Matches the SII DTE convention.
 *
 * @param rut - RUT string in any format.
 * @returns The compact RUT for SII electronic tax documents.
 */
export function toSiiFormat(rut: string): string {
  return toCompactFormat(rut);
}
