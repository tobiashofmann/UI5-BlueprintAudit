import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { flpConfigRule } from "./flp-config.js";

describe("flp-config", () => {
  it("passes with a valid inbound", () => {
    const ctx = createTestContext({
      manifest: {
        "sap.app": {
          crossNavigation: { inbounds: { display: { semanticObject: "sample", action: "display" } } },
        },
      },
    });

    expect(runRule(flpConfigRule, ctx)).toEqual([]);
  });

  it("reports a missing crossNavigation", () => {
    const ctx = createTestContext({ manifest: { "sap.app": {} } });

    expect(runRule(flpConfigRule, ctx)).toHaveLength(1);
  });
});
