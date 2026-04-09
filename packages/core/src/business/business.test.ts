import { describe, expect, it } from "vitest";
import { RutError } from "../errors";
import {
  ensureCompanyRut,
  ensureNotProvisionalRut,
  ensurePersonRut,
  isCompanyRut,
  isPersonRut,
  isProvisionalRut,
} from "./business";

describe("business", () => {
  describe("isCompanyRut", () => {
    describe("company range [50_000_000, 99_999_999]", () => {
      it.each([
        ["50.000.000-2", true],
        ["76.123.456-7", true],
        ["99.999.999-3", true],
        ["49.999.999-K", false],
        ["100.000.000-4", false],
        ["12.345.678-5", false],
        ["", false],
        ["abc", false],
      ])("%j -> %s", (rut, expected) => {
        expect(isCompanyRut(rut)).toBe(expected);
      });
    });

    describe("outside company range", () => {
      it.each([
        "1-9",
        "12.345.678-5",
        "49.999.999-0",
        "100.000.000-0",
        "100.200.300-0",
      ])("%j -> false", (rut) => {
        expect(isCompanyRut(rut)).toBe(false);
      });
    });

    describe("invalid or empty", () => {
      it.each(["", "abc", "0-0", "1"])("%j -> false", (rut) => {
        expect(isCompanyRut(rut)).toBe(false);
      });
    });
  });

  describe("isPersonRut", () => {
    describe("natural person (0 < body < 50_000_000)", () => {
      it.each([
        ["12.345.678-5", true],
        ["1-9", true],
        ["49999999-0", true],
      ])("%j -> true", (rut) => {
        expect(isPersonRut(rut)).toBe(true);
      });
    });

    it("is true for SII provisional band 48M–49M (still below 50M)", () => {
      expect(isPersonRut("48.012.345-0")).toBe(true);
    });

    describe("not a person body", () => {
      it.each([
        ["76.123.456-0", false],
        ["50000000-0", false],
        ["0-0", false],
        ["00.000.000-0", false],
      ])("%j -> false", (rut) => {
        expect(isPersonRut(rut)).toBe(false);
      });
    });

    describe("invalid or empty", () => {
      it.each(["", "   ", "xyz"])("%j -> false", (rut) => {
        expect(isPersonRut(rut)).toBe(false);
      });
    });
  });

  describe("isProvisionalRut", () => {
    describe("IPE/IPA band [100_000_000, 199_999_999]", () => {
      it.each([
        "100.200.300-0",
        "199999999-0",
        "100000000-0",
      ])("%j -> true", (rut) => {
        expect(isProvisionalRut(rut)).toBe(true);
      });
    });

    describe("SII foreign-investor band [48_000_000, 49_999_999]", () => {
      it.each(["48.000.000-0", "49.999.999-0"])("%j -> true", (rut) => {
        expect(isProvisionalRut(rut)).toBe(true);
      });
    });

    describe("not provisional", () => {
      it.each([
        ["12.345.678-5", false],
        ["50.000.000-0", false],
        ["47.999.999-0", false],
        ["200.000.000-0", false],
      ])("%j -> false", (rut) => {
        expect(isProvisionalRut(rut)).toBe(false);
      });
    });

    describe("invalid or empty", () => {
      it.each(["", "1"])("%j -> false", (rut) => {
        expect(isProvisionalRut(rut)).toBe(false);
      });
    });
  });

  describe("ensureCompanyRut", () => {
    it("does not throw for a company-range body", () => {
      expect(() => ensureCompanyRut("76.123.456-0")).not.toThrow();
    });

    it("throws RutError RUT_COMPANY_REQUIRED otherwise", () => {
      expect(() => ensureCompanyRut("12.345.678-5")).toThrow(RutError);
      expect(() => ensureCompanyRut("12.345.678-5")).toThrow(
        expect.objectContaining({ code: "RUT_COMPANY_REQUIRED" }),
      );
    });
  });

  describe("ensurePersonRut", () => {
    it("does not throw for a natural-person body", () => {
      expect(() => ensurePersonRut("12.345.678-5")).not.toThrow();
    });

    it("throws RutError RUT_PERSON_REQUIRED for a company body", () => {
      expect(() => ensurePersonRut("76.123.456-0")).toThrow(RutError);
      expect(() => ensurePersonRut("76.123.456-0")).toThrow(
        expect.objectContaining({ code: "RUT_PERSON_REQUIRED" }),
      );
    });
  });

  describe("ensureNotProvisionalRut", () => {
    it("does not throw when the body is not provisional", () => {
      expect(() => ensureNotProvisionalRut("12.345.678-5")).not.toThrow();
    });

    it.each([
      ["100.200.300-0", "IPE range"],
      ["48.000.000-0", "SII foreigner range"],
    ])("throws RUT_PROVISIONAL_NOT_ALLOWED for %s (%s)", (rut) => {
      expect(() => ensureNotProvisionalRut(rut)).toThrow(RutError);
      expect(() => ensureNotProvisionalRut(rut)).toThrow(
        expect.objectContaining({ code: "RUT_PROVISIONAL_NOT_ALLOWED" }),
      );
    });
  });
});
