import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { noCustomCssRule } from "./no-custom-css.js";

describe("no-custom-css", () => {
  it("passes without .css files and without resources.css", () => {
    const ctx = createTestContext({ manifest: {}, files: {} });

    expect(runRule(noCustomCssRule, ctx)).toEqual([]);
  });

  it("reports existing .css files and a non-empty resources.css", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { resources: { css: [{ uri: "css/style.css" }] } } },
      files: { "webapp/css/style.css": "" },
    });

    expect(runRule(noCustomCssRule, ctx)).toHaveLength(2);
  });

  it("ignores allowed CSS files", () => {
    const ctx = createTestContext({
      manifest: {},
      files: { "webapp/css/allowed.css": "" },
    });

    expect(runRule(noCustomCssRule, ctx, { allow: ["webapp/css/allowed.css"] })).toEqual([]);
  });
});
