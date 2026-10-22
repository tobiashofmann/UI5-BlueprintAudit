import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { noCustomCssRule } from "./no-custom-css.js";

describe("no-custom-css", () => {
  it("ist erfüllt ohne .css-Dateien und ohne resources.css", () => {
    const ctx = createTestContext({ manifest: {}, files: {} });

    expect(runRule(noCustomCssRule, ctx)).toEqual([]);
  });

  it("meldet vorhandene .css-Dateien und gefüllte resources.css", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui5": { resources: { css: [{ uri: "css/style.css" }] } } },
      files: { "webapp/css/style.css": "" },
    });

    expect(runRule(noCustomCssRule, ctx)).toHaveLength(2);
  });

  it("ignoriert erlaubte CSS-Dateien", () => {
    const ctx = createTestContext({
      manifest: {},
      files: { "webapp/css/allowed.css": "" },
    });

    expect(runRule(noCustomCssRule, ctx, { allow: ["webapp/css/allowed.css"] })).toEqual([]);
  });
});
