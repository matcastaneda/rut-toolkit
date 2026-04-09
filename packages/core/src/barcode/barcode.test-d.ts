import { expectTypeOf, test } from "vitest";
import type { ValidRut } from "../types";
import {
  analyzeRutBarcode,
  isRegistroCivilQrUrl,
  parseRutFromBarcode,
} from "./barcode";
import type { BarcodeScanResult, BarcodeSource } from "./types";

declare const anyString: string;

test("isRegistroCivilQrUrl returns boolean", () => {
  expectTypeOf(isRegistroCivilQrUrl).returns.toBeBoolean();
});

test("analyzeRutBarcode returns BarcodeScanResult", () => {
  expectTypeOf(analyzeRutBarcode(anyString)).toEqualTypeOf<BarcodeScanResult>();
});

test("analyzeRutBarcode rejects non-string input", () => {
  // @ts-expect-error - number is not assignable to string
  analyzeRutBarcode(123);
});

test("BarcodeScanResult ok:true branch narrows rut to ValidRut", () => {
  const result = analyzeRutBarcode(anyString);
  if (result.ok) {
    expectTypeOf(result.rut).toEqualTypeOf<ValidRut>();
  }
});

test("BarcodeScanResult ok:true branch narrows source to exclude UNKNOWN", () => {
  const result = analyzeRutBarcode(anyString);
  if (result.ok) {
    expectTypeOf(result.source).toEqualTypeOf<
      Exclude<BarcodeSource, "UNKNOWN">
    >();
    expectTypeOf(result.source).not.toEqualTypeOf<BarcodeSource>();
  }
});

test("BarcodeScanResult ok:false branch narrows rut to null", () => {
  const result = analyzeRutBarcode(anyString);
  if (!result.ok) {
    expectTypeOf(result.rut).toEqualTypeOf<null>();
  }
});

test("BarcodeScanResult ok:false branch keeps full BarcodeSource", () => {
  const result = analyzeRutBarcode(anyString);
  if (!result.ok) {
    expectTypeOf(result.source).toEqualTypeOf<BarcodeSource>();
  }
});

test("BarcodeScanResult extracts rut as ValidRut from ok:true variant", () => {
  expectTypeOf<BarcodeScanResult>()
    .extract<{ ok: true }>()
    .toHaveProperty("rut")
    .toEqualTypeOf<ValidRut>();
});

test("parseRutFromBarcode returns ValidRut | null", () => {
  expectTypeOf(parseRutFromBarcode(anyString)).toEqualTypeOf<ValidRut | null>();
});

test("parseRutFromBarcode result is nullable", () => {
  expectTypeOf(parseRutFromBarcode(anyString)).toBeNullable();
});

test("parseRutFromBarcode excluding null yields ValidRut", () => {
  const result = parseRutFromBarcode(anyString);
  expectTypeOf<typeof result>().exclude<null>().toEqualTypeOf<ValidRut>();
});
