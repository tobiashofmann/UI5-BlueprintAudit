import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { typescriptRule } from "./typescript.js";

describe("typescript", () => {
  it("ist erfüllt bei tsconfig.json und nur .ts-Dateien", () => {
    const ctx = createTestContext({
      files: {
        "tsconfig.json": "{}",
        "webapp/controller/App.controller.ts": "",
      },
    });

    expect(runRule(typescriptRule, ctx)).toEqual([]);
  });

  it("meldet fehlende tsconfig.json und .js-Dateien unter webapp", () => {
    const ctx = createTestContext({
      files: {
        "webapp/controller/App.controller.js": "",
      },
    });

    const findings = runRule(typescriptRule, ctx);
    expect(findings).toHaveLength(2);
    expect(findings.some((f) => f.file === "tsconfig.json")).toBe(true);
    expect(findings.some((f) => f.file === "webapp/controller/App.controller.js")).toBe(true);
  });

  it("ignoriert .js-Dateien, die über allowJs erlaubt sind", () => {
    const ctx = createTestContext({
      files: {
        "tsconfig.json": "{}",
        "webapp/polyfills/fetch.js": "",
      },
    });

    expect(runRule(typescriptRule, ctx, { allowJs: ["webapp/polyfills/**"] })).toEqual([]);
  });

  it("prüft bei Libraries src/ statt webapp/", () => {
    const ctx = createTestContext({
      projectType: "lib",
      files: { "tsconfig.json": "{}", "src/ns/lib/Example.js": "" },
    });

    const findings = runRule(typescriptRule, ctx);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.file).toBe("src/ns/lib/Example.js");
  });

  it("betrifft bei Libraries nicht den test/-Ordner (liegt außerhalb von src/)", () => {
    const ctx = createTestContext({
      projectType: "lib",
      files: { "tsconfig.json": "{}", "test/ns/lib/Example.js": "" },
    });

    expect(runRule(typescriptRule, ctx)).toEqual([]);
  });
});
