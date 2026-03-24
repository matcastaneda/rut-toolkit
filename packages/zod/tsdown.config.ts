import { libraryPreset } from "@rut-toolkit/tsdown";

export default libraryPreset({
  entry: ["src/index.ts"],
  unbundle: true,
});
