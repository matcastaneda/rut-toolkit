import { describe, expect, it } from "vitest";
import { RUT_ERROR_CODES } from "./codes";
import { RUT_ERROR_META } from "./meta";

describe("RUT_ERROR_CODES", () => {
  describe("structure and completeness", () => {
    it("is an array", () => {
      expect(Array.isArray(RUT_ERROR_CODES)).toBe(true);
    });

    it("contains exactly 17 entries", () => {
      expect(RUT_ERROR_CODES).toHaveLength(17);
    });

    it("contains no duplicates", () => {
      const uniqueCodes = new Set(RUT_ERROR_CODES);
      expect(uniqueCodes.size).toBe(RUT_ERROR_CODES.length);
    });

    it("is derived from RUT_ERROR_META keys (single source of truth)", () => {
      expect([...RUT_ERROR_CODES]).toEqual(Object.keys(RUT_ERROR_META));
    });
  });

  describe("values", () => {
    it("all items are strings", () => {
      for (const code of RUT_ERROR_CODES) {
        expect(typeof code).toBe("string");
      }
    });
  });

  describe("immutability", () => {
    it("is frozen (cannot be mutated at runtime)", () => {
      expect(Object.isFrozen(RUT_ERROR_CODES)).toBe(true);
    });
  });
});
