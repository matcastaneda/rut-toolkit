import { splitRut } from "./clean";
import { RutError } from "./errors";

/**
 * Checks whether a RUT belongs to a company (persona jurídica).
 * Company RUTs have a body typically between `50.000.000` and `99.999.999`.
 *
 * @param rut - RUT string in any format.
 * @returns `true` if the RUT body falls in the company range.
 *
 * @example
 * isCompanyRut("76.123.456-7") // true
 * isCompanyRut("12.345.678-5") // false
 * isCompanyRut("100.200.300-4") // false (provisional, not a company)
 */
export function isCompanyRut(rut: string): boolean {
  const { body } = splitRut(rut);

  if (!body) return false;

  const num = Number(body);
  return num >= 50_000_000 && num < 100_000_000;
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
export function isPersonRut(rut: string): boolean {
  const { body } = splitRut(rut);

  if (!body) return false;

  const num = Number(body);
  return num > 0 && num < 50_000_000;
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
export function isProvisionalRut(rut: string): boolean {
  const { body } = splitRut(rut);

  if (!body) return false;

  const num = Number(body);

  const isIpeIpa = num >= 100_000_000 && num <= 199_999_999;
  const isSiiForeigner = num >= 48_000_000 && num <= 49_999_999;

  return isIpeIpa || isSiiForeigner;
}

/**
 * Throws if the RUT does not belong to a company.
 *
 * @param rut - RUT string in any format.
 * @throws {RutError} `RUT_COMPANY_REQUIRED` when the RUT is not in the company range.
 *
 * @example
 * assertCompanyRut("76.123.456-7") // ok
 * assertCompanyRut("12.345.678-5") // throws RutError
 */
export function assertCompanyRut(rut: string): void {
  if (!isCompanyRut(rut)) throw new RutError("RUT_COMPANY_REQUIRED", rut);
}

/**
 * Throws if the RUT does not belong to a natural person.
 *
 * @param rut - RUT string in any format.
 * @throws {RutError} `RUT_PERSON_REQUIRED` when the RUT is not in the person range.
 *
 * @example
 * assertPersonRut("12.345.678-5") // ok
 * assertPersonRut("76.123.456-7") // throws RutError
 */
export function assertPersonRut(rut: string): void {
  if (!isPersonRut(rut)) throw new RutError("RUT_PERSON_REQUIRED", rut);
}

/**
 * Throws if the RUT is provisional.
 *
 * @param rut - RUT string in any format.
 * @throws {RutError} `RUT_PROVISIONAL_NOT_ALLOWED` when the RUT falls in a provisional range.
 *
 * @example
 * assertNotProvisionalRut("12.345.678-5") // ok
 * assertNotProvisionalRut("100.200.300-4") // throws RutError
 */
export function assertNotProvisionalRut(rut: string): void {
  if (isProvisionalRut(rut))
    throw new RutError("RUT_PROVISIONAL_NOT_ALLOWED", rut);
}
