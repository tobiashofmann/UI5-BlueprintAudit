import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { appIconsRule } from "./app-icons.js";

describe("app-icons", () => {
  it("passes if icon and favIcon are set", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui": { icons: { icon: "sap-icon://home", favIcon: "favicon.ico" } } },
    });

    expect(runRule(appIconsRule, ctx)).toEqual([]);
  });

  it("reports empty icon placeholders", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui": { icons: { icon: "", favIcon: "" } } },
    });

    expect(runRule(appIconsRule, ctx)).toHaveLength(2);
  });
});
