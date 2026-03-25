/**
 * @packageDocumentation
 * @module @rut-toolkit/zod
 *
 * Zod v4 string schemas for Chilean **RUT/RUN** validation and formatting, built on
 * {@link https://www.npmjs.com/package/@rut-toolkit/core | `@rut-toolkit/core`}.
 */

export {
  createRutSchema,
  rutCleanSchema,
  rutFormattedSchema,
  rutSchema,
} from "./schema";

export type { ZodRutIssueParams, ZodRutSchemaOptions } from "./types";
