import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { deviceTypesRule } from "./device-types.js";

describe("device-types", () => {
  it("ist erfüllt bei allen Device Types true (Default)", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui": { deviceTypes: { desktop: true, tablet: true, phone: true } } },
    });

    expect(runRule(deviceTypesRule, ctx)).toEqual([]);
  });

  it("meldet abweichende Device Types", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui": { deviceTypes: { desktop: false, tablet: true, phone: false } } },
    });

    expect(runRule(deviceTypesRule, ctx)).toHaveLength(2);
  });

  it("respektiert konfigurierte Erwartungen", () => {
    const ctx = createTestContext({
      manifest: { "sap.ui": { deviceTypes: { desktop: false, tablet: true, phone: false } } },
    });

    expect(runRule(deviceTypesRule, ctx, { desktop: false, tablet: true, phone: false })).toEqual([]);
  });
});
