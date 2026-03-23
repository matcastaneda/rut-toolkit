import { describe, expect, it } from "vitest";
import { cleanRut, padRut, splitRut } from "./clean";

describe("clean", () => {
  describe("cleanRut", () => {
    describe("separators and spaces", () => {
      it.each([
        ["12.345.678-9", "123456789"],
        [" 12 345 678 - 9 ", "123456789"],
      ])("removes dots, hyphens and spaces: %j -> %j", (input, expected) => {
        expect(cleanRut(input)).toBe(expected);
      });
    });

    describe("verification digit (K)", () => {
      it.each([
        ["12345678-k", "12345678K"],
        ["12345678K", "12345678K"],
      ])("normalizes k to K: %j -> %j", (input, expected) => {
        expect(cleanRut(input)).toBe(expected);
      });
    });

    describe("leading zeros", () => {
      it.each([
        ["06.543.210-K", "6543210K"],
        ["000123-4", "1234"],
      ])("strips leading zeros by default: %j -> %j", (input, expected) => {
        expect(cleanRut(input)).toBe(expected);
      });

      it.each([
        ["06.543.210-K", "06543210K"],
        ["000123-4", "0001234"],
      ])("preserves leading zeros with keepLeadingZeros: %j -> %j", (input, expected) => {
        expect(cleanRut(input, { keepLeadingZeros: true })).toBe(expected);
      });

      it("uses a single '0' when the body is only zeros and zeros are stripped", () => {
        expect(cleanRut("00.000.000-0")).toBe("0");
      });

      it("keeps multiple zeros when keepLeadingZeros is true and input is all zeros", () => {
        expect(cleanRut("000-0", { keepLeadingZeros: true })).toBe("0000");
      });
    });

    describe("invalid or empty input", () => {
      it.each([
        ["", ""],
        ["   ", ""],
      ])("returns empty string for empty or whitespace-only: %j -> %j", (input, expected) => {
        expect(cleanRut(input)).toBe(expected);
      });

      it("returns empty string for non-string values (runtime guard)", () => {
        expect(cleanRut(null as unknown as string)).toBe("");
        expect(cleanRut(undefined as unknown as string)).toBe("");
        expect(cleanRut(123456789 as unknown as string)).toBe("");
      });
    });

    describe("non-RUT characters", () => {
      it("strips letters and punctuation, keeping digits and K", () => {
        expect(cleanRut(",12.abc.345-9!")).toBe("123459");
      });

      it("handles mixed noise, spacing and casing", () => {
        const input = "  r u t : 00.123.456 - k  ";
        expect(cleanRut(input)).toBe("123456K");
        expect(cleanRut(input, { keepLeadingZeros: true })).toBe("00123456K");
      });
    });
  });

  describe("splitRut", () => {
    describe("body and DV", () => {
      it.each([
        ["12.345.678-9", { body: "12345678", dv: "9" }],
        ["12345678-k", { body: "12345678", dv: "K" }],
        ["12", { body: "1", dv: "2" }],
      ])("splits cleaned RUT: %j -> %j", (input, expected) => {
        expect(splitRut(input)).toEqual(expected);
      });
    });

    describe("leading zeros", () => {
      it("strips leading zeros in the body by default", () => {
        expect(splitRut("06.543.210-K")).toEqual({
          body: "6543210",
          dv: "K",
        });
      });

      it("preserves leading zeros in the body when keepLeadingZeros is true", () => {
        expect(splitRut("06.543.210-K", { keepLeadingZeros: true })).toEqual({
          body: "06543210",
          dv: "K",
        });
      });
    });

    describe("invalid or too short", () => {
      it("returns empty parts when cleaned length is below 2", () => {
        expect(splitRut("1")).toEqual({ body: "", dv: "" });
      });

      it.each([
        ["", { body: "", dv: "" }],
        ["abc", { body: "", dv: "" }],
        ["   ", { body: "", dv: "" }],
      ])("returns empty parts for unusable input: %j", (input, expected) => {
        expect(splitRut(input)).toEqual(expected);
      });

      it("returns empty parts for non-string input (runtime guard)", () => {
        expect(splitRut(null as unknown as string)).toEqual({
          body: "",
          dv: "",
        });
      });
    });
  });

  describe("padRut", () => {
    describe("padding", () => {
      it("pads a short body to the default width (8)", () => {
        expect(padRut("1.234.567-8")).toBe("012345678");
      });

      it("leaves the body unchanged when it already matches the target length", () => {
        expect(padRut("12.345.678-9")).toBe("123456789");
      });

      it("accepts a custom body length", () => {
        expect(padRut("12.345.678-9", 9)).toBe("0123456789");
      });

      it("pads very short RUTs", () => {
        expect(padRut("1-2")).toBe("000000012");
      });
    });

    describe("body longer than target", () => {
      it("does not trim when body exceeds bodyLength", () => {
        expect(padRut("12.345.678-9", 7)).toBe("123456789");
      });
    });

    describe("invalid input", () => {
      it.each([
        "",
        "1",
        "   ",
        "abc",
      ])("returns empty string for %j", (input) => {
        expect(padRut(input)).toBe("");
      });

      it("returns empty string for non-string input (runtime guard)", () => {
        expect(padRut(null as unknown as string)).toBe("");
        expect(padRut(undefined as unknown as string)).toBe("");
      });
    });
  });
});
