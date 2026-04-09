import { defineErrorCodes } from "./utils";

/**
 * A frozen, strongly-typed error-code registry from a
 * `{ CODE: "message" }` mapping. Keys must be `UPPER_SNAKE_CASE`.
 */
export const RUT_ERROR_CODES = defineErrorCodes({
  RUT_EMPTY: "The provided RUT string is empty.",
  RUT_NULLISH: "The provided RUT is null or undefined.",
  RUT_TOO_SHORT: "The RUT string is too short to be valid.",
  RUT_TOO_LONG: "The RUT string is too long to be valid.",
  RUT_INVALID_CHARACTERS: "The RUT contains invalid characters.",
  RUT_INVALID_FORMAT: "The RUT format is unrecognizable.",
  RUT_BODY_NOT_NUMERIC: "The RUT body must contain only numeric characters.",
  RUT_DV_MISSING: "The RUT check digit (DV) is missing.",
  RUT_DV_INVALID: "The RUT check digit (DV) format is invalid.",
  RUT_DV_MISMATCH:
    "The RUT check digit (DV) does not match the calculated body.",
  RUT_SUSPICIOUS: "The RUT is structurally valid but marked as suspicious.",
  RUT_PROVISIONAL_NOT_ALLOWED:
    "Provisional RUTs are not permitted in this context.",
  RUT_COMPANY_REQUIRED: "A company RUT is required.",
  RUT_PERSON_REQUIRED: "A natural person RUT is required.",
  BARCODE_EMPTY: "The provided barcode data is empty.",
  BARCODE_RUT_NOT_FOUND:
    "Could not locate a valid RUT within the barcode data.",
  SYSTEM_UNEXPECTED: "An unexpected system error occurred.",
});

export type RutErrorCode = keyof typeof RUT_ERROR_CODES;
