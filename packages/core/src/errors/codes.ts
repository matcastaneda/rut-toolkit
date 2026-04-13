import { RUT_ERROR_META } from "./meta";

/**
 * A frozen array of all possible RUT error codes,
 * derived from {@link RUT_ERROR_META} keys (single source of truth).
 */
export const RUT_ERROR_CODES = Object.freeze(
  Object.keys(RUT_ERROR_META) as (keyof typeof RUT_ERROR_META)[],
);

export type RutErrorCode = keyof typeof RUT_ERROR_META;