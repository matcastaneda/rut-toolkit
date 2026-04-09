import { describe, expect, it } from "vitest";
import {
  analyzeRutBarcode,
  isRegistroCivilQrUrl,
  parseRutFromBarcode,
} from "./barcode";

const QR_SAMPLE =
  "https://portal.nuevosidiv.registrocivil.cl/document-validity?RUN=12345678-5&type=CEDULA";

describe("barcode", () => {
  describe("isRegistroCivilQrUrl", () => {
    it("returns true when the string includes registrocivil.cl and a RUN= query param", () => {
      expect(isRegistroCivilQrUrl(QR_SAMPLE)).toBe(true);
      expect(
        isRegistroCivilQrUrl(
          "https://foo.registrocivil.cl/path?other=1&RUN=12.345.678-5",
        ),
      ).toBe(true);
    });

    it("returns false when the domain is missing, RUN= is missing, or input is not a string", () => {
      expect(isRegistroCivilQrUrl("https://example.com?RUN=12345678-5")).toBe(
        false,
      );
      expect(isRegistroCivilQrUrl("https://registrocivil.cl/path?foo=1")).toBe(
        false,
      );
      expect(isRegistroCivilQrUrl("RUN=12345678-5")).toBe(false);
      expect(isRegistroCivilQrUrl("")).toBe(false);
      expect(isRegistroCivilQrUrl(null as unknown as string)).toBe(false);
    });
  });

  describe("parseRutFromBarcode", () => {
    describe("success", () => {
      it("extracts RUN from a Registro Civil URL and returns cleaned ValidRut", () => {
        expect(parseRutFromBarcode(QR_SAMPLE)).toBe("123456785");
      });

      it("decodes a URL-encoded RUN value", () => {
        expect(
          parseRutFromBarcode("https://x.registrocivil.cl/y?RUN=12345678%2D5"),
        ).toBe("123456785");
      });

      it("falls back to a RUT-like token in raw text", () => {
        expect(parseRutFromBarcode("RUT: 12.345.678-5 extra")).toBe(
          "123456785",
        );
        expect(parseRutFromBarcode("field 6-k trailing")).toBe("6K");
      });
    });

    describe("null", () => {
      it.each([
        ["", "empty"],
        ["   ", "whitespace"],
        ["no rut here", "no pattern"],
      ])("%s -> null (%s)", (input) => {
        expect(parseRutFromBarcode(input)).toBeNull();
      });

      it("returns null for non-string input", () => {
        expect(parseRutFromBarcode(null as unknown as string)).toBeNull();
      });

      it("returns null when RUN/DV is present but structurally invalid", () => {
        expect(
          parseRutFromBarcode("https://x.registrocivil.cl?RUN=12345678-0"),
        ).toBeNull();
      });

      it("returns null when the domain matches but there is no RUN capture", () => {
        expect(
          parseRutFromBarcode("https://registrocivil.cl/path?foo=1"),
        ).toBeNull();
      });
    });
  });

  describe("analyzeRutBarcode", () => {
    it("returns UNKNOWN result for empty or non-string input", () => {
      expect(analyzeRutBarcode("  ")).toEqual({
        ok: false,
        rut: null,
        source: "UNKNOWN",
      });
      expect(analyzeRutBarcode(null as unknown as string)).toEqual({
        ok: false,
        rut: null,
        source: "UNKNOWN",
      });
    });

    it("classifies Registro Civil URLs as QR_FRONT", () => {
      const result = analyzeRutBarcode(QR_SAMPLE);
      expect(result.source).toBe("QR_FRONT");
      expect(result.ok).toBe(true);
      expect(result.rut).toBe("123456785");
    });

    it("uses QR_FRONT even when the RUN in the URL is invalid (rut null)", () => {
      const result = analyzeRutBarcode(
        "https://x.registrocivil.cl?RUN=12345678-0",
      );
      expect(result.source).toBe("QR_FRONT");
      expect(result.ok).toBe(false);
      expect(result.rut).toBeNull();
    });

    it("classifies plain text with a valid RUT as PDF417_REAR", () => {
      const result = analyzeRutBarcode("RUT: 12.345.678-5");
      expect(result.source).toBe("PDF417_REAR");
      expect(result.ok).toBe(true);
      expect(result.rut).toBe("123456785");
    });

    it("returns UNKNOWN when no valid RUT can be parsed from non-QR text", () => {
      expect(analyzeRutBarcode("hello world")).toEqual({
        ok: false,
        rut: null,
        source: "UNKNOWN",
      });
    });

    it("returns UNKNOWN when text matches RUT shape but DV is wrong", () => {
      expect(analyzeRutBarcode("RUT: 12345678-0")).toEqual({
        ok: false,
        rut: null,
        source: "UNKNOWN",
      });
    });
  });
});
