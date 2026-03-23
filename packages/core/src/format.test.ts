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
      it("keeps two leading body digits and the DV; masks the rest with *", () => {
        expect(maskRut("12.345.678-5")).toBe("12.***.***-5");
      });

      it("does not mask when the body has only one digit (no trailing * run)", () => {
        expect(maskRut("1-2")).toBe("1-2");
      });

      it("normalizes k to K in the visible DV via splitRut", () => {
        expect(maskRut("12.345.678-k")).toBe("12.***.***-K");
      });
    });

    describe("custom pattern", () => {
      it("maps * to hidden positions and copies other chars from the formatted RUT", () => {
        expect(maskRut("12.345.678-5", "XX.XXX.XXX-*")).toBe("12.345.678-*");
      });

      it("stops at the shorter of formatted vs pattern length", () => {
        expect(maskRut("12.345.678-5", "XX.*")).toBe("12.*");
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

      it("respects uppercaseDv: false (hyphen still comes from withHyphen default)", () => {
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
