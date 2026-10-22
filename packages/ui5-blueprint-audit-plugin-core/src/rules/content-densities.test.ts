import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { contentDensitiesRule } from "./content-densities.js";

describe("content-densities", () => {
  it("ist erfüllt, wenn compact und cozy beide true sind", () => {
    const ctx = createTestContext({ manifest: { "sap.ui5": { contentDensities: { compact: true, cozy: true } } } });

    expect(runRule(contentDensitiesRule, ctx)).toEqual([]);
  });

  it("meldet, wenn nur cozy aktiv ist", () => {
    const ctx = createTestContext({ manifest: { "sap.ui5": { contentDensities: { compact: false, cozy: true } } } });

    expect(runRule(contentDensitiesRule, ctx)).toHaveLength(1);
  });
});
