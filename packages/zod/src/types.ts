import type {
  RutErrorCode,
  RutErrorMeta,
  RutFormatOptions,
  RutLocale,
} from "@rut-toolkit/core";

/**
 * Shape of `params` on Zod `"custom"` issues emitted when RUT validation fails.
 *
 * Use this when branching in UI or APIs on {@link RutErrorCode} / {@link RutErrorMeta}
 * (e.g. severity, `httpStatus`).
 *
 * @remarks
 * Zod's public `issues` union may not list `params` on every variant; cast when needed:
 * `issue as { params?: ZodRutIssueParams }`.
 *
 * @example
 * ```ts
 * const result = rutSchema.safeParse("12345678-0");
 * if (!result.success) {
 *   const issue = result.error.issues[0] as { params?: ZodRutIssueParams };
 *   if (issue.params?.rutErrorCode === "RUT_DV_MISMATCH") {
 *     // handle wrong check digit
 *   }
 * }
 * ```
 */
export interface ZodRutIssueParams extends Record<string, unknown> {
  /** Core {@link RutErrorCode} (e.g. `RUT_DV_MISMATCH`, `RUT_TOO_SHORT`). */
  rutErrorCode: RutErrorCode;
  /** Core metadata: category, severity, `httpStatus`. */
  rutErrorMeta: RutErrorMeta;
}

/** Options for {@link createRutSchema}. */
export interface ZodRutSchemaOptions {
  /**
   * Passed to {@link formatRut} on successful parse (same shape as core `RutFormatOptions`).
   *
   * @defaultValue `{ withDots: false }` — compact visual form with hyphen, e.g. `"12345678-5"`
   * (hyphen remains on because core defaults keep `withHyphen: true` unless you set it to `false`).
   */
  format?: Readonly<RutFormatOptions>;

  /**
   * Per-code message overrides. Keys are {@link RutErrorCode}; missing keys use
   * {@link getRutErrorMessage} with `locale`.
   */
  messages?: Partial<Record<RutErrorCode, string>>;

  /**
   * RutLocale for default messages from core i18n.
   *
   * @defaultValue `"es"`
   */
  locale?: RutLocale;

  /**
   * If `true`, fails valid RUTs whose body is in the core suspicious list ({@link isPlaceholderRut})
   * with `RUT_SUSPICIOUS`.
   *
   * @defaultValue `false`
   */
  rejectPlaceholders?: boolean;

  /**
   * If `true`, runs `String#trim` on the input before `z.string()` / validation.
   *
   * @defaultValue `true`
   */
  trim?: boolean;
}
