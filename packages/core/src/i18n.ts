import type { RutErrorCode, RutLocale } from "./types";

/**
 * Bilingual message dictionary for all error codes.
 * Use with {@link getRutErrorMessage} to resolve a localized string.
 *
 * @example
 * RUT_ERROR_MESSAGES.es.RUT_DV_MISMATCH // "El dígito verificador no coincide."
 * RUT_ERROR_MESSAGES.en.RUT_DV_MISMATCH // "Check digit does not match."
 */
export const RUT_ERROR_MESSAGES: Record<
  RutLocale,
  Record<RutErrorCode, string>
> = {
  es: {
    RUT_EMPTY: "Debes ingresar un RUT.",
    RUT_NULLISH: "No se recibió un RUT.",
    RUT_TOO_SHORT: "El RUT es demasiado corto.",
    RUT_TOO_LONG: "El RUT es demasiado largo.",
    RUT_INVALID_CHARACTERS: "El RUT contiene caracteres no válidos.",
    RUT_INVALID_FORMAT: "El formato del RUT no es válido.",
    RUT_BODY_NOT_NUMERIC: "El cuerpo del RUT debe ser numérico.",
    RUT_DV_MISSING: "Falta el dígito verificador.",
    RUT_DV_INVALID: "El dígito verificador es inválido.",
    RUT_DV_MISMATCH: "El dígito verificador no coincide.",
    RUT_SUSPICIOUS: "El RUT es sospechoso y requiere revisión.",
    RUT_PROVISIONAL_NOT_ALLOWED: "No se permiten RUTs provisorios.",
    RUT_COMPANY_REQUIRED: "Se requiere RUT de empresa.",
    RUT_PERSON_REQUIRED: "Se requiere RUT de persona.",
    BARCODE_EMPTY: "El escaneo está vacío.",
    BARCODE_RUT_NOT_FOUND: "No se encontró RUT en el escaneo.",
    SYSTEM_UNEXPECTED: "Ocurrió un error inesperado.",
  },
  en: {
    RUT_EMPTY: "RUT is required.",
    RUT_NULLISH: "No RUT value was provided.",
    RUT_TOO_SHORT: "RUT is too short.",
    RUT_TOO_LONG: "RUT is too long.",
    RUT_INVALID_CHARACTERS: "RUT contains invalid characters.",
    RUT_INVALID_FORMAT: "RUT format is invalid.",
    RUT_BODY_NOT_NUMERIC: "RUT body must be numeric.",
    RUT_DV_MISSING: "Check digit is missing.",
    RUT_DV_INVALID: "Check digit is invalid.",
    RUT_DV_MISMATCH: "Check digit does not match.",
    RUT_SUSPICIOUS: "RUT is suspicious and requires review.",
    RUT_PROVISIONAL_NOT_ALLOWED: "Provisional RUT is not allowed.",
    RUT_COMPANY_REQUIRED: "A company RUT is required.",
    RUT_PERSON_REQUIRED: "A personal RUT is required.",
    BARCODE_EMPTY: "Scan payload is empty.",
    BARCODE_RUT_NOT_FOUND: "No RUT found in scanned payload.",
    SYSTEM_UNEXPECTED: "An unexpected error occurred.",
  },
} as const satisfies Record<RutLocale, Record<RutErrorCode, string>>;

/**
 * Resolves a localized message for the given error code.
 *
 * @param code - The error code to look up.
 * @param locale - Target locale. Defaults to `"es"`.
 * @returns The localized message string.
 *
 * @example
 * getRutErrorMessage("RUT_DV_MISMATCH")        // "El dígito verificador no coincide."
 * getRutErrorMessage("RUT_DV_MISMATCH", "en")  // "Check digit does not match."
 */
export function getRutErrorMessage(
  code: RutErrorCode,
  locale: RutLocale = "es",
): string {
  return (
    RUT_ERROR_MESSAGES[locale]?.[code] ??
    RUT_ERROR_MESSAGES[locale]?.SYSTEM_UNEXPECTED ??
    RUT_ERROR_MESSAGES.en.SYSTEM_UNEXPECTED
  );
}
