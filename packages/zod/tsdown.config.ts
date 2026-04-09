import { libraryPreset } from "@rut-toolkit/tsdown/library";

export default libraryPreset({
  entry: ["src/index.ts"],
  deps: {
    neverBundle: ["@rut-toolkit/core"],
  },
});
