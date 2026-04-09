import { describe, expect, it } from "vitest";
import { RutError } from "./class";
import type { RutErrorCode } from "./codes";
import { RUT_ERROR_CODES } from "./codes";
import { RUT_ERROR_META } from "./meta";

const ALL_CODES = Object.keys(RUT_ERROR_META) as RutErrorCode[];

describe("RutError", () => {
  describe("identity and prototype chain", () => {
    it("is an instance of both RutError and Error", () => {
      const error = new RutError("RUT_EMPTY");

      expect(error).toBeInstanceOf(RutError);
      expect(error).toBeInstanceOf(Error);
    });

    it("has name 'RutError' — not 'Error'", () => {
      expect(new RutError("RUT_EMPTY").name).toBe("RutError");
    });

    it("preserves the prototype chain so instanceof works after throw/catch", () => {
      let caught: unknown;
      try {
        throw new RutError("SYSTEM_UNEXPECTED");
      } catch (e) {
        caught = e;
      }

      expect(caught).toBeInstanceOf(RutError);
      expect(caught).toBeInstanceOf(Error);
      expect(Object.getPrototypeOf(caught)).toBe(RutError.prototype);
    });
  });

  describe("message construction", () => {
    it("includes [code], default message, and quoted rut when rut is provided", () => {
      const code = "RUT_DV_MISMATCH";
      const rut = "12345678-0";
      const expected = `[${code}] ${RUT_ERROR_CODES[code].message} ("${rut}")`;

      expect(new RutError(code, rut).message).toBe(expected);
    });

    it("includes only [code] and default message when rut is omitted", () => {
      const code = "BARCODE_EMPTY";
      const expected = `[${code}] ${RUT_ERROR_CODES[code].message}`;

      expect(new RutError(code).message).toBe(expected);
    });

    it("treats empty-string rut as provided — includes it in the message", () => {
      const code = "RUT_EMPTY";
      const expected = `[${code}] ${RUT_ERROR_CODES[code].message} ("")`;

      expect(new RutError(code, "").message).toBe(expected);
    });
  });

  describe("properties", () => {
    it("exposes the error code on .code", () => {
      expect(new RutError("RUT_TOO_SHORT").code).toBe("RUT_TOO_SHORT");
    });

    it("exposes the rut string on .rut when provided", () => {
      expect(new RutError("RUT_INVALID_FORMAT", "abc").rut).toBe("abc");
    });

    it("exposes empty string on .rut when an empty string is passed", () => {
      expect(new RutError("RUT_EMPTY", "").rut).toBe("");
    });

    it(".rut is undefined when the second argument is omitted", () => {
      expect(new RutError("RUT_NULLISH").rut).toBeUndefined();
    });

    it("attaches the correct RUT_ERROR_META entry to .meta (strict identity)", () => {
      const code = "RUT_DV_MISMATCH";
      const error = new RutError(code);

      expect(error.meta).toBe(RUT_ERROR_META[code]);
    });

    it("exposes correct meta fields for a representative code", () => {
      const error = new RutError("SYSTEM_UNEXPECTED");

      expect(error.meta.category).toBe("system");
      expect(error.meta.severity).toBe("critical");
      expect(error.meta.httpStatus).toBe(500);
    });

    it.each(
      ALL_CODES,
    )(".meta for %s is the exact same object as RUT_ERROR_META[code]", (code) => {
      expect(new RutError(code).meta).toBe(RUT_ERROR_META[code]);
    });
  });

  describe("error chaining (cause)", () => {
    it("stores cause in .cause when options.cause is provided", () => {
      const original = new Error("original");
      const error = new RutError("SYSTEM_UNEXPECTED", undefined, {
        cause: original,
      });

      expect(error.cause).toBe(original);
    });

    it("stores a non-Error cause value", () => {
      const error = new RutError("SYSTEM_UNEXPECTED", undefined, {
        cause: "string-cause",
      });

      expect(error.cause).toBe("string-cause");
    });

    it("cause is undefined when options are omitted", () => {
      expect(new RutError("RUT_EMPTY").cause).toBeUndefined();
    });
  });

  describe("stack trace", () => {
    it("has a non-empty .stack string", () => {
      const error = new RutError("RUT_TOO_LONG");

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
      expect(error.stack?.length).toBeGreaterThan(0);
      expect(error.stack).toMatch(/\n/);
    });
  });
});
