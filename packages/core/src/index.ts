/**
 * @packageDocumentation
 * @module @rut-toolkit/core
 *
 * Enterprise-grade, zero-dependency utilities for Chilean **RUT/RUN** validation,
 * formatting, cleaning, and ID barcode parsing.
 */

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

export { cleanRut, padRut, splitRut } from "./clean";

export {
  getRutErrorMessage,
  RUT_ERROR_CODES,
  RUT_ERROR_MESSAGES,
  RUT_ERROR_META,
  RutError,
  type RutErrorCategory,
  type RutErrorCode,
  type RutErrorMeta,
  type RutErrorSeverity,
} from "./errors";

export {
  buildRut,
  formatRut,
  fromCompactRut,
  maskRut,
  toCompactRut,
  toSiiRut,
} from "./format";

export type {
  BarcodeScanResult,
  BarcodeSource,
  RutCleanOptions,
  RutComponents,
  RutDv,
  RutFormatOptions,
  RutLocale,
  RutMaskOptions,
  ValidRut,
} from "./types";

export {
  calculateDv,
  ensureRealRut,
  isPlaceholderRut,
  isRut,
  toValidRut,
  tryParseRut,
  verifyDv,
} from "./validate";
