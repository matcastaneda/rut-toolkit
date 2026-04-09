import { afterEach, describe, expect, it, vi } from "vitest";
import * as cleanModule from "./clean";
import type { RutErrorCode } from "./errors";
import { RUT_ERROR_META, RutError } from "./errors";
import type { RutDv } from "./types";
import {
  calculateDv,
  ensureRealRut,
  isPlaceholderRut,
  isRut,
  toValidRut,
  tryParseRut,
  verifyDv,
} from "./validate";

/** Valid RUT whose body is not listed as suspicious. */
const VALID_NON_SUSPICIOUS = "13.000.000-2";

const PARSE_RUT_STRING_ERRORS: [string, RutErrorCode][] = [
  ["   \t  ", "RUT_EMPTY"],
  ["12@345.678-5", "RUT_INVALID_CHARACTERS"],
  ["12.345.678-X", "RUT_INVALID_CHARACTERS"],
  ["-", "RUT_TOO_SHORT"],
  ["k", "RUT_TOO_SHORT"],
  ["12345678901", "RUT_TOO_LONG"],
  ["12k34567-8", "RUT_BODY_NOT_NUMERIC"],
  ["12345678-0", "RUT_DV_MISMATCH"],
];

function expectToValidRutThrows(input: string, code: RutErrorCode): void {
  expect(() => toValidRut(input)).toThrow(RutError);
  expect(() => toValidRut(input)).toThrow(expect.objectContaining({ code }));
}

describe("validate", () => {
  describe("calculateDv", () => {
    describe("modulo-11 results", () => {
      it.each([
        ["12345678", "5"],
        ["6", "K"],
        ["13000000", "2"],
      ])("%j -> %j", (body, expected) => {
        expect(calculateDv(body)).toBe(expected);
      });

      it('maps remainder 11 to "0"', () => {
        expect(calculateDv("18762530")).toBe("0");
      });
    });

    describe("invalid bodies", () => {
      it.each([
        "",
        "   ",
        "12a34",
        "K",
        "12K34",
      ])("%j -> empty string", (body) => {
        expect(calculateDv(body)).toBe("");
      });
    });
  });

  describe("verifyDv", () => {
    describe("match", () => {
      it.each([
        ["12345678", "5"],
        ["6", "K"],
        ["6", "k"],
      ])("body %j with dv %j", (body, dv) => {
        expect(verifyDv(body, dv as RutDv)).toBe(true);
      });
    });

    describe("no match", () => {
      it.each([
        ["12345678", "0"],
        ["", "5"],
        ["abc", "5"],
      ])("body %j with dv %j -> false", (body, dv) => {
        expect(verifyDv(body, dv as RutDv)).toBe(false);
      });
    });

    it("returns false if the verification digit is empty", () => {
      const result = verifyDv("12345678", "" as RutDv);
      expect(result).toBe(false);
    });
  });

  describe("isRut", () => {
    describe("valid", () => {
      it.each([
        "12.345.678-5",
        "123456785",
        VALID_NON_SUSPICIOUS,
        "6-K",
      ])("%j", (rut) => {
        expect(isRut(rut)).toBe(true);
      });
    });

    describe("invalid", () => {
      it.each(["12345678-0", "", "1"])("%j -> false", (rut) => {
        expect(isRut(rut)).toBe(false);
      });

      it("returns false for non-string values", () => {
        expect(isRut(null as unknown as string)).toBe(false);
        expect(isRut(undefined as unknown as string)).toBe(false);
      });
    });
  });

  describe("toValidRut", () => {
    describe("success", () => {
      it.each([
        ["12.345.678-5", "123456785"],
        [` ${VALID_NON_SUSPICIOUS} `, "130000002"],
        ["6-k", "6K"],
      ])("%j -> %j", (input, cleaned) => {
        expect(toValidRut(input)).toBe(cleaned);
      });
    });

    describe("throws RutError", () => {
      it.each([
        [null as unknown as string, "RUT_NULLISH"],
        [undefined as unknown as string, "RUT_NULLISH"],
      ])("code %s for nullish", (input, code) => {
        expect(() => toValidRut(input)).toThrow(RutError);
        expect(() => toValidRut(input)).toThrow(
          expect.objectContaining({ code }),
        );
      });

      it.each(
        PARSE_RUT_STRING_ERRORS,
      )("code %s for input %j", (input, code) => {
        expectToValidRutThrows(input, code);
      });
    });
  });

  describe("isPlaceholderRut", () => {
    describe("suspicious bodies", () => {
      it.each(["11.111.111-1", "12.345.678-5", "1-2"])("%j -> true", (rut) => {
        expect(isPlaceholderRut(rut)).toBe(true);
      });
    });

    describe("not suspicious", () => {
      it.each([VALID_NON_SUSPICIOUS, "", "abc"])("%j -> false", (rut) => {
        expect(isPlaceholderRut(rut)).toBe(false);
      });
    });
  });

  describe("ensureRealRut", () => {
    it("does not throw for a normal RUT", () => {
      expect(() => ensureRealRut(VALID_NON_SUSPICIOUS)).not.toThrow();
    });

    it("throws RUT_SUSPICIOUS for a listed body pattern", () => {
      expect(() => ensureRealRut("12.345.678-5")).toThrow(RutError);
      expect(() => ensureRealRut("12.345.678-5")).toThrow(
        expect.objectContaining({ code: "RUT_SUSPICIOUS" }),
      );
    });
  });

  describe("tryParseRut", () => {
    describe("success", () => {
      it("returns ok: true and cleaned rut", () => {
        const result = tryParseRut("12.345.678-5");
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.rut).toBe("123456785");
        }
      });
    });

    describe("failure (RutError from toValidRut)", () => {
      it.each([
        ["12345678-0", "RUT_DV_MISMATCH", RUT_ERROR_META.RUT_DV_MISMATCH],
        ["  ", "RUT_EMPTY", RUT_ERROR_META.RUT_EMPTY],
        [
          "12@3",
          "RUT_INVALID_CHARACTERS",
          RUT_ERROR_META.RUT_INVALID_CHARACTERS,
        ],
      ])("code %s for %j", (input, code, meta) => {
        const result = tryParseRut(input);
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.code).toBe(code);
          expect(result.message).toContain(code);
          expect(result.meta).toBe(meta);
        }
      });
    });

    describe("failure (non-RutError → SYSTEM_UNEXPECTED)", () => {
      afterEach(() => {
        vi.restoreAllMocks();
      });

      it("uses Error.message when a plain Error is thrown from cleanRut", () => {
        vi.spyOn(cleanModule, "cleanRut").mockImplementationOnce(() => {
          throw new Error("Simulated system failure");
        });

        const result = tryParseRut("12.345.678-5");

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.code).toBe("SYSTEM_UNEXPECTED");
          expect(result.message).toBe("Simulated system failure");
          expect(result.meta).toBe(RUT_ERROR_META.SYSTEM_UNEXPECTED);
        }
      });

      it('uses "Unknown error" when a non-Error value is thrown', () => {
        vi.spyOn(cleanModule, "cleanRut").mockImplementationOnce(() => {
          throw "not an Error instance";
        });

        const result = tryParseRut("12.345.678-5");

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.code).toBe("SYSTEM_UNEXPECTED");
          expect(result.message).toBe("Unknown error");
        }
      });
    });
  });
});
