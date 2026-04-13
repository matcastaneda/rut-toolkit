import type { RutErrorCode } from "./codes";
import type { RutErrorMeta } from "./meta";
import { RUT_ERROR_META } from "./meta";

/**
 * Structured error thrown by rut-toolkit functions.
 * Carries a machine-readable {@link RutErrorCode} and semantic metadata
 * for programmatic handling, logging, and API responses.
 *
 * @example
 * try {
 *   toValidRut(input);
 * } catch (err) {
 *   if (err instanceof RutError) {
 *     err.code;            // "RUT_DV_MISMATCH"
 *     err.meta.category;   // "validation"
 *     err.meta.severity;   // "error"
 *     err.meta.httpStatus; // 422
 *     err.rut;             // the offending input, if provided
 *   }
 * }
 */
export class RutError extends Error {
  override readonly name: "RutError" = "RutError";
  readonly code: RutErrorCode;
  readonly meta: RutErrorMeta;
  readonly rut: string | undefined;

  constructor(code: RutErrorCode, rut?: string, options?: { cause?: unknown }) {
    const message =
      rut !== undefined
        ? `[${code}] Validation failed for input: "${rut}"`
        : `[${code}] Validation failed`;

    super(message, options);

    this.code = code;
    this.meta = RUT_ERROR_META[code];
    this.rut = rut;
  }
}
