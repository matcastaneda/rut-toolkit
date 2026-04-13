import type { RutErrorCode } from "@rut-toolkit/core";
import {
  formatRut,
  isPlaceholderRut,
  toValidRut,
  tryParseRut,
} from "@rut-toolkit/core";
import { getRutErrorMessage, RUT_ERROR_META } from "@rut-toolkit/core/errors";
import { z } from "zod";
import type { ZodRutIssueParams, ZodRutSchemaOptions } from "./types";

/** @internal */
type RutZodRefinementCtx = {
  addIssue: (issue: {
    code: "custom";
    message: string;
    params: ZodRutIssueParams;
    input: string;
  }) => void;
};

/** @internal */
function addRutCustomIssue(
  ctx: RutZodRefinementCtx,
  input: string,
  message: string,
  params: ZodRutIssueParams,
): void {
  ctx.addIssue({
    code: "custom",
    message,
    params,
    input,
  });
}

/**
 * Creates a Zod string schema that validates a Chilean RUT/RUN and returns a formatted string.
 *
 * @param options - Formatting, i18n, trim, and optional suspicious-RUT rejection.
 * @returns A schema for `.parse()`, `.safeParse()`, or composition with other Zod types.
 *
 * @remarks
 * - **Validation:** {@link tryParseRut} / {@link toValidRut} from `@rut-toolkit/core`.
 * - **Errors:** Zod issue `code` is `"custom"`; see {@link ZodRutIssueParams} on `params`.
 * - **Output:** `formatRut(toValidRut(value), format)` — see {@link formatRut}.
 *
 * @example Pad body for fixed-width storage
 * ```ts
 * const schema = createRutSchema({
 *   format: { padBodyLength: 8, withDots: false },
 * });
 * schema.parse("1-9"); // "00000001-9"
 * ```
 *
 * @example Custom empty message and English defaults
 * ```ts
 * const schema = createRutSchema({
 *   locale: "en",
 *   messages: { RUT_EMPTY: "Please enter your RUT." },
 * });
 * schema.safeParse("");         // fails with "Please enter your RUT."
 * schema.parse("12.345.678-5"); // "12345678-5"
 * ```
 */
export function createRutSchema(options: Readonly<ZodRutSchemaOptions> = {}) {
  const {
    messages = {},
    format = { withDots: false },
    locale = "es",
    trim: trimInput = true,
    rejectPlaceholders = false,
  } = options;

  const requiredMsg =
    messages.RUT_EMPTY ?? getRutErrorMessage("RUT_EMPTY", locale);

  const inner = z
    .string({ error: requiredMsg })
    .min(1, { error: requiredMsg })
    .transform((val, ctx) => {
      const result = tryParseRut(val);

      if (!result.ok) {
        addRutCustomIssue(
          ctx,
          val,
          messages[result.code] ?? getRutErrorMessage(result.code, locale),
          { rutErrorCode: result.code, rutErrorMeta: result.meta },
        );
        return z.NEVER;
      }

      if (rejectPlaceholders && isPlaceholderRut(result.rut)) {
        const code: RutErrorCode = "RUT_SUSPICIOUS";
        addRutCustomIssue(
          ctx,
          val,
          messages[code] ?? getRutErrorMessage(code, locale),
          { rutErrorCode: code, rutErrorMeta: RUT_ERROR_META.RUT_SUSPICIOUS },
        );
        return z.NEVER;
      }

      return formatRut(result.rut, format);
    });

  if (!trimInput) {
    return inner;
  }

  return z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : val),
    inner,
  );
}

/**
 * Default RUT schema: trim, validate modulo-11, output **compact** string (`"12345678-5"`).
 *
 * @example
 * ```ts
 * rutSchema.parse(" 12.345.678-5 "); // "12345678-5"
 * ```
 */
export const rutSchema = createRutSchema();

/**
 * RUT schema for **persistence**: digits + check digit only, no dots or hyphen (`"123456785"`).
 *
 * @example
 * ```ts
 * rutCleanSchema.parse(" 12.345.678-5 "); // "123456785"
 * ```
 */
export const rutCleanSchema = createRutSchema({
  format: { withDots: false, withHyphen: false },
});

/**
 * RUT schema for **display**: standard dotted format (`"12.345.678-5"`).
 *
 * @example
 * ```ts
 * rutFormattedSchema.parse("123456785"); // "12.345.678-5"
 * ```
 */
export const rutFormattedSchema = createRutSchema({
  format: { withDots: true, withHyphen: true },
});
