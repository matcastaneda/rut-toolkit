import { describe, expect, it } from "vitest";
import { RUT_ERROR_CODES } from "./codes";
import type { RutLocale } from "./i18n";
import { getRutErrorMessage, RUT_ERROR_MESSAGES } from "./i18n";

const LOCALES: RutLocale[] = ["es", "en"];

describe("i18n", () => {
  describe("RUT_ERROR_MESSAGES dictionaries", () => {
    it("defines the exact same keys for es and en", () => {
      expect(Object.keys(RUT_ERROR_MESSAGES.es).sort()).toEqual(
        Object.keys(RUT_ERROR_MESSAGES.en).sort(),
      );
    });

    it("covers all official RUT_ERROR_CODES in both languages without missing any", () => {
      const esKeys = Object.keys(RUT_ERROR_MESSAGES.es);
      const enKeys = Object.keys(RUT_ERROR_MESSAGES.en);

      for (const code of RUT_ERROR_CODES) {
        expect(esKeys).toContain(code);
        expect(enKeys).toContain(code);
      }

      expect(esKeys).toHaveLength(RUT_ERROR_CODES.length);
    });

    it.each(
      LOCALES,
    )("locale %s has a non-empty string for every official code", (locale) => {
      for (const code of RUT_ERROR_CODES) {
        const msg = RUT_ERROR_MESSAGES[locale][code];
        expect(typeof msg).toBe("string");
        expect(msg.length).toBeGreaterThan(0);
      }
    });

    it.each(RUT_ERROR_CODES)("es and en strings differ for %s", (code) => {
      expect(RUT_ERROR_MESSAGES.es[code]).not.toBe(RUT_ERROR_MESSAGES.en[code]);
    });
  });

  describe("getRutErrorMessage()", () => {
    describe("resolved messages", () => {
      it.each(
        RUT_ERROR_CODES,
      )("matches RUT_ERROR_MESSAGES.es[%s] by default", (code) => {
        expect(getRutErrorMessage(code)).toBe(RUT_ERROR_MESSAGES.es[code]);
      });

      it.each(
        RUT_ERROR_CODES,
      )("matches RUT_ERROR_MESSAGES.en[%s] when locale is en", (code) => {
        expect(getRutErrorMessage(code, "en")).toBe(
          RUT_ERROR_MESSAGES.en[code],
        );
      });
    });

    describe("fallback mechanisms (runtime safety)", () => {
      it("falls back to SYSTEM_UNEXPECTED of the requested locale if the specific code is missing", () => {
        // @ts-expect-error - simulating a weird runtime string passed from an external source
        const msg = getRutErrorMessage("WEIRD_UNKNOWN_CODE", "es");
        expect(msg).toBe(RUT_ERROR_MESSAGES.es.SYSTEM_UNEXPECTED);
      });

      it("falls back to English SYSTEM_UNEXPECTED if the locale is completely unknown at runtime", () => {
        // @ts-expect-error - simulating an unsupported locale
        const msg = getRutErrorMessage("RUT_EMPTY", "fr");
        expect(msg).toBe(RUT_ERROR_MESSAGES.en.SYSTEM_UNEXPECTED);
      });
    });
  });
});
