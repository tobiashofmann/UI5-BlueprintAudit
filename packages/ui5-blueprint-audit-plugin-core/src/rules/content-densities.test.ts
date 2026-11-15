import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { contentDensitiesRule } from "./content-densities.js";

describe("content-densities", () => {
  it("passes if compact and cozy are both true", () => {
    const ctx = createTestContext({ manifest: { "sap.ui5": { contentDensities: { compact: true, cozy: true } } } });

    expect(runRule(contentDensitiesRule, ctx)).toEqual([]);
  });

  it("reports if only cozy is active", () => {
    const ctx = createTestContext({ manifest: { "sap.ui5": { contentDensities: { compact: false, cozy: true } } } });

    expect(runRule(contentDensitiesRule, ctx)).toHaveLength(1);
  });
});
