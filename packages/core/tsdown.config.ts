import { libraryPreset } from "@rut-toolkit/tsdown/library";

export default libraryPreset({
  entry: [
    "src/index.ts",
    "src/barcode/index.ts",
    "src/business/index.ts",
    "src/clean/index.ts",
    "src/errors/index.ts",
    "src/format/index.ts",
    "src/validate/index.ts",
  ],
});
