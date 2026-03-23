import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ErrorConstructorWithCapture } from "./errors";
import { ERROR_META, RutError } from "./errors";
import type { ErrorCode } from "./types";

/** Every key in {@link ERROR_META} must match a {@link ErrorCode}. */
const ERROR_CODES = Object.keys(ERROR_META) as ErrorCode[];

describe("RutError", () => {
  describe("construction and identity", () => {
    it("creates an instance with code, name, and optional RUT detail in the message", () => {
      const error = new RutError("RUT_DV_MISMATCH", "12345678-0");

      expect(error).toBeInstanceOf(RutError);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("RutError");
      expect(error.code).toBe("RUT_DV_MISMATCH");
      expect(error.message).toBe('[RUT_DV_MISMATCH] ("12345678-0")');
    });

    it("omits RUT detail when the second argument is omitted", () => {
      expect(new RutError("BARCODE_EMPTY").message).toBe("[BARCODE_EMPTY]");
    });

    it("includes empty-string RUT detail when an empty string is passed", () => {
      expect(new RutError("RUT_EMPTY", "").message).toBe('[RUT_EMPTY] ("")');
    });

    it("maintains a correct prototype chain (subclass + setPrototypeOf)", () => {
      const error = new RutError("RUT_INVALID_FORMAT");

      expect(error instanceof RutError).toBe(true);
      expect(error instanceof Error).toBe(true);
      expect(Object.getPrototypeOf(error)).toBe(RutError.prototype);
    });
  });

  describe("metadata (ERROR_META)", () => {
    it.each(
      ERROR_CODES,
    )("maps code %s to the same ERROR_META entry (identity)", (code) => {
      const error = new RutError(code);

      expect(error.code).toBe(code);
      expect(error.meta).toBe(ERROR_META[code]);
      expect(error.meta).toEqual(ERROR_META[code]);
    });

    it("exposes representative fields for SYSTEM_UNEXPECTED", () => {
      const error = new RutError("SYSTEM_UNEXPECTED");

      expect(error.meta.category).toBe("system");
      expect(error.meta.severity).toBe("critical");
      expect(error.meta.httpStatus).toBe(500);
    });
  });

  describe("immutability", () => {
    it("freezes the instance so assignments to declared fields throw", () => {
      const error = new RutError("RUT_EMPTY");

      expect(() => {
        // @ts-expect-error: intentional mutation under test
        error.code = "RUT_TOO_LONG";
      }).toThrow(TypeError);

      expect(error.code).toBe("RUT_EMPTY");
      expect(Object.isFrozen(error)).toBe(true);
    });

    it("also rejects mutation of inherited Error fields after freeze", () => {
      const error = new RutError("RUT_NULLISH");

      expect(() => {
        error.message = "tampered";
      }).toThrow(TypeError);

      expect(error.message).toContain("RUT_NULLISH");
    });
  });

  describe("stack traces", () => {
    it("defines a non-empty stack string in normal JS environments", () => {
      const error = new RutError("RUT_TOO_LONG");

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
      expect(error.stack?.length).toBeGreaterThan(0);
      expect(error.stack).toMatch(/\n/);
    });
  });

  describe("without Error.captureStackTrace (non-V8)", () => {
    const ErrorCtor = Error as ErrorConstructorWithCapture;
    let originalCapture: ErrorConstructorWithCapture["captureStackTrace"];

    beforeEach(() => {
      originalCapture = ErrorCtor.captureStackTrace;
      ErrorCtor.captureStackTrace = undefined;
    });

    afterEach(() => {
      if (originalCapture !== undefined) {
        ErrorCtor.captureStackTrace = originalCapture;
      }
    });

    it("still constructs, keeps metadata, and provides a stack", () => {
      const error = new RutError("RUT_EMPTY");

      expect(error.code).toBe("RUT_EMPTY");
      expect(error.meta).toBe(ERROR_META.RUT_EMPTY);
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
    });

    it("still formats messages with RUT detail when captureStackTrace is absent", () => {
      const error = new RutError("RUT_DV_MISMATCH", "1-9");

      expect(error.message).toBe('[RUT_DV_MISMATCH] ("1-9")');
    });
  });
});
