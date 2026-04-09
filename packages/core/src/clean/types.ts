import type { RutDv } from "../types";

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

/**
 * The parts of a Chilean RUT when the input is known to be a {@link ValidRut}.
 * Both `body` and `dv` are guaranteed non-empty — no null-checks required.
 * Returned by {@link splitRut} when called with a {@link ValidRut}.
 */
export type FilledRutComponents = {
  /** The numeric body of the RUT (digits only, always non-empty). */
  readonly body: string;

  /** The verification digit of the RUT (always a real digit, never `""`). */
  readonly dv: Exclude<RutDv, "">;
};
