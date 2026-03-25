import { describe, expect, it } from "vitest";
import {
  createRutSchema,
  rutCleanSchema,
  rutFormattedSchema,
  rutSchema,
} from "./schema";
import type { ZodRutIssueParams } from "./types";

describe("@rut-toolkit/zod", () => {
  describe("rutSchema", () => {
    it("outputs compact RUT (no dots, with hyphen)", () => {
      const r = rutSchema.safeParse("12.345.678-5");
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data).toBe("12345678-5");
      }
    });

    it("trims surrounding whitespace by default", () => {
      const r = rutSchema.safeParse("  12.345.678-5  ");
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data).toBe("12345678-5");
      }
    });

    it("adds a custom issue with rutErrorCode and meta on DV mismatch", () => {
      const r = rutSchema.safeParse("12345678-0");
      expect(r.success).toBe(false);
      if (!r.success) {
        const issue = r.error.issues[0] as {
          code: string;
          params?: ZodRutIssueParams;
        };
        expect(issue.code).toBe("custom");
        expect(issue.params?.rutErrorCode).toBe("RUT_DV_MISMATCH");
        expect(issue.params?.rutErrorMeta.httpStatus).toBe(422);
      }
    });

    it("handles non-string inputs gracefully during preprocess", () => {
      const r = rutSchema.safeParse(123456785);

      expect(r.success).toBe(false);
      if (!r.success) {
        const issue = r.error.issues[0] as { message: string } | undefined;
        expect(issue?.message).toBe("Debes ingresar un RUT.");
      }
    });
  });

  describe("createRutSchema({ rejectPlaceholders: true })", () => {
    it("fails for RUT bodies on the core suspicious list", () => {
      const schema = createRutSchema({ rejectPlaceholders: true });
      const r = schema.safeParse("12.345.678-5");

      expect(r.success).toBe(false);
      if (!r.success) {
        const issue = r.error.issues[0] as { params?: ZodRutIssueParams };
        expect(issue.params?.rutErrorCode).toBe("RUT_SUSPICIOUS");
      }
    });

    it("allows a completely normal RUT to pass", () => {
      const schema = createRutSchema({ rejectPlaceholders: true });
      const r = schema.safeParse("13.000.000-2");

      expect(r.success).toBe(true);
    });
  });

  describe("createRutSchema({ trim: false })", () => {
    it("skips z.preprocess and lets the core handle raw whitespace", () => {
      const schema = createRutSchema({ trim: false });

      const r = schema.safeParse("   ");

      expect(r.success).toBe(false);
      if (!r.success) {
        const issue = r.error.issues[0] as { params?: ZodRutIssueParams };
        expect(issue.params?.rutErrorCode).toBe("RUT_EMPTY");
      }
    });
  });

  describe("presets", () => {
    it("rutCleanSchema strips separators for storage", () => {
      const r = rutCleanSchema.safeParse("12.345.678-5");
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data).toBe("123456785");
      }
    });

    it("rutFormattedSchema uses dotted display format", () => {
      const r = rutFormattedSchema.safeParse("123456785");
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data).toBe("12.345.678-5");
      }
    });
  });
});
