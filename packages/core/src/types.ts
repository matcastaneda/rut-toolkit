declare const __brand: unique symbol;

/**
 * A branded string that has been validated as a structurally correct Chilean RUT.
 * Obtain one via {@link isValidRut} (type guard) or {@link parseRut} (throws on failure).
 * At runtime this is a plain cleaned string (e.g. `"123456785"`), zero overhead.
 */
export type ValidRut = string & { readonly [__brand]: "ValidRut" };

/**
 * The parts of a Chilean RUT.
 * @example
 * const parts = splitRut("12345678-9");
 * console.log(parts.body); // "12345678"
 * console.log(parts.dv); // "9"
 */
export type RutParts = {
  /** The numeric body of the RUT (digits only, no DV). */
  readonly body: string;

  /** The verification digit of the RUT. */
  readonly dv: string;
};

/** Options for cleaning a RUT. */
export type CleanOptions = {
  /**
   * If true, prevents the cleaning step from stripping leading zeros.
   * Useful for real-time input formatting in UIs. Defaults to `false`.
   */
  readonly keepLeadingZeros?: boolean;
};

/** Formatting options shared by {@link formatRut} and {@link buildRut}. */
export type FormatOptions = {
  /** Insert dots as thousands separator (e.g. `12.345.678`). Defaults to `true`. */
  readonly withDots?: boolean;

  /** Insert a hyphen before the verification digit. Defaults to `true`. */
  readonly withHyphen?: boolean;

  /** * Forces the verification digit 'K' to be uppercase or lowercase.
   * Defaults to `true` (uppercase 'K').
   */
  readonly uppercaseDv?: boolean;

  /** * Pads the numeric body with leading zeros to reach the specified length.
   * Useful for strict database schemas (e.g., `padBodyLength: 8` -> `"01.234.567"`).
   */
  readonly padBodyLength?: number;
};

/** Identifies the physical source of the scanned barcode data. */
export type BarcodeSource = "QR_FRONT" | "PDF417_REAR" | "UNKNOWN";

/** Metadata returned when analyzing an ID card barcode. */
export type BarcodeAnalysis = {
  readonly rut: ValidRut | null;
  readonly source: BarcodeSource;
};

/** Structured error codes emitted by {@link RutError}. */
export type ErrorCode =
  | "RUT_EMPTY"
  | "RUT_NULLISH"
  | "RUT_TOO_SHORT"
  | "RUT_TOO_LONG"
  | "RUT_INVALID_CHARACTERS"
  | "RUT_INVALID_FORMAT"
  | "RUT_BODY_NOT_NUMERIC"
  | "RUT_DV_MISSING"
  | "RUT_DV_INVALID"
  | "RUT_DV_MISMATCH"
  | "RUT_SUSPICIOUS"
  | "RUT_PROVISIONAL_NOT_ALLOWED"
  | "RUT_COMPANY_REQUIRED"
  | "RUT_PERSON_REQUIRED"
  | "BARCODE_EMPTY"
  | "BARCODE_RUT_NOT_FOUND"
  | "SYSTEM_UNEXPECTED";

export type ErrorCategory =
  | "input"
  | "parse"
  | "validation"
  | "business"
  | "barcode"
  | "system";

export type ErrorSeverity = "warning" | "error" | "critical";

/** Metadata attached to each {@link ErrorCode}. */
export type ErrorMeta = {
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly httpStatus: number;
};

/** Supported i18n locales for error messages. */
export type Locale = "es" | "en";

/**
 * Result type for non-throwing validation.
 * Use instead of try/catch when you prefer discriminated unions.
 *
 * @example
 * const result = safeParseRut(input);
 * if (result.ok) {
 *   console.log(result.rut); // ValidRut
 * } else {
 *   console.log(result.code); // ErrorCode
 * }
 */
export type RutResult =
  | { readonly ok: true; readonly rut: ValidRut }
  | {
      readonly ok: false;
      readonly code: ErrorCode;
      readonly message: string;
      readonly meta: ErrorMeta;
    };
