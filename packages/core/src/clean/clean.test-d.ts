import { assertType, expectTypeOf, test } from "vitest";
import type { ValidRut } from "../types";
import { cleanRut, padRut, splitRut } from "./clean";
import type {
  FilledRutComponents,
  RutCleanOptions,
  RutComponents,
} from "./types";

declare const validRut: ValidRut;
declare const anyString: string;

test("FilledRutComponents is distinct from RutComponents", () => {
  expectTypeOf<FilledRutComponents>().not.toEqualTypeOf<RutComponents>();
});

test("FilledRutComponents is structurally assignable to RutComponents", () => {
  expectTypeOf<FilledRutComponents>().toExtend<RutComponents>();
});

test("cleanRut(ValidRut) returns ValidRut", () => {
  expectTypeOf(cleanRut(validRut)).toEqualTypeOf<ValidRut>();
});

test("cleanRut(string) returns string", () => {
  expectTypeOf(cleanRut(anyString)).toEqualTypeOf<string>();
});

test("cleanRut rejects non-string input", () => {
  // @ts-expect-error - number is not assignable to string
  cleanRut(123);
});

test("splitRut(ValidRut) returns FilledRutComponents", () => {
  expectTypeOf(splitRut(validRut)).toEqualTypeOf<FilledRutComponents>();
});

test("splitRut(string) returns RutComponents", () => {
  expectTypeOf(splitRut(anyString)).toEqualTypeOf<RutComponents>();
});

test("FilledRutComponents.dv never contains empty string", () => {
  const components = splitRut(validRut);
  expectTypeOf(components.dv).not.toExtend<"">();
});

test("FilledRutComponents.dv is assignable to RutComponents.dv", () => {
  const filled = splitRut(validRut);
  assertType<RutComponents["dv"]>(filled.dv);
});

test("padRut always returns string regardless of input type", () => {
  expectTypeOf(padRut(validRut)).toEqualTypeOf<string>();
  expectTypeOf(padRut(anyString)).toEqualTypeOf<string>();
});

test("cleanRut second parameter accepts RutCleanOptions or undefined", () => {
  expectTypeOf(cleanRut(anyString, {})).toEqualTypeOf<string>();
  expectTypeOf(
    cleanRut(anyString, { keepLeadingZeros: true }),
  ).toEqualTypeOf<string>();
});

test("splitRut second parameter accepts RutCleanOptions", () => {
  const opts: Readonly<RutCleanOptions> = { keepLeadingZeros: true };
  expectTypeOf(splitRut(anyString, opts)).toEqualTypeOf<RutComponents>();
});
