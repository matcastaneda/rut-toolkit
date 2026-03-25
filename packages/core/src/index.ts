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
  RUT_ERROR_META,
  RutError,
  type RutErrorConstructorWithCapture,
} from "./errors";

export {
  buildRut,
  formatRut,
  fromCompactRut,
  maskRut,
  toCompactRut,
  toSiiRut,
} from "./format";

export { getRutErrorMessage, RUT_ERROR_MESSAGES } from "./i18n";

export type {
  BarcodeScanResult,
  BarcodeSource,
  RutCleanOptions,
  RutComponents,
  RutDv,
  RutErrorCategory,
  RutErrorCode,
  RutErrorMeta,
  RutErrorSeverity,
  RutFormatOptions,
  RutLocale,
  RutMaskOptions,
  RutParseResult,
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
