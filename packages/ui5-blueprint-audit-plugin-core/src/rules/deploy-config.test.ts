import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { deployConfigRule } from "./deploy-config.js";

describe("deploy-config", () => {
  it("passes with a deploy task with target.url", () => {
    const ctx = createTestContext({
      ui5YamlExtensions: {
        "ui5-deploy.yaml": { builder: { customTasks: [{ name: "deploy-to-abap", configuration: { target: { url: "http://a4h" } } }] } },
      },
    });

    expect(runRule(deployConfigRule, ctx)).toEqual([]);
  });

  it("reports a missing ui5-deploy.yaml", () => {
    const ctx = createTestContext({ ui5YamlExtensions: {} });

    expect(runRule(deployConfigRule, ctx)).toHaveLength(1);
  });

  it("reports a deploy task without a target", () => {
    const ctx = createTestContext({
      ui5YamlExtensions: { "ui5-deploy.yaml": { builder: { customTasks: [{ name: "deploy-to-abap", configuration: {} }] } } },
    });

    expect(runRule(deployConfigRule, ctx)).toHaveLength(1);
  });
});
