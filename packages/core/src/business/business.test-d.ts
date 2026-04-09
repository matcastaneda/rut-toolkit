import { expectTypeOf, test } from "vitest";
import type { ValidRut } from "../types";
import {
  ensureCompanyRut,
  ensureNotProvisionalRut,
  ensurePersonRut,
  isCompanyRut,
  isPersonRut,
  isProvisionalRut,
} from "./business";

declare const validRut: ValidRut;
declare const anyString: string;

test("isCompanyRut returns boolean for ValidRut", () => {
  expectTypeOf(isCompanyRut(validRut)).toBeBoolean();
});

test("isCompanyRut returns boolean for string", () => {
  expectTypeOf(isCompanyRut(anyString)).toBeBoolean();
});

test("isCompanyRut rejects non-string input", () => {
  // @ts-expect-error - number is not assignable to string
  isCompanyRut(123);
});

test("isPersonRut returns boolean for ValidRut", () => {
  expectTypeOf(isPersonRut(validRut)).toBeBoolean();
});

test("isPersonRut returns boolean for string", () => {
  expectTypeOf(isPersonRut(anyString)).toBeBoolean();
});

test("isPersonRut rejects non-string input", () => {
  // @ts-expect-error - number is not assignable to string
  isPersonRut(123);
});

test("isProvisionalRut returns boolean for ValidRut", () => {
  expectTypeOf(isProvisionalRut(validRut)).toBeBoolean();
});

test("isProvisionalRut returns boolean for string", () => {
  expectTypeOf(isProvisionalRut(anyString)).toBeBoolean();
});

test("ensureCompanyRut returns void for ValidRut", () => {
  expectTypeOf(ensureCompanyRut(validRut)).toBeVoid();
});

test("ensureCompanyRut returns void for string", () => {
  expectTypeOf(ensureCompanyRut(anyString)).toBeVoid();
});

test("ensureCompanyRut rejects non-string input", () => {
  // @ts-expect-error - number is not assignable to string
  ensureCompanyRut(123);
});

test("ensurePersonRut returns void for ValidRut", () => {
  expectTypeOf(ensurePersonRut(validRut)).toBeVoid();
});

test("ensurePersonRut returns void for string", () => {
  expectTypeOf(ensurePersonRut(anyString)).toBeVoid();
});

test("ensureNotProvisionalRut returns void for ValidRut", () => {
  expectTypeOf(ensureNotProvisionalRut(validRut)).toBeVoid();
});

test("ensureNotProvisionalRut returns void for string", () => {
  expectTypeOf(ensureNotProvisionalRut(anyString)).toBeVoid();
});
