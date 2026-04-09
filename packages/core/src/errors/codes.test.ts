import { describe, expect, it } from "vitest";
import type { RutErrorCode } from "./codes";
import { RUT_ERROR_CODES } from "./codes";

const ALL_CODES = Object.keys(RUT_ERROR_CODES) as RutErrorCode[];

const EXPECTED_MESSAGES: Record<RutErrorCode, string> = {
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
};

describe("RUT_ERROR_CODES", () => {
  describe("completeness", () => {
    it("contains exactly 17 entries", () => {
      expect(ALL_CODES).toHaveLength(17);
    });

    it.each(ALL_CODES)("has an entry for %s", (code) => {
      expect(RUT_ERROR_CODES[code]).toBeDefined();
    });
  });

  describe("entry shape", () => {
    it.each(
      ALL_CODES,
    )("%s entry has a .code property matching the key", (code) => {
      expect(RUT_ERROR_CODES[code].code).toBe(code);
    });

    it.each(ALL_CODES)("%s entry has a non-empty .message string", (code) => {
      expect(typeof RUT_ERROR_CODES[code].message).toBe("string");
      expect(RUT_ERROR_CODES[code].message.length).toBeGreaterThan(0);
    });

    it.each(ALL_CODES)("%s entry .toString() returns the key", (code) => {
      expect(RUT_ERROR_CODES[code].toString()).toBe(code);
    });

    it.each(
      ALL_CODES,
    )("%s coerces to its key in a template literal", (code) => {
      expect(`${RUT_ERROR_CODES[code]}`).toBe(code);
    });
  });

  describe("message values", () => {
    it.each(ALL_CODES)("%s has the expected message", (code) => {
      expect(RUT_ERROR_CODES[code].message).toBe(EXPECTED_MESSAGES[code]);
    });
  });
});
