import { describe, expect, it } from "vitest";
import { mergeRuleConfig, type RuleDefault } from "./merge-rule-config.js";

const defaults: Record<string, RuleDefault> = {
  "no-custom-controls": { severity: "error" },
  "flex-enabled": { severity: "warn" },
  "odata-mockdata": { severity: "off" },
};

describe("mergeRuleConfig", () => {
  it("behält den Default, wenn die Config die Regel nicht erwähnt", () => {
    const merged = mergeRuleConfig(defaults, {});

    expect(merged["flex-enabled"]).toEqual({ severity: "warn" });
  });

  it("überschreibt die Severity, wenn die Config nur eine Severity angibt", () => {
    const merged = mergeRuleConfig(defaults, { "odata-mockdata": "warn" });

    expect(merged["odata-mockdata"]).toEqual({ severity: "warn" });
  });

  it("übernimmt Severity und Optionen, wenn die Config ein Array angibt", () => {
    const merged = mergeRuleConfig(defaults, {
      "no-custom-controls": ["error", { allow: ["MyCustomControl"] }],
    });

    expect(merged["no-custom-controls"]).toEqual({
      severity: "error",
      options: { allow: ["MyCustomControl"] },
    });
  });

  it("nimmt auch Regeln auf, die in den Defaults nicht vorkommen (z. B. aus Plugins)", () => {
    const merged = mergeRuleConfig(defaults, { "my-plugin/custom-rule": "error" });

    expect(merged["my-plugin/custom-rule"]).toEqual({ severity: "error" });
  });
});
