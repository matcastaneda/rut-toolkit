import { describe, expect, it } from "vitest";
import { defineErrorCodes } from "./utils";

describe("defineErrorCodes", () => {
  describe("returned entries", () => {
    it("produces an entry for each key in the input map", () => {
      const codes = defineErrorCodes({
        FOO: "Foo message.",
        BAR: "Bar message.",
      });

      expect(Object.keys(codes)).toEqual(["FOO", "BAR"]);
    });

    it("entry.code is the key string", () => {
      const codes = defineErrorCodes({ FOO: "Foo message." });

      expect(codes.FOO.code).toBe("FOO");
    });

    it("entry.message is the value string", () => {
      const codes = defineErrorCodes({ FOO: "Foo message." });

      expect(codes.FOO.message).toBe("Foo message.");
    });

    it("entry.toString() returns the code key — not the message", () => {
      const codes = defineErrorCodes({ FOO: "Foo message." });

      expect(codes.FOO.toString()).toBe("FOO");
    });

    it("template-literal coercion uses toString() and resolves to the key", () => {
      const codes = defineErrorCodes({ FOO: "Foo message." });

      expect(`${codes.FOO}`).toBe("FOO");
    });

    it("each entry is an independent object — distinct references", () => {
      const codes = defineErrorCodes({ FOO: "Foo.", BAR: "Bar." });

      expect(codes.FOO).not.toBe(codes.BAR);
    });
  });

  describe("multiple codes in one call", () => {
    it("builds all entries correctly when given several codes", () => {
      const codes = defineErrorCodes({
        ALPHA: "Alpha message.",
        BETA: "Beta message.",
        GAMMA: "Gamma message.",
      });

      expect(codes.ALPHA.code).toBe("ALPHA");
      expect(codes.ALPHA.message).toBe("Alpha message.");
      expect(codes.BETA.code).toBe("BETA");
      expect(codes.BETA.message).toBe("Beta message.");
      expect(codes.GAMMA.code).toBe("GAMMA");
      expect(codes.GAMMA.message).toBe("Gamma message.");
    });
  });
});
