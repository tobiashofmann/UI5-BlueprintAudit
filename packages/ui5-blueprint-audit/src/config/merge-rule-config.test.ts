import { describe, expect, it } from "vitest";
import { mergeRuleConfig, type RuleDefault } from "./merge-rule-config.js";

const defaults: Record<string, RuleDefault> = {
  "no-custom-controls": { severity: "error" },
  "flex-enabled": { severity: "warn" },
  "odata-mockdata": { severity: "off" },
};

describe("mergeRuleConfig", () => {
  it("keeps the default if the config does not mention the rule", () => {
    const merged = mergeRuleConfig(defaults, {});

    expect(merged["flex-enabled"]).toEqual({ severity: "warn" });
  });

  it("overrides the severity if the config gives only a severity", () => {
    const merged = mergeRuleConfig(defaults, { "odata-mockdata": "warn" });

    expect(merged["odata-mockdata"]).toEqual({ severity: "warn" });
  });

  it("takes severity and options if the config gives an array", () => {
    const merged = mergeRuleConfig(defaults, {
      "no-custom-controls": ["error", { allow: ["MyCustomControl"] }],
    });

    expect(merged["no-custom-controls"]).toEqual({
      severity: "error",
      options: { allow: ["MyCustomControl"] },
    });
  });

  it("also includes rules that are not in the defaults (e.g. from plugins)", () => {
    const merged = mergeRuleConfig(defaults, { "my-plugin/custom-rule": "error" });

    expect(merged["my-plugin/custom-rule"]).toEqual({ severity: "error" });
  });
});
