import { describe, expect, it } from "vitest";
import type { RutErrorCode } from "./codes";
import { RUT_ERROR_META } from "./meta";

const ALL_CODES = Object.keys(RUT_ERROR_META) as RutErrorCode[];

describe("RUT_ERROR_META", () => {
  describe("completeness", () => {
    it("contains exactly 17 entries — one per RutErrorCode", () => {
      expect(ALL_CODES).toHaveLength(17);
    });

    it.each(ALL_CODES)("has an entry for %s", (code) => {
      expect(RUT_ERROR_META[code]).toBeDefined();
    });
  });

  describe("shape", () => {
    it.each(
      ALL_CODES,
    )("%s entry has category, severity, and httpStatus", (code) => {
      const meta = RUT_ERROR_META[code];

      expect(typeof meta.category).toBe("string");
      expect(typeof meta.severity).toBe("string");
      expect(typeof meta.httpStatus).toBe("number");
    });
  });

  describe("category values", () => {
    const byCategory: [RutErrorCode, string][] = [
      ["RUT_EMPTY", "input"],
      ["RUT_NULLISH", "input"],
      ["RUT_TOO_SHORT", "input"],
      ["RUT_TOO_LONG", "input"],
      ["RUT_INVALID_CHARACTERS", "input"],
      ["RUT_INVALID_FORMAT", "parse"],
      ["RUT_BODY_NOT_NUMERIC", "parse"],
      ["RUT_DV_MISSING", "parse"],
      ["RUT_DV_INVALID", "parse"],
      ["RUT_DV_MISMATCH", "validation"],
      ["RUT_SUSPICIOUS", "business"],
      ["RUT_PROVISIONAL_NOT_ALLOWED", "business"],
      ["RUT_COMPANY_REQUIRED", "business"],
      ["RUT_PERSON_REQUIRED", "business"],
      ["BARCODE_EMPTY", "barcode"],
      ["BARCODE_RUT_NOT_FOUND", "barcode"],
      ["SYSTEM_UNEXPECTED", "system"],
    ];

    it.each(byCategory)("%s has category '%s'", (code, category) => {
      expect(RUT_ERROR_META[code].category).toBe(category);
    });
  });

  describe("severity values", () => {
    const bySeverity: [RutErrorCode, string][] = [
      ["RUT_EMPTY", "warning"],
      ["RUT_TOO_SHORT", "warning"],
      ["RUT_INVALID_FORMAT", "warning"],
      ["RUT_DV_MISSING", "warning"],
      ["RUT_SUSPICIOUS", "warning"],
      ["BARCODE_EMPTY", "warning"],
      ["RUT_DV_MISMATCH", "error"],
      ["RUT_PROVISIONAL_NOT_ALLOWED", "error"],
      ["RUT_COMPANY_REQUIRED", "error"],
      ["RUT_PERSON_REQUIRED", "error"],
      ["BARCODE_RUT_NOT_FOUND", "error"],
      ["SYSTEM_UNEXPECTED", "critical"],
    ];

    it.each(bySeverity)("%s has severity '%s'", (code, severity) => {
      expect(RUT_ERROR_META[code].severity).toBe(severity);
    });
  });

  describe("httpStatus values", () => {
    const byStatus: [RutErrorCode, number][] = [
      ["RUT_EMPTY", 400],
      ["RUT_NULLISH", 400],
      ["RUT_TOO_SHORT", 400],
      ["RUT_TOO_LONG", 400],
      ["RUT_INVALID_CHARACTERS", 400],
      ["RUT_INVALID_FORMAT", 400],
      ["RUT_BODY_NOT_NUMERIC", 400],
      ["RUT_DV_MISSING", 400],
      ["RUT_DV_INVALID", 400],
      ["BARCODE_EMPTY", 400],
      ["RUT_DV_MISMATCH", 422],
      ["RUT_SUSPICIOUS", 422],
      ["RUT_COMPANY_REQUIRED", 422],
      ["RUT_PERSON_REQUIRED", 422],
      ["BARCODE_RUT_NOT_FOUND", 422],
      ["RUT_PROVISIONAL_NOT_ALLOWED", 403],
      ["SYSTEM_UNEXPECTED", 500],
    ];

    it.each(byStatus)("%s has httpStatus %d", (code, status) => {
      expect(RUT_ERROR_META[code].httpStatus).toBe(status);
    });
  });
});
