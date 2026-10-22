import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { themeRule } from "./theme.js";

describe("theme", () => {
  it("ist erfüllt, wenn index.html und ui5.yaml konsistent sap_horizon verwenden", () => {
    const ctx = createTestContext({
      indexHtml: '<script data-sap-ui-theme="sap_horizon"></script>',
      ui5Yaml: { framework: { libraries: [{ name: "themelib_sap_horizon" }] } },
    });

    expect(runRule(themeRule, ctx)).toEqual([]);
  });

  it("meldet ein nicht erlaubtes Theme", () => {
    const ctx = createTestContext({
      indexHtml: '<script data-sap-ui-theme="sap_bluecrystal"></script>',
      ui5Yaml: { framework: { libraries: [{ name: "themelib_sap_bluecrystal" }] } },
    });

    expect(runRule(themeRule, ctx)).toHaveLength(1);
  });

  it("meldet einen Widerspruch zwischen index.html und ui5.yaml", () => {
    const ctx = createTestContext({
      indexHtml: '<script data-sap-ui-theme="sap_horizon"></script>',
      ui5Yaml: { framework: { libraries: [{ name: "themelib_sap_bluecrystal" }] } },
    });

    expect(runRule(themeRule, ctx)).toHaveLength(1);
  });

  it("überspringt die Prüfung, wenn index.html und ui5.yaml fehlen", () => {
    const ctx = createTestContext({});

    expect(runRule(themeRule, ctx)).toEqual([]);
  });

  it("prüft nur ui5.yaml, wenn index.html fehlt (Launchpad-App)", () => {
    const ctx = createTestContext({
      ui5Yaml: { framework: { libraries: [{ name: "themelib_sap_horizon" }] } },
    });

    expect(runRule(themeRule, ctx)).toEqual([]);
  });
});
