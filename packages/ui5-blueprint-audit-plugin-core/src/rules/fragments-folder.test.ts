import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { fragmentsFolderRule } from "./fragments-folder.js";

describe("fragments-folder", () => {
  it("ist erfüllt, wenn Nicht-Dialog-Fragmente unter fragments/ liegen", () => {
    const ctx = createTestContext({
      files: { "webapp/view/fragments/Info.fragment.xml": '<VBox xmlns="sap.m"></VBox>' },
    });

    expect(runRule(fragmentsFolderRule, ctx)).toEqual([]);
  });

  it("meldet ein Nicht-Dialog-Fragment außerhalb von fragments/", () => {
    const ctx = createTestContext({
      files: { "webapp/view/Info.fragment.xml": '<VBox xmlns="sap.m"></VBox>' },
    });

    expect(runRule(fragmentsFolderRule, ctx)).toHaveLength(1);
  });

  it("ignoriert Dialog-Fragmente", () => {
    const ctx = createTestContext({
      files: { "webapp/view/Confirm.fragment.xml": '<Dialog xmlns="sap.m"></Dialog>' },
    });

    expect(runRule(fragmentsFolderRule, ctx)).toEqual([]);
  });
});
