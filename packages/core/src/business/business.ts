import { splitRut } from "../clean";
import { RutError } from "../errors";
import type { ValidRut } from "../types";

const RUT_COMPANY_MIN = 50_000_000;
const RUT_COMPANY_MAX = 99_999_999;

const RUT_PROVISIONAL_SII_MIN = 48_000_000;
const RUT_PROVISIONAL_SII_MAX = 49_999_999;

const RUT_PROVISIONAL_IPE_MIN = 100_000_000;
const RUT_PROVISIONAL_IPE_MAX = 199_999_999;

function getBodyAsNumber(rut: string): number | null {
  const { body } = splitRut(rut);
  return body ? Number(body) : null;
}

/**
 * Checks whether a RUT belongs to a company (persona jurídica).
 * Company RUTs have a body typically between `50.000.000` and `99.999.999`.
 *
 * @param rut - RUT string in any format.
 * @returns `true` if the RUT body falls in the company range.
 *
 * @example
 * isCompanyRut("76.123.456-7")  // true
 * isCompanyRut("12.345.678-5")  // false
 * isCompanyRut("100.200.300-4") // false (not in company range, provisional)
 */
export function isCompanyRut(rut: ValidRut): boolean;
export function isCompanyRut(rut: string): boolean;
export function isCompanyRut(rut: string): boolean {
  const num = getBodyAsNumber(rut);
  return num !== null && num >= RUT_COMPANY_MIN && num <= RUT_COMPANY_MAX;
}

/**
 * Checks whether a RUT belongs to a natural person (persona natural).
 * Person RUTs have a body below `50.000.000` (excluding specific provisional ranges).
 *
 * @param rut - RUT string in any format.
 * @returns `true` if the RUT body falls in the person range.
 *
 * @example
 * isPersonRut("12.345.678-5") // true
 * isPersonRut("76.123.456-7") // false
 */
export function isPersonRut(rut: ValidRut): boolean;
export function isPersonRut(rut: string): boolean;
export function isPersonRut(rut: string): boolean {
  const num = getBodyAsNumber(rut);
  return num !== null && num > 0 && num < RUT_COMPANY_MIN;
}

/**
 * Checks whether a RUT is provisional (RUT provisorio).
 * Provisional RUTs are often assigned to foreigners (IPE/IPA) in the `100.000.000`+ range,
 * or by the SII for foreign investors (e.g., `48.000.000` range).
 *
 * @param rut - RUT string in any format.
 * @returns `true` if the RUT body falls in known provisional ranges.
 *
 * @example
 * isProvisionalRut("100.200.300-4") // true
 * isProvisionalRut("48.012.345-6")  // true
 */
export function isProvisionalRut(rut: ValidRut): boolean;
export function isProvisionalRut(rut: string): boolean;
export function isProvisionalRut(rut: string): boolean {
  const num = getBodyAsNumber(rut);
  if (num === null) return false;
  return (
    (num >= RUT_PROVISIONAL_IPE_MIN && num <= RUT_PROVISIONAL_IPE_MAX) ||
    (num >= RUT_PROVISIONAL_SII_MIN && num <= RUT_PROVISIONAL_SII_MAX)
  );
}

/**
 * Throws if the RUT does not belong to a company.
 *
 * @param rut - RUT string in any format.
 * @throws {RutError} `RUT_COMPANY_REQUIRED` when the RUT is not in the company range.
 *
 * @example
 * ensureCompanyRut("76.123.456-7") // ok
 * ensureCompanyRut("12.345.678-5") // throws RutError
 */
export function ensureCompanyRut(rut: ValidRut): void;
export function ensureCompanyRut(rut: string): void;
export function ensureCompanyRut(rut: string): void {
  if (!isCompanyRut(rut)) throw new RutError("RUT_COMPANY_REQUIRED", rut);
}

/**
 * Throws if the RUT does not belong to a natural person.
 *
 * @param rut - RUT string in any format.
 * @throws {RutError} `RUT_PERSON_REQUIRED` when the RUT is not in the person range.
 *
 * @example
 * ensurePersonRut("12.345.678-5") // ok
 * ensurePersonRut("76.123.456-7") // throws RutError
 */
export function ensurePersonRut(rut: ValidRut): void;
export function ensurePersonRut(rut: string): void;
export function ensurePersonRut(rut: string): void {
  if (!isPersonRut(rut)) throw new RutError("RUT_PERSON_REQUIRED", rut);
}

/**
 * Throws if the RUT is provisional.
 *
 * @param rut - RUT string in any format.
 * @throws {RutError} `RUT_PROVISIONAL_NOT_ALLOWED` when the RUT falls in a provisional range.
 *
 * @example
 * ensureNotProvisionalRut("12.345.678-5")  // ok
 * ensureNotProvisionalRut("100.200.300-4") // throws RutError
 */
export function ensureNotProvisionalRut(rut: ValidRut): void;
export function ensureNotProvisionalRut(rut: string): void;
export function ensureNotProvisionalRut(rut: string): void {
  if (isProvisionalRut(rut))
    throw new RutError("RUT_PROVISIONAL_NOT_ALLOWED", rut);
}
