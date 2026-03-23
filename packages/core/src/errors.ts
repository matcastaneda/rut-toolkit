import type { ErrorCode, ErrorMeta } from "./types";

type ErrorConstructorWithCapture = typeof Error & {
  captureStackTrace?(
    targetObject: object,
    constructorOpt?: new (...args: never[]) => unknown,
  ): void;
};

/** Semantic metadata for every {@link ErrorCode}. */
export const ERROR_META = {
  RUT_EMPTY: { category: "input", severity: "warning", httpStatus: 400 },
  RUT_NULLISH: { category: "input", severity: "warning", httpStatus: 400 },
  RUT_TOO_SHORT: { category: "input", severity: "warning", httpStatus: 400 },
  RUT_TOO_LONG: { category: "input", severity: "warning", httpStatus: 400 },
  RUT_INVALID_CHARACTERS: {
    category: "input",
    severity: "warning",
    httpStatus: 400,
  },
  RUT_INVALID_FORMAT: {
    category: "parse",
    severity: "warning",
    httpStatus: 400,
  },
  RUT_BODY_NOT_NUMERIC: {
    category: "parse",
    severity: "warning",
    httpStatus: 400,
  },
  RUT_DV_MISSING: { category: "parse", severity: "warning", httpStatus: 400 },
  RUT_DV_INVALID: { category: "parse", severity: "warning", httpStatus: 400 },
  RUT_DV_MISMATCH: {
    category: "validation",
    severity: "error",
    httpStatus: 422,
  },
  RUT_SUSPICIOUS: {
    category: "business",
    severity: "warning",
    httpStatus: 422,
  },
  RUT_PROVISIONAL_NOT_ALLOWED: {
    category: "business",
    severity: "error",
    httpStatus: 403,
  },
  RUT_COMPANY_REQUIRED: {
    category: "business",
    severity: "error",
    httpStatus: 422,
  },
  RUT_PERSON_REQUIRED: {
    category: "business",
    severity: "error",
    httpStatus: 422,
  },
  BARCODE_EMPTY: { category: "barcode", severity: "warning", httpStatus: 400 },
  BARCODE_RUT_NOT_FOUND: {
    category: "barcode",
    severity: "error",
    httpStatus: 422,
  },
  SYSTEM_UNEXPECTED: {
    category: "system",
    severity: "critical",
    httpStatus: 500,
  },
} as const satisfies Record<ErrorCode, ErrorMeta>;

/**
 * Structured error thrown by rut-toolkit functions.
 * Carries a machine-readable {@link ErrorCode} and semantic metadata
 * for programmatic handling, logging, and API responses.
 *
 * @example
 * try {
 *   parseRut(input);
 * } catch (err) {
 *   if (err instanceof RutError) {
 *     err.code;          // "RUT_DV_MISMATCH"
 *     err.meta.category; // "validation"
 *     err.meta.severity; // "error"
 *     err.meta.httpStatus; // 422
 *   }
 * }
 */
export class RutError extends Error {
  override readonly name = "RutError";
  readonly code: ErrorCode;
  readonly meta: (typeof ERROR_META)[ErrorCode];

  constructor(code: ErrorCode, rut?: string) {
    const detail = rut != null ? ` ("${rut}")` : "";
    super(`[${code}] ${detail}`.trim());

    Object.setPrototypeOf(this, new.target.prototype);

    const ErrorWithCapture = Error as ErrorConstructorWithCapture;
    if (typeof ErrorWithCapture.captureStackTrace === "function") {
      ErrorWithCapture.captureStackTrace(this, RutError);
    }

    this.code = code;
    this.meta = ERROR_META[code];

    Object.freeze(this);
  }
}
