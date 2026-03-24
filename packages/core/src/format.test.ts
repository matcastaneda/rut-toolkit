import { describe, expect, it } from "vitest";
import {
  buildRut,
  formatRut,
  fromCompactFormat,
  maskRut,
  toCompactFormat,
  toSiiFormat,
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
      it.each([
        "",
        "   ",
        "abc",
        "1",
      ])("returns empty string for %j", (input) => {
        expect(formatRut(input)).toBe("");
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

    describe("custom pattern (Right Alignment)", () => {
      it("maps * to hidden positions from right to left", () => {
        expect(maskRut("12.345.678-5", "XX.XXX.XXX-*")).toBe("12.345.678-*");
      });

      it("correctly aligns patterns for short RUTs (7 digits)", () => {
        expect(maskRut("1.234.567-1", "*.XXX.XXX-X")).toBe("*.234.567-1");
      });

      it("ignores extra pattern on the left when the pattern is longer than the formatted RUT (right-aligned)", () => {
        // Formatted "1-2"; pattern pairs from the right, so the body digit and DV are masked by '*';
        // the hyphen keeps '-' from pattern[4] (not '*').
        expect(maskRut("1-2", "****-*")).toBe("*-*");
      });

      it("when the pattern is shorter than the formatted RUT, missing pattern is treated as pass-through; * still preserves . and -", () => {
        // 10× '*' cover the rightmost 10 chars; the leading "12" uses implicit pass-through.
        expect(maskRut("12.345.678-5", "**********")).toBe("12.***.***-*");
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

  describe("toCompactFormat", () => {
    it("removes dots and keeps hyphen", () => {
      expect(toCompactFormat("12.345.678-5")).toBe("12345678-5");
      expect(toCompactFormat("123456785")).toBe("12345678-5");
    });

    it("returns empty string when split yields no body", () => {
      expect(toCompactFormat("")).toBe("");
    });
  });

  describe("fromCompactFormat", () => {
    it("adds thousands separators and hyphen", () => {
      expect(fromCompactFormat("12345678-5")).toBe("12.345.678-5");
    });
  });

  describe("toSiiFormat", () => {
    it("aliases toCompactFormat", () => {
      const rut = "12.345.678-k";
      expect(toSiiFormat(rut)).toBe(toCompactFormat(rut));
      expect(toSiiFormat(rut)).toBe("12345678-K");
    });
  });
});
