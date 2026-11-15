import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { typescriptRule } from "./typescript.js";

describe("typescript", () => {
  it("passes with tsconfig.json and only .ts files", () => {
    const ctx = createTestContext({
      files: {
        "tsconfig.json": "{}",
        "webapp/controller/App.controller.ts": "",
      },
    });

    expect(runRule(typescriptRule, ctx)).toEqual([]);
  });

  it("reports a missing tsconfig.json and .js files under webapp", () => {
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

  it("ignores .js files that are allowed via allowJs", () => {
    const ctx = createTestContext({
      files: {
        "tsconfig.json": "{}",
        "webapp/polyfills/fetch.js": "",
      },
    });

    expect(runRule(typescriptRule, ctx, { allowJs: ["webapp/polyfills/**"] })).toEqual([]);
  });

  it("checks src/ instead of webapp/ for libraries", () => {
    const ctx = createTestContext({
      projectType: "lib",
      files: { "tsconfig.json": "{}", "src/ns/lib/Example.js": "" },
    });

    const findings = runRule(typescriptRule, ctx);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.file).toBe("src/ns/lib/Example.js");
  });

  it("does not cover the test/ folder for libraries (it lies outside src/)", () => {
    const ctx = createTestContext({
      projectType: "lib",
      files: { "tsconfig.json": "{}", "test/ns/lib/Example.js": "" },
    });

    expect(runRule(typescriptRule, ctx)).toEqual([]);
  });
});
