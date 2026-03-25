declare const __brand: unique symbol;

/**
 * A branded string that has been validated as a structurally correct Chilean RUT.
 * Obtain one via {@link isRut} (type guard) or {@link toValidRut} (throws on failure).
 * At runtime this is a plain cleaned string (e.g. `"123456785"`), zero overhead.
 */
export type ValidRut = string & { readonly [__brand]: "ValidRut" };

/**
 * Strict type for a verification digit.
 * Empty string is allowed for incomplete/invalid splits.
 */
export type RutDv =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "K"
  | "k"
  | "";

/**
 * The parts of a Chilean RUT.
 * @example
 * const components = splitRut("12345678-9");
 * console.log(components.body); // "12345678"
 * console.log(components.dv);   // "9"
 */
export type RutComponents = {
  /** The numeric body of the RUT (digits only, no DV). */
  readonly body: string;

  /** The verification digit of the RUT. */
  readonly dv: RutDv;
};

/** Options for cleaning a RUT. */
export type RutCleanOptions = {
  /**
   * If true, prevents the cleaning step from stripping leading zeros.
   * Useful for real-time input formatting in UIs. Defaults to `false`.
   */
  readonly keepLeadingZeros?: boolean;
};

/** Formatting options shared by {@link formatRut} and {@link buildRut}. */
export type RutFormatOptions = {
  /** Insert dots as thousands separator (e.g. `12.345.678`). Defaults to `true`. */
  readonly withDots?: boolean;

  /** Insert a hyphen before the verification digit. Defaults to `true`. */
  readonly withHyphen?: boolean;

  /**
   * Forces the verification digit `K` to be uppercase or lowercase.
   * Defaults to `true` (uppercase `K`).
   */
  readonly uppercaseDv?: boolean;

  /**
   * Pads the numeric body with leading zeros to reach the specified length.
   * Useful for strict database schemas (e.g., `padBodyLength: 8` → `"01.234.567"`).
   */
  readonly padBodyLength?: number;
};

/** Masking options for {@link maskRut}. */
export type RutMaskOptions = {
  /**
   * Optional mask aligned **from the right** with the fully formatted RUT (dots and hyphen).
   * Letters in the pattern are matched case-insensitively (`x` is treated as `X`).
   *
   * - **`X`:** keep the digit from the formatted RUT.
   * - **`*` and any other non-`X` character:** replace that digit with `maskChar`.
   * - **`.` and `-`:** always copied from the formatted string; the pattern character in that column is ignored.
   *
   * Shorter pattern → missing positions on the **left** behave like `X` (digits stay visible). Longer pattern → extra characters on the **left** are ignored.
   */
  readonly pattern?: string;
  /** Character used for masked digit positions. Defaults to `"*"`. Used for the default mask (no `pattern`) and for digit positions masked by `pattern`. */
  readonly maskChar?: string;
};

/** Identifies the physical source of the scanned barcode data. */
export type BarcodeSource = "QR_FRONT" | "PDF417_REAR" | "UNKNOWN";

/** Metadata returned when analyzing an ID card barcode. */
export type BarcodeScanResult =
  | {
      readonly ok: true;
      readonly rut: ValidRut;
      readonly source: Exclude<BarcodeSource, "UNKNOWN">;
    }
  | {
      readonly ok: false;
      readonly rut: null;
      readonly source: BarcodeSource;
    };

/** Structured error codes emitted by {@link RutError}. */
export type RutErrorCode =
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

/** Categories of errors emitted by {@link RutError}. */
export type RutErrorCategory =
  | "input"
  | "parse"
  | "validation"
  | "business"
  | "barcode"
  | "system";

/** Severities of errors emitted by {@link RutError}. */
export type RutErrorSeverity = "warning" | "error" | "critical";

/** Metadata attached to each {@link RutErrorCode}. */
export type RutErrorMeta = {
  readonly category: RutErrorCategory;
  readonly severity: RutErrorSeverity;
  readonly httpStatus: number;
};

/** Supported i18n locales for error messages. */
export type RutLocale = "es" | "en";

/**
 * Result type for non-throwing validation.
 * Use instead of try/catch when you prefer discriminated unions.
 *
 * @example
 * const result = tryParseRut(input);
 * if (result.ok) {
 *   console.log(result.rut);  // ValidRut
 * } else {
 *   console.log(result.code); // RutErrorCode
 * }
 */
export type RutParseResult =
  | { readonly ok: true; readonly rut: ValidRut }
  | {
      readonly ok: false;
      readonly code: RutErrorCode;
      readonly message: string;
      readonly meta: RutErrorMeta;
    };
