import type { __brand } from "../types";

/**
 * A branded string that represents a formatted Chilean RUT (e.g. `"12.345.678-5"`).
 * Returned by {@link formatRut}, {@link toCompactRut}, {@link fromCompactRut}, and
 * {@link toSiiRut} when the input is a {@link ValidRut} — guarantees a non-empty result.
 * At runtime this is a plain string, zero overhead.
 */
export type FormattedRut = string & { readonly [__brand]: "FormattedRut" };

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
