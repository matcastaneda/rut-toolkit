import { describe, expect, it } from "vitest";
import { ERROR_MESSAGES, getErrorMessage } from "./i18n";
import type { ErrorCode, Locale } from "./types";

const ERROR_CODES = Object.keys(ERROR_MESSAGES.es) as ErrorCode[];
const LOCALES: Locale[] = ["es", "en"];

describe("i18n", () => {
  describe("ERROR_MESSAGES", () => {
    it("defines the same keys for es and en", () => {
      expect(Object.keys(ERROR_MESSAGES.es).sort()).toEqual(
        Object.keys(ERROR_MESSAGES.en).sort(),
      );
    });

    it.each(
      LOCALES,
    )("locale %s has a non-empty string for every ErrorCode", (locale) => {
      for (const code of ERROR_CODES) {
        const msg = ERROR_MESSAGES[locale][code];
        expect(typeof msg).toBe("string");
        expect(msg.length).toBeGreaterThan(0);
      }
    });

    it.each(ERROR_CODES)("es and en strings differ for %s", (code) => {
      expect(ERROR_MESSAGES.es[code]).not.toBe(ERROR_MESSAGES.en[code]);
    });
  });

  describe("getErrorMessage", () => {
    describe("resolved messages", () => {
      it.each(
        ERROR_CODES,
      )("matches ERROR_MESSAGES.es[%s] by default", (code) => {
        expect(getErrorMessage(code)).toBe(ERROR_MESSAGES.es[code]);
      });

      it.each(
        ERROR_CODES,
      )("matches ERROR_MESSAGES.en[%s] when locale is en", (code) => {
        expect(getErrorMessage(code, "en")).toBe(ERROR_MESSAGES.en[code]);
      });
    });

    describe("fallback when locale is unknown at runtime", () => {
      it("returns English SYSTEM_UNEXPECTED", () => {
        const msg = getErrorMessage("RUT_EMPTY", "fr" as Locale);
        expect(msg).toBe(ERROR_MESSAGES.en.SYSTEM_UNEXPECTED);
      });
    });
  });
});
