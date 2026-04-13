/**
 * @packageDocumentation
 * @module @rut-toolkit/core
 *
 * Enterprise-grade, zero-dependency utilities for Chilean **RUT/RUN** validation,
 * formatting, cleaning, and ID barcode parsing.
 */

export type {
  BarcodeScanResult,
  BarcodeSource,
} from "./barcode";
export {
  analyzeRutBarcode,
  isRegistroCivilQrUrl,
  parseRutFromBarcode,
} from "./barcode";

export {
  ensureCompanyRut,
  ensureNotProvisionalRut,
  ensurePersonRut,
  isCompanyRut,
  isPersonRut,
  isProvisionalRut,
} from "./business";

export type {
  RutCleanOptions,
  RutComponents,
} from "./clean";
export {
  cleanRut,
  padRut,
  splitRut,
} from "./clean";

export type {
  RutErrorCategory,
  RutErrorCode,
  RutErrorHttpStatus,
  RutErrorMeta,
  RutErrorSeverity,
  RutLocale,
} from "./errors";
export {
  getRutErrorMessage,
  RUT_ERROR_CODES,
  RUT_ERROR_MESSAGES,
  RUT_ERROR_META,
  RutError,
} from "./errors";

export type { FormattedRut, RutFormatOptions, RutMaskOptions } from "./format";
export {
  buildRut,
  formatRut,
  fromCompactRut,
  maskRut,
  toCompactRut,
  toSiiRut,
} from "./format";

export type {
  RutDv,
  ValidRut,
} from "./types";

export type { RutParseResult } from "./validate";
export {
  calculateDv,
  ensureRealRut,
  isPlaceholderRut,
  isRut,
  toValidRut,
  tryParseRut,
  verifyDv,
} from "./validate";
