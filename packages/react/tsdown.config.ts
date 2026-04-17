import { reactLibraryPreset } from "@rut-toolkit/tsdown/react";

export default reactLibraryPreset({
  entry: ["src/index.ts"],
  fixedExtension: true,
  deps: {
    neverBundle: ["@rut-toolkit/core"],
  },
});
