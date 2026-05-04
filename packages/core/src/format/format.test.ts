import { describe, expect, it, vi } from "vitest";
import * as cleanModule from "../clean";
import {
  buildRut,
  formatRut,
  fromCompactRut,
  maskRut,
  toCompactRut,
  toSiiRut,
} from "./format";

describe("format", () => {
  describe("formatRut", () => {
    describe("valid input", () => {
      it.each([
        ["12.345.678-5", "12.345.678-5"],
        ["123456785", "12.345.678-5"],
        [" 12.345.678-5 ", "12.345.678-5"],
      ])("default dotted + hyphen: %j -> %j", (input, expected) => {
        expect(formatRut(input)).toBe(expected);
      });

      it.each([
        ["12.345.678-5", { withDots: false }, "12345678-5"],
        ["123456785", { withDots: false, withHyphen: true }, "12345678-5"],
        ["12.345.678-5", { withDots: false, withHyphen: false }, "123456785"],
      ])("options %j for %j", (input, options, expected) => {
        expect(formatRut(input, options)).toBe(expected);
      });

      it("applies uppercaseDv: false for the verification digit", () => {
        expect(formatRut("12345678-k", { uppercaseDv: false })).toBe(
          "12.345.678-k",
        );
      });

      it("pads the body when padBodyLength is greater than body length", () => {
        expect(formatRut("1-2", { padBodyLength: 8, withDots: false })).toBe(
          "00000001-2",
        );
        expect(formatRut("1-2", { padBodyLength: 8 })).toBe("00.000.001-2");
      });
    });

    describe("invalid input", () => {
      it.each(["", "   ", "abc"])("returns empty string for %j", (input) => {
        expect(formatRut(input)).toBe("");
      });

      it("returns the digit (uppercased) when cleaned length is 1", () => {
        const spy = vi.spyOn(cleanModule, "cleanRut").mockReturnValueOnce("1");
        expect(formatRut("1")).toBe("1");
        spy.mockRestore();
      });

      it("returns lowercase DV when cleaned length is 1 and uppercaseDv is false", () => {
        const spy = vi.spyOn(cleanModule, "cleanRut").mockReturnValueOnce("K");
        expect(formatRut("K", { uppercaseDv: false })).toBe("k");
        spy.mockRestore();
      });
    });
  });

  describe("maskRut", () => {
    describe("default mask (no pattern)", () => {
      it("preserves the first group before the dot (RUT of 8 digits)", () => {
        expect(maskRut("12.345.678-5")).toBe("12.***.***-5");
      });

      it("preserves the first group before the dot (RUT of 7 digits)", () => {
        expect(maskRut("1.234.567-1")).toBe("1.***.***-1");
      });

      it("handles extremely short RUTs by showing only 1 digit", () => {
        expect(maskRut("123-4")).toBe("1**-4");
      });

      it("handles single digit RUTs", () => {
        expect(maskRut("1-2")).toBe("1-2");
      });

      it("normalizes k to K in the visible DV", () => {
        expect(maskRut("12.345.678-k")).toBe("12.***.***-K");
      });
    });

    describe("RutMaskOptions (pattern & maskChar)", () => {
      it("maps * to hidden positions and X to visible positions", () => {
        expect(maskRut("12.345.678-5", { pattern: "XX.XXX.XXX-*" })).toBe(
          "12.345.678-*",
        );
      });

      it("correctly aligns patterns from right for short RUTs (7 digits)", () => {
        expect(maskRut("1.234.567-1", { pattern: "*.XXX.XXX-X" })).toBe(
          "*.234.567-1",
        );
      });

      it("ignores extra pattern on the left when the pattern is longer than the formatted RUT", () => {
        expect(maskRut("1-2", { pattern: "****-*" })).toBe("*-*");
      });

      it("treats missing pattern on the left as pass-through (X)", () => {
        expect(maskRut("12.345.678-5", { pattern: "**********" })).toBe(
          "12.***.***-*",
        );
      });

      it("supports custom maskChar without pattern", () => {
        expect(maskRut("12.345.678-5", { maskChar: "•" })).toBe("12.•••.•••-5");
      });

      it("combines custom maskChar and pattern correctly", () => {
        expect(
          maskRut("12.345.678-5", { pattern: "**.***.XXX-X", maskChar: "•" }),
        ).toBe("••.•••.678-5");
      });

      it("defaults to masking unknown characters in pattern for safety", () => {
        expect(maskRut("12.345.678-5", { pattern: "??.###.XXX-X" })).toBe(
          "**.***.678-5",
        );
      });
    });

    describe("invalid input", () => {
      it.each(["", "abc", "   "])("returns empty string for %j", (input) => {
        expect(maskRut(input)).toBe("");
      });
    });
  });

  describe("buildRut", () => {
    describe("assembly", () => {
      it.each([
        [12345678, "5", {}, "12.345.678-5"],
        [12345678, "5", { withDots: false }, "12345678-5"],
        [12345678, "k", { withDots: false, withHyphen: false }, "12345678K"],
      ])("buildRut(%s, %s, %j) -> %j", (body, dv, options, expected) => {
        expect(buildRut(body, dv, options)).toBe(expected);
      });

      it("accepts string body and numeric dv", () => {
        expect(buildRut("12345678", 5)).toBe("12.345.678-5");
      });

      it("respects uppercaseDv: false", () => {
        expect(
          buildRut(12345678, "k", { uppercaseDv: false, withDots: false }),
        ).toBe("12345678-k");
      });

      it("can emit a lowercase k when hyphen is also disabled", () => {
        expect(
          buildRut(12345678, "k", {
            uppercaseDv: false,
            withDots: false,
            withHyphen: false,
          }),
        ).toBe("12345678k");
      });

      it("pads body when padBodyLength is set", () => {
        expect(buildRut(123, "4", { padBodyLength: 8, withDots: false })).toBe(
          "00000123-4",
        );
      });
    });

    describe("empty / invalid parts", () => {
      it.each([
        ["", "5"],
        ["0", "5"],
        ["00000", "5"],
        [0, "5"],
        [12345678, ""],
        [12345678, "   "],
      ] as const)("returns empty string for body/dv %j / %j", (body, dv) => {
        expect(buildRut(body, dv)).toBe("");
      });
    });
  });

  describe("toCompactRut", () => {
    it("removes dots and keeps hyphen", () => {
      expect(toCompactRut("12.345.678-5")).toBe("12345678-5");
      expect(toCompactRut("123456785")).toBe("12345678-5");
    });

    it("returns empty string when split yields no body", () => {
      expect(toCompactRut("")).toBe("");
    });
  });

  describe("fromCompactRut", () => {
    it("adds thousands separators and hyphen", () => {
      expect(fromCompactRut("12345678-5")).toBe("12.345.678-5");
    });
  });

  describe("toSiiRut", () => {
    it("aliases toCompactRut", () => {
      const rut = "12.345.678-k";
      expect(toSiiRut(rut)).toBe(toCompactRut(rut));
      expect(toSiiRut(rut)).toBe("12345678-K");
    });
  });
});
