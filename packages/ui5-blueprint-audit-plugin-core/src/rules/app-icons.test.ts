import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { appIconsRule } from "./app-icons.js";

describe("app-icons", () => {
  it("ist erfüllt, wenn icon und favIcon gesetzt sind", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui": { icons: { icon: "sap-icon://home", favIcon: "favicon.ico" } } },
    });

    expect(runRule(appIconsRule, ctx)).toEqual([]);
  });

  it("meldet leere Icon-Platzhalter", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui": { icons: { icon: "", favIcon: "" } } },
    });

    expect(runRule(appIconsRule, ctx)).toHaveLength(2);
  });
});
