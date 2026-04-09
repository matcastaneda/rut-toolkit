import { expectTypeOf, test } from "vitest";
import { RutError } from "./class";
import type { RutErrorCode } from "./codes";
import { RUT_ERROR_CODES } from "./codes";
import type { RutErrorMeta } from "./meta";
import type { RawError } from "./types";
import { defineErrorCodes } from "./utils";

test("defineErrorCodes preserves each key as a literal RawError<K>", () => {
  const codes = defineErrorCodes({
    FOO_BAR: "foo message",
    BAZ_QUX: "baz message",
  });
  expectTypeOf(codes.FOO_BAR).toEqualTypeOf<RawError<"FOO_BAR">>();
  expectTypeOf(codes.BAZ_QUX).toEqualTypeOf<RawError<"BAZ_QUX">>();
});

test("defineErrorCodes does not widen keys to plain string", () => {
  const codes = defineErrorCodes({ MY_CODE: "msg" });
  expectTypeOf(codes.MY_CODE).not.toEqualTypeOf<RawError<string>>();
});

test("defineErrorCodes rejects non-UPPER_SNAKE_CASE keys", () => {
  defineErrorCodes({
    // @ts-expect-error - 'invalid' violates the UPPER_SNAKE_CASE constraint
    invalid: "message",
  });
});

test("RawError.code is the literal key K", () => {
  expectTypeOf<RawError<"RUT_EMPTY">["code"]>().toEqualTypeOf<"RUT_EMPTY">();
});

test("RawError.toString() returns the literal key K", () => {
  expectTypeOf<
    RawError<"RUT_EMPTY">["toString"]
  >().returns.toEqualTypeOf<"RUT_EMPTY">();
});

test("RUT_ERROR_CODES entries are RawError with literal key", () => {
  expectTypeOf(RUT_ERROR_CODES.RUT_EMPTY).toEqualTypeOf<
    RawError<"RUT_EMPTY">
  >();
  expectTypeOf(RUT_ERROR_CODES.RUT_DV_MISMATCH).toEqualTypeOf<
    RawError<"RUT_DV_MISMATCH">
  >();
});

test("RutError.code is typed as RutErrorCode", () => {
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

test("RutError is assignable to Error", () => {
  expectTypeOf<RutError>().toExtend<Error>();
});

test("instanceof RutError narrows code and meta", () => {
  const err: unknown = new RutError("RUT_EMPTY");
  if (err instanceof RutError) {
    expectTypeOf(err.code).toEqualTypeOf<RutErrorCode>();
    expectTypeOf(err.meta).toEqualTypeOf<RutErrorMeta>();
  }
});
