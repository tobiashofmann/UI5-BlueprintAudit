import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { cacheBusterRule } from "./cache-buster.js";

describe("cache-buster", () => {
  it("ist erfüllt, wenn ein Cachebuster-Task in ui5.yaml konfiguriert ist", () => {
    const ctx = createTestContext({
      ui5Yaml: { builder: { customTasks: [{ name: "generateCachebusterInfo" }] } },
    });

    expect(runRule(cacheBusterRule, ctx)).toEqual([]);
  });

  it("meldet, wenn kein Cachebuster-Mechanismus konfiguriert ist", () => {
    const ctx = createTestContext({
      ui5Yaml: { type: "application" },
      indexHtml: '<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js"></script>',
    });

    expect(runRule(cacheBusterRule, ctx)).toHaveLength(1);
  });

  it("ist erfüllt bei versionierter Cachebuster-URL in index.html", () => {
    const ctx = createTestContext({
      indexHtml: '<script id="sap-ui-bootstrap" src="resources/sap-ui-core.js?sap-ui-cachebuster=abc"></script>',
    });

    expect(runRule(cacheBusterRule, ctx)).toEqual([]);
  });
});
