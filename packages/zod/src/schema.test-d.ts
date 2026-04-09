import type { RutErrorCode, RutErrorMeta } from "@rut-toolkit/core";
import { expectTypeOf, test } from "vitest";
import type { z } from "zod";
import type { rutCleanSchema, rutFormattedSchema, rutSchema } from "./schema";
import { createRutSchema } from "./schema";
import type { ZodRutIssueParams, ZodRutSchemaOptions } from "./types";

test("rutSchema output is string", () => {
  expectTypeOf<z.infer<typeof rutSchema>>().toBeString();
});

test("rutSchema input accepts unknown (preprocess widens input)", () => {
  expectTypeOf<z.input<typeof rutSchema>>().toBeUnknown();
});

test("rutCleanSchema output is string", () => {
  expectTypeOf<z.infer<typeof rutCleanSchema>>().toBeString();
});

test("rutFormattedSchema output is string", () => {
  expectTypeOf<z.infer<typeof rutFormattedSchema>>().toBeString();
});

test("createRutSchema() output is string", () => {
  const schema = createRutSchema();
  expectTypeOf<z.infer<typeof schema>>().toBeString();
});

test("createRutSchema accepts ZodRutSchemaOptions or undefined", () => {
  expectTypeOf(createRutSchema)
    .parameter(0)
    .toEqualTypeOf<Readonly<ZodRutSchemaOptions> | undefined>();
});

test("createRutSchema rejects non-object input", () => {
  // @ts-expect-error - string is not assignable to ZodRutSchemaOptions
  createRutSchema("invalid");
});

test("ZodRutIssueParams.rutErrorCode is RutErrorCode", () => {
  expectTypeOf<
    ZodRutIssueParams["rutErrorCode"]
  >().toEqualTypeOf<RutErrorCode>();
});

test("ZodRutIssueParams.rutErrorMeta is RutErrorMeta", () => {
  expectTypeOf<
    ZodRutIssueParams["rutErrorMeta"]
  >().toEqualTypeOf<RutErrorMeta>();
});

test("ZodRutIssueParams extends Record<string, unknown>", () => {
  expectTypeOf<ZodRutIssueParams>().toExtend<Record<string, unknown>>();
});
