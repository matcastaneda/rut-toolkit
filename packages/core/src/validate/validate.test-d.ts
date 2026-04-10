import { expectTypeOf, test } from "vitest";
import type { RutErrorCode, RutErrorMeta } from "../errors";
import type { RutDv, ValidRut } from "../types";
import type { RutParseResult } from "./validate";
import {
  calculateDv,
  ensureRealRut,
  isPlaceholderRut,
  isRut,
  toValidRut,
  tryParseRut,
  verifyDv,
} from "./validate";

declare const anyString: string;

test("isRut narrows string to ValidRut inside truthy branch", () => {
  const rut: string = "123456785";
  if (isRut(rut)) {
    expectTypeOf(rut).toEqualTypeOf<ValidRut>();
  }
});

test("isRut does not narrow outside the truthy branch", () => {
  const rut: string = "123456785";
  expectTypeOf(rut).toEqualTypeOf<string>();
});

test("isRut returns boolean", () => {
  expectTypeOf(isRut).returns.toBeBoolean();
});

test("isRut rejects non-string input", () => {
  // @ts-expect-error - number is not assignable to string
  isRut(123);
});

test("ValidRut is distinct from plain string", () => {
  expectTypeOf<ValidRut>().not.toEqualTypeOf<string>();
});

test("ValidRut is assignable to string", () => {
  expectTypeOf<ValidRut>().toExtend<string>();
});

test("toValidRut returns ValidRut", () => {
  expectTypeOf(toValidRut).returns.toEqualTypeOf<ValidRut>();
});

test("toValidRut accepts string parameter", () => {
  expectTypeOf(toValidRut).parameter(0).toBeString();
});

test("calculateDv returns RutDv", () => {
  expectTypeOf(calculateDv).returns.toEqualTypeOf<RutDv>();
});

test("calculateDv accepts string | number", () => {
  expectTypeOf(calculateDv).parameter(0).toEqualTypeOf<string | number>();
});

test("verifyDv returns boolean", () => {
  expectTypeOf(verifyDv).returns.toBeBoolean();
});

test("isPlaceholderRut returns boolean", () => {
  expectTypeOf(isPlaceholderRut).returns.toBeBoolean();
});

test("ensureRealRut returns the same string type passed in", () => {
  expectTypeOf(ensureRealRut(anyString)).toBeString();
});

test("ensureRealRut preserves ValidRut brand", () => {
  const validated = toValidRut("12.345.678-5");
  expectTypeOf(ensureRealRut(validated)).toEqualTypeOf<ValidRut>();
});

test("tryParseRut returns RutParseResult", () => {
  expectTypeOf(tryParseRut(anyString)).toEqualTypeOf<RutParseResult>();
});

test("tryParseRut ok:true branch exposes ValidRut on .rut", () => {
  const result = tryParseRut(anyString);
  if (result.ok) {
    expectTypeOf(result.rut).toEqualTypeOf<ValidRut>();
  }
});

test("tryParseRut ok:false branch exposes code, message, and meta", () => {
  const result = tryParseRut(anyString);
  if (!result.ok) {
    expectTypeOf(result.code).toEqualTypeOf<RutErrorCode>();
    expectTypeOf(result.message).toBeString();
    expectTypeOf(result.meta).toEqualTypeOf<RutErrorMeta>();
  }
});

test("tryParseRut ok:false branch has no .rut property", () => {
  const result = tryParseRut(anyString);
  if (!result.ok) {
    expectTypeOf(result).not.toHaveProperty("rut");
  }
});

test("RutParseResult extracts ValidRut from ok:true variant", () => {
  expectTypeOf<RutParseResult>()
    .extract<{ ok: true }>()
    .toHaveProperty("rut")
    .toEqualTypeOf<ValidRut>();
});
