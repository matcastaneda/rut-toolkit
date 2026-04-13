import { expectTypeOf, test } from "vitest";
import { RutError } from "./class";
import type { RutErrorCode } from "./codes";
import { RUT_ERROR_CODES } from "./codes";
import type { RutErrorHttpStatus, RutErrorMeta } from "./meta";

test("RUT_ERROR_CODES is a strictly typed readonly array", () => {
  expectTypeOf(RUT_ERROR_CODES).toExtend<readonly RutErrorCode[]>();
  expectTypeOf(RUT_ERROR_CODES).toExtend<readonly string[]>();
});

test("RutErrorCode is a strict union of literal strings", () => {
  expectTypeOf<"RUT_EMPTY">().toExtend<RutErrorCode>();
  expectTypeOf<"RUT_DV_MISMATCH">().toExtend<RutErrorCode>();
  expectTypeOf<"SYSTEM_UNEXPECTED">().toExtend<RutErrorCode>();
  expectTypeOf<"INVALID_CODE">().not.toExtend<RutErrorCode>();
  expectTypeOf<"rut_empty">().not.toExtend<RutErrorCode>();
});

test("RutError.code is strictly typed as RutErrorCode", () => {
  expectTypeOf<RutError["code"]>().toEqualTypeOf<RutErrorCode>();
});

test("RutError.meta is typed as RutErrorMeta", () => {
  expectTypeOf<RutError["meta"]>().toEqualTypeOf<RutErrorMeta>();
});

test("RutError.rut is string | undefined", () => {
  expectTypeOf<RutError["rut"]>().toEqualTypeOf<string | undefined>();
});

test("RutError.name is the literal 'RutError'", () => {
  expectTypeOf<RutError["name"]>().toEqualTypeOf<"RutError">();
});

test("RutError is assignable to the native Error class", () => {
  expectTypeOf<RutError>().toExtend<Error>();
});

test("RutErrorHttpStatus is a strict union of 400 | 403 | 422 | 500", () => {
  expectTypeOf<400>().toExtend<RutErrorHttpStatus>();
  expectTypeOf<403>().toExtend<RutErrorHttpStatus>();
  expectTypeOf<422>().toExtend<RutErrorHttpStatus>();
  expectTypeOf<500>().toExtend<RutErrorHttpStatus>();
  expectTypeOf<200>().not.toExtend<RutErrorHttpStatus>();
  expectTypeOf<number>().not.toExtend<RutErrorHttpStatus>();
});

test("instanceof RutError properly narrows code and meta in TypeScript", () => {
  const err: unknown = new RutError("RUT_EMPTY");

  if (err instanceof RutError) {
    expectTypeOf(err.code).toEqualTypeOf<RutErrorCode>();
    expectTypeOf(err.meta).toEqualTypeOf<RutErrorMeta>();
    expectTypeOf(err.name).toEqualTypeOf<"RutError">();
  }
});
