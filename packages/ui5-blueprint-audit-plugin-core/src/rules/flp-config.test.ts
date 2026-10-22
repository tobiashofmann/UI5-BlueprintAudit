import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { flpConfigRule } from "./flp-config.js";

describe("flp-config", () => {
  it("ist erfüllt bei einem gültigen Inbound", () => {
    const ctx = createTestContext({
      manifest: {
        "sap.app": {
          crossNavigation: { inbounds: { display: { semanticObject: "sample", action: "display" } } },
        },
      },
    });

    expect(runRule(flpConfigRule, ctx)).toEqual([]);
  });

  it("meldet ein fehlendes crossNavigation", () => {
    const ctx = createTestContext({ manifest: { "sap.app": {} } });

    expect(runRule(flpConfigRule, ctx)).toHaveLength(1);
  });
});
