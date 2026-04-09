import { describe, expect, it } from "vitest";
import type { RutLocale } from "../types";
import type { RutErrorCode } from "./codes";
import { getRutErrorMessage, RUT_ERROR_MESSAGES } from "./i18n";

const ERROR_CODES = Object.keys(RUT_ERROR_MESSAGES.es) as RutErrorCode[];
const LOCALES: RutLocale[] = ["es", "en"];

describe("i18n", () => {
  describe("RUT_ERROR_MESSAGES", () => {
    it("defines the same keys for es and en", () => {
      expect(Object.keys(RUT_ERROR_MESSAGES.es).sort()).toEqual(
        Object.keys(RUT_ERROR_MESSAGES.en).sort(),
      );
    });

    it.each(
      LOCALES,
    )("locale %s has a non-empty string for every RutErrorCode", (locale) => {
      for (const code of ERROR_CODES) {
        const msg = RUT_ERROR_MESSAGES[locale][code];
        expect(typeof msg).toBe("string");
        expect(msg.length).toBeGreaterThan(0);
      }
    });

    it.each(ERROR_CODES)("es and en strings differ for %s", (code) => {
      expect(RUT_ERROR_MESSAGES.es[code]).not.toBe(RUT_ERROR_MESSAGES.en[code]);
    });
  });

  describe("getRutErrorMessage", () => {
    describe("resolved messages", () => {
      it.each(
        ERROR_CODES,
      )("matches RUT_ERROR_MESSAGES.es[%s] by default", (code) => {
        expect(getRutErrorMessage(code)).toBe(RUT_ERROR_MESSAGES.es[code]);
      });

      it.each(
        ERROR_CODES,
      )("matches RUT_ERROR_MESSAGES.en[%s] when locale is en", (code) => {
        expect(getRutErrorMessage(code, "en")).toBe(
          RUT_ERROR_MESSAGES.en[code],
        );
      });
    });

    describe("fallback when locale is unknown at runtime", () => {
      it("returns English SYSTEM_UNEXPECTED", () => {
        const msg = getRutErrorMessage("RUT_EMPTY", "fr" as RutLocale);
        expect(msg).toBe(RUT_ERROR_MESSAGES.en.SYSTEM_UNEXPECTED);
      });
    });
  });
});
