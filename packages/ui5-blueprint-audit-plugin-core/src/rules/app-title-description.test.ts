import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { appTitleDescriptionRule } from "./app-title-description.js";

describe("app-title-description", () => {
  it("passes if i18n values are set", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { title: "{{appTitle}}", description: "{{appDescription}}" } },
      files: { "webapp/i18n/i18n.properties": "appTitle=App Title\nappDescription=Some description\n" },
    });

    expect(runRule(appTitleDescriptionRule, ctx)).toEqual([]);
  });

  it("reports a missing i18n reference", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { title: "Hardcoded Title", description: "{{appDescription}}" } },
      files: { "webapp/i18n/i18n.properties": "appDescription=Some description\n" },
    });

    expect(runRule(appTitleDescriptionRule, ctx)).toHaveLength(1);
  });

  it("reports an empty i18n value", () => {
    const ctx = createTestContext({
      manifest: { "sap.app": { title: "{{appTitle}}", description: "{{appDescription}}" } },
      files: { "webapp/i18n/i18n.properties": "appTitle=\nappDescription=Some description\n" },
    });

    expect(runRule(appTitleDescriptionRule, ctx)).toHaveLength(1);
  });
});
