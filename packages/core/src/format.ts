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
 * Masks a RUT by hiding certain positions. Without a pattern, the first two body
 * digits and the DV stay visible; the rest of the body is replaced with `*`, then
 * grouped with dots like a normal RUT body (e.g. `12.***.***-5`).
 *
 * With a pattern, each character maps 1:1 to the formatted RUT (`XX.XXX.XXX-X`).
 * Use `*` to mask a position; any other character lets the original through.
 *
 * @param rut - RUT string in any format.
 * @param pattern - Optional mask pattern. `*` = hidden, anything else = pass-through.
 * @returns The masked RUT, or `""` if the input is invalid.
 *
 * @example
 * maskRut("12.345.678-5")                    // "12.***.***-5"
 * maskRut("12.345.678-5", "XX.XXX.XXX-*")   // "12.345.678-*"
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

  const visible = Math.min(2, body.length);
  const visiblePart = body.slice(0, visible);
  const restLen = body.length - visible;

  if (restLen === 0) {
    return `${visiblePart}-${dv}`;
  }

  const maskedBody = body.slice(0, visible) + "*".repeat(restLen);
  const dottedBody = dotGroupFromRight(maskedBody);

  return `${dottedBody}-${dv}`;
}

function applyPattern(formatted: string, pattern: string): string {
  let result = "";
  const len = Math.min(formatted.length, pattern.length);

  for (let i = 0; i < len; i++) {
    result += pattern.charAt(i) === "*" ? "*" : formatted.charAt(i);
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
