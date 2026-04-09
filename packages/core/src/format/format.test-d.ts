import { expectTypeOf, test } from "vitest";
import type { ValidRut } from "../types";
import {
  buildRut,
  formatRut,
  fromCompactRut,
  maskRut,
  toCompactRut,
  toSiiRut,
} from "./format";
import type { FormattedRut } from "./types";

declare const validRut: ValidRut;
declare const anyString: string;

test("FormattedRut is distinct from ValidRut and plain string", () => {
  expectTypeOf<FormattedRut>().not.toEqualTypeOf<ValidRut>();
  expectTypeOf<FormattedRut>().not.toEqualTypeOf<string>();
});

test("FormattedRut is structurally assignable to string", () => {
  expectTypeOf<FormattedRut>().toExtend<string>();
});

test("formatRut(ValidRut) returns FormattedRut", () => {
  expectTypeOf(formatRut(validRut)).toEqualTypeOf<FormattedRut>();
});

test("formatRut(string) returns string", () => {
  expectTypeOf(formatRut(anyString)).toEqualTypeOf<string>();
});

test("maskRut always returns string regardless of input type", () => {
  expectTypeOf(maskRut(validRut)).toEqualTypeOf<string>();
  expectTypeOf(maskRut(anyString)).toEqualTypeOf<string>();
});

test("toCompactRut(ValidRut) returns FormattedRut", () => {
  expectTypeOf(toCompactRut(validRut)).toEqualTypeOf<FormattedRut>();
});

test("toCompactRut(string) returns string", () => {
  expectTypeOf(toCompactRut(anyString)).toEqualTypeOf<string>();
});

test("fromCompactRut(ValidRut) returns FormattedRut", () => {
  expectTypeOf(fromCompactRut(validRut)).toEqualTypeOf<FormattedRut>();
});

test("fromCompactRut(string) returns string", () => {
  expectTypeOf(fromCompactRut(anyString)).toEqualTypeOf<string>();
});

test("toSiiRut(ValidRut) returns FormattedRut", () => {
  expectTypeOf(toSiiRut(validRut)).toEqualTypeOf<FormattedRut>();
});

test("toSiiRut(string) returns string", () => {
  expectTypeOf(toSiiRut(anyString)).toEqualTypeOf<string>();
});

test("buildRut first parameter accepts number | string", () => {
  expectTypeOf(buildRut).parameter(0).toEqualTypeOf<number | string>();
});

test("buildRut second parameter accepts string | number", () => {
  expectTypeOf(buildRut).parameter(1).toEqualTypeOf<string | number>();
});

test("buildRut always returns string", () => {
  expectTypeOf(buildRut(12345678, "5")).toEqualTypeOf<string>();
  expectTypeOf(buildRut("12345678", 5)).toEqualTypeOf<string>();
});
