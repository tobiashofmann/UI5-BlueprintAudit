import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { themeRule } from "./theme.js";

describe("theme", () => {
  it("passes if index.html and ui5.yaml consistently use sap_horizon", () => {
    const ctx = createTestContext({
      indexHtml: '<script data-sap-ui-theme="sap_horizon"></script>',
      ui5Yaml: { framework: { libraries: [{ name: "themelib_sap_horizon" }] } },
    });

    expect(runRule(themeRule, ctx)).toEqual([]);
  });

  it("reports a theme that is not allowed", () => {
    const ctx = createTestContext({
      indexHtml: '<script data-sap-ui-theme="sap_bluecrystal"></script>',
      ui5Yaml: { framework: { libraries: [{ name: "themelib_sap_bluecrystal" }] } },
    });

    expect(runRule(themeRule, ctx)).toHaveLength(1);
  });

  it("reports a contradiction between index.html and ui5.yaml", () => {
    const ctx = createTestContext({
      indexHtml: '<script data-sap-ui-theme="sap_horizon"></script>',
      ui5Yaml: { framework: { libraries: [{ name: "themelib_sap_bluecrystal" }] } },
    });

    expect(runRule(themeRule, ctx)).toHaveLength(1);
  });

  it("skips the check if index.html and ui5.yaml are missing", () => {
    const ctx = createTestContext({});

    expect(runRule(themeRule, ctx)).toEqual([]);
  });

  it("checks only ui5.yaml if index.html is missing (Launchpad app)", () => {
    const ctx = createTestContext({
      ui5Yaml: { framework: { libraries: [{ name: "themelib_sap_horizon" }] } },
    });

    expect(runRule(themeRule, ctx)).toEqual([]);
  });
  it("accepts the theme in index.html if one of several theme libraries in ui5.yaml matches", () => {
    const ctx = createTestContext({
      indexHtml: '<script data-sap-ui-theme="sap_horizon"></script>',
      ui5Yaml: { framework: { libraries: [{ name: "themelib_sap_fiori_3" }, { name: "themelib_sap_horizon" }] } },
    });

    expect(runRule(themeRule, ctx)).toEqual([]);
  });

  it("reports a missing theme library in ui5.yaml when UI5 is used locally", () => {
    const ctx = createTestContext({
      indexHtml: '<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js" data-sap-ui-theme="sap_horizon"></script>',
      ui5Yaml: { framework: { name: "SAPUI5", libraries: [{ name: "sap.m" }] } },
    });

    const findings = runRule(themeRule, ctx);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.file).toBe("ui5.yaml");
    expect(findings[0]?.message).toContain("themelib_sap_horizon");
  });

  it("accepts the theme in index.html alone when a proxy middleware loads UI5 from a server", () => {
    const ctx = createTestContext({
      indexHtml: '<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js" data-sap-ui-theme="sap_horizon"></script>',
      ui5Yaml: {
        server: {
          customMiddleware: [
            { name: "fiori-tools-proxy", configuration: { ui5: { path: ["/resources"], url: "https://ui5.sap.com" } } },
          ],
        },
      },
    });

    expect(runRule(themeRule, ctx)).toEqual([]);
  });

  it("accepts the theme in index.html alone when the bootstrap script comes from a CDN", () => {
    const ctx = createTestContext({
      indexHtml:
        '<script id="sap-ui-bootstrap" src="https://ui5.sap.com/1.152.1/resources/sap-ui-core.js" data-sap-ui-theme="sap_horizon"></script>',
      ui5Yaml: { framework: { name: "SAPUI5" } },
    });

    expect(runRule(themeRule, ctx)).toEqual([]);
  });

  it("does not require ui5.yaml to exist", () => {
    const ctx = createTestContext({
      indexHtml: '<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js" data-sap-ui-theme="sap_horizon"></script>',
    });

    expect(runRule(themeRule, ctx)).toEqual([]);
  });
});
