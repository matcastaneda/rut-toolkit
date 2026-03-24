import { describe, expect, it } from "vitest";
import { analyzeIdBarcode, isIdBarcode, parseIdBarcode } from "./barcode";

const QR_SAMPLE =
  "https://portal.nuevosidiv.registrocivil.cl/document-validity?RUN=12345678-5&type=CEDULA";

describe("barcode", () => {
  describe("isIdBarcode", () => {
    it("returns true when the string includes registrocivil.cl and a RUN= query param", () => {
      expect(isIdBarcode(QR_SAMPLE)).toBe(true);
      expect(
        isIdBarcode(
          "https://foo.registrocivil.cl/path?other=1&RUN=12.345.678-5",
        ),
      ).toBe(true);
    });

    it("returns false when the domain is missing, RUN= is missing, or input is not a string", () => {
      expect(isIdBarcode("https://example.com?RUN=12345678-5")).toBe(false);
      expect(isIdBarcode("https://registrocivil.cl/path?foo=1")).toBe(false);
      expect(isIdBarcode("RUN=12345678-5")).toBe(false);
      expect(isIdBarcode("")).toBe(false);
      expect(isIdBarcode(null as unknown as string)).toBe(false);
    });
  });

  describe("parseIdBarcode", () => {
    describe("success", () => {
      it("extracts RUN from a Registro Civil URL and returns cleaned ValidRut", () => {
        expect(parseIdBarcode(QR_SAMPLE)).toBe("123456785");
      });

      it("decodes a URL-encoded RUN value", () => {
        expect(
          parseIdBarcode("https://x.registrocivil.cl/y?RUN=12345678%2D5"),
        ).toBe("123456785");
      });

      it("falls back to a RUT-like token in raw text", () => {
        expect(parseIdBarcode("RUT: 12.345.678-5 extra")).toBe("123456785");
        expect(parseIdBarcode("field 6-k trailing")).toBe("6K");
      });
    });

    describe("null", () => {
      it.each([
        ["", "empty"],
        ["   ", "whitespace"],
        ["no rut here", "no pattern"],
      ])("%s -> null (%s)", (input) => {
        expect(parseIdBarcode(input)).toBeNull();
      });

      it("returns null for non-string input", () => {
        expect(parseIdBarcode(null as unknown as string)).toBeNull();
      });

      it("returns null when RUN/DV is present but structurally invalid", () => {
        expect(
          parseIdBarcode("https://x.registrocivil.cl?RUN=12345678-0"),
        ).toBeNull();
      });

      it("returns null when the domain matches but there is no RUN capture", () => {
        expect(
          parseIdBarcode("https://registrocivil.cl/path?foo=1"),
        ).toBeNull();
      });
    });
  });

  describe("analyzeIdBarcode", () => {
    it("returns a frozen UNKNOWN result for empty or non-string input", () => {
      const a = analyzeIdBarcode("  ");
      expect(a).toEqual({ rut: null, source: "UNKNOWN" });
      expect(Object.isFrozen(a)).toBe(true);

      const b = analyzeIdBarcode(null as unknown as string);
      expect(b).toEqual({ rut: null, source: "UNKNOWN" });
      expect(Object.isFrozen(b)).toBe(true);
    });

    it("classifies Registro Civil URLs as QR_FRONT", () => {
      const result = analyzeIdBarcode(QR_SAMPLE);
      expect(result.source).toBe("QR_FRONT");
      expect(result.rut).toBe("123456785");
      expect(Object.isFrozen(result)).toBe(true);
    });

    it("uses QR_FRONT even when the RUN in the URL is invalid (rut null)", () => {
      const result = analyzeIdBarcode(
        "https://x.registrocivil.cl?RUN=12345678-0",
      );
      expect(result.source).toBe("QR_FRONT");
      expect(result.rut).toBeNull();
    });

    it("classifies plain text with a valid RUT as PDF417_REAR", () => {
      const result = analyzeIdBarcode("RUT: 12.345.678-5");
      expect(result.source).toBe("PDF417_REAR");
      expect(result.rut).toBe("123456785");
      expect(Object.isFrozen(result)).toBe(true);
    });

    it("returns UNKNOWN when no valid RUT can be parsed from non-QR text", () => {
      const result = analyzeIdBarcode("hello world");
      expect(result).toEqual({ rut: null, source: "UNKNOWN" });
      expect(Object.isFrozen(result)).toBe(true);
    });

    it("returns UNKNOWN when text matches RUT shape but DV is wrong", () => {
      const result = analyzeIdBarcode("RUT: 12345678-0");
      expect(result).toEqual({ rut: null, source: "UNKNOWN" });
    });
  });
});
