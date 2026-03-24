/**
 * @packageDocumentation
 * @module @rut-toolkit/zod
 *
 * Zod v4 string schemas for Chilean **RUT/RUN** validation and formatting, built on
 * {@link https://www.npmjs.com/package/@rut-toolkit/core | `@rut-toolkit/core`}.
 */

import type {
  ErrorCode,
  ErrorMeta,
  FormatOptions,
  Locale,
} from "@rut-toolkit/core";
import {
  ERROR_META,
  formatRut,
  getErrorMessage,
  isSuspiciousRut,
  parseRut,
  safeParseRut,
} from "@rut-toolkit/core";
import { z } from "zod";

/**
 * Shape of `params` on Zod `"custom"` issues emitted when RUT validation fails.
 *
 * Use this when branching in UI or APIs on {@link ErrorCode} / {@link ErrorMeta}
 * (e.g. severity, `httpStatus`).
 *
 * @remarks
 * Zod's public `issues` union may not list `params` on every variant; cast when needed:
 * `issue as { params?: RutZodIssueParams }`.
 *
 * @example
 * ```ts
 * const result = zodRutSchema.safeParse("12345678-0");
 * if (!result.success) {
 *   const issue = result.error.issues[0] as { params?: RutZodIssueParams };
 *   if (issue.params?.rutErrorCode === "RUT_DV_MISMATCH") {
 *     // handle wrong check digit
 *   }
 * }
 * ```
 */
export interface RutZodIssueParams extends Record<string, unknown> {
  /** Core {@link ErrorCode} (e.g. `RUT_DV_MISMATCH`, `RUT_TOO_SHORT`). */
  rutErrorCode: ErrorCode;
  /** Core metadata: category, severity, `httpStatus`. */
  rutErrorMeta: ErrorMeta;
}

/** @internal */
type RutZodRefinementCtx = {
  addIssue: (issue: {
    code: "custom";
    message: string;
    params: RutZodIssueParams;
    input: string;
  }) => void;
};

/** @internal */
function addRutCustomIssue(
  ctx: RutZodRefinementCtx,
  input: string,
  message: string,
  params: RutZodIssueParams,
): void {
  ctx.addIssue({
    code: "custom",
    message,
    params,
    input,
  });
}

/** Options for {@link createRutSchema}. */
export interface RutSchemaOptions {
  /**
   * Passed to {@link formatRut} on successful parse (same shape as core `FormatOptions`).
   *
   * @defaultValue `{ withDots: false }` — compact visual form with hyphen, e.g. `"12345678-5"`
   * (hyphen remains on because core defaults keep `withHyphen: true` unless you set it to `false`).
   */
  format?: Readonly<FormatOptions>;

  /**
   * Per-code message overrides. Keys are {@link ErrorCode}; missing keys use
   * {@link getErrorMessage} with `locale`.
   */
  messages?: Partial<Record<ErrorCode, string>>;

  /**
   * Locale for default messages from core i18n.
   *
   * @defaultValue `"es"`
   */
  locale?: Locale;

  /**
   * If `true`, fails valid RUTs whose body is in the core suspicious list ({@link isSuspiciousRut})
   * with `RUT_SUSPICIOUS`.
   *
   * @defaultValue `false`
   */
  rejectSuspicious?: boolean;

  /**
   * If `true`, runs `String#trim` on the input before `z.string()` / validation.
   *
   * @defaultValue `true`
   */
  trim?: boolean;
}

/**
 * Creates a Zod string schema that validates a Chilean RUT/RUN and returns a formatted string.
 *
 * @param options - Formatting, i18n, trim, and optional suspicious-RUT rejection.
 * @returns A schema for `.parse()`, `.safeParse()`, or composition with other Zod types.
 *
 * @remarks
 * - **Validation:** {@link safeParseRut} / {@link parseRut} from `@rut-toolkit/core`.
 * - **Errors:** Zod issue `code` is `"custom"`; see {@link RutZodIssueParams} on `params`.
 * - **Output:** `formatRut(parseRut(value), format)` — see {@link formatRut}.
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
 * schema.safeParse(""); // fails with "Please enter your RUT."
 * schema.parse("12.345.678-5"); // "12345678-5"
 * ```
 */
export function createRutSchema(options: RutSchemaOptions = {}) {
  const {
    messages = {},
    format = { withDots: false },
    locale = "es",
    trim: trimInput = true,
    rejectSuspicious = false,
  } = options;

  const requiredMsg =
    messages.RUT_EMPTY ?? getErrorMessage("RUT_EMPTY", locale);

  const inner = z
    .string({ error: requiredMsg })
    .min(1, { error: requiredMsg })
    .superRefine((val, ctx) => {
      const result = safeParseRut(val);

      if (!result.ok) {
        addRutCustomIssue(
          ctx,
          val,
          messages[result.code] ?? getErrorMessage(result.code, locale),
          {
            rutErrorCode: result.code,
            rutErrorMeta: result.meta,
          },
        );
        return;
      }

      if (rejectSuspicious && isSuspiciousRut(val)) {
        const code: ErrorCode = "RUT_SUSPICIOUS";
        addRutCustomIssue(
          ctx,
          val,
          messages[code] ?? getErrorMessage(code, locale),
          {
            rutErrorCode: code,
            rutErrorMeta: ERROR_META.RUT_SUSPICIOUS,
          },
        );
      }
    })
    .transform((val) => {
      return formatRut(parseRut(val), format);
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
 * zodRutSchema.parse(" 12.345.678-5 "); // "12345678-5"
 * ```
 */
export const zodRutSchema = createRutSchema();

/**
 * RUT schema for **persistence**: digits + check digit only, no dots or hyphen (`"123456785"`).
 *
 * @example
 * ```ts
 * zodRutCleanSchema.parse(" 12.345.678-5 "); // "123456785"
 * ```
 */
export const zodRutCleanSchema = createRutSchema({
  format: { withDots: false, withHyphen: false },
});

/**
 * RUT schema for **display**: standard dotted format (`"12.345.678-5"`).
 *
 * @example
 * ```ts
 * zodRutFormattedSchema.parse("123456785"); // "12.345.678-5"
 * ```
 */
export const zodRutFormattedSchema = createRutSchema({
  format: { withDots: true, withHyphen: true },
});
