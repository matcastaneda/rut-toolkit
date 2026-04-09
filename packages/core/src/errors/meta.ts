import type { RutErrorCode } from "./codes";

/**
 * Categories of errors emitted by {@link RutError}.
 * Used to group errors by their source or severity.
 */
export type RutErrorCategory =
  | "input"
  | "parse"
  | "validation"
  | "business"
  | "barcode"
  | "system";

/**
 * Severities of errors emitted by {@link RutError}.
 * Used to categorize errors by their severity.
 */
export type RutErrorSeverity = "warning" | "error" | "critical";

/**
 * Metadata attached to each {@link RutErrorCode}.
 * Used to provide additional information about the error.
 */
export type RutErrorMeta = {
  readonly category: RutErrorCategory;
  readonly severity: RutErrorSeverity;
  readonly httpStatus: number;
};

/**
 * A frozen, strongly-typed metadata registry from a
 * `{ CODE: "category" | "severity" | "httpStatus" }` mapping.
 * Keys must be `UPPER_SNAKE_CASE`.
 */
export const RUT_ERROR_META = {
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
} as const satisfies Record<RutErrorCode, RutErrorMeta>;
