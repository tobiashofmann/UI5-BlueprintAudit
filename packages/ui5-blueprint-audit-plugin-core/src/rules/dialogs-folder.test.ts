import { describe, expect, it } from "vitest";
import { createTestContext, runRule } from "../test-utils.js";
import { dialogsFolderRule } from "./dialogs-folder.js";

describe("dialogs-folder", () => {
  it("ist erfüllt, wenn Dialog-Fragmente unter dialogs/ liegen", () => {
    const ctx = createTestContext({
      files: { "webapp/view/dialogs/Confirm.fragment.xml": '<Dialog xmlns="sap.m"></Dialog>' },
    });

    expect(runRule(dialogsFolderRule, ctx)).toEqual([]);
  });

  it("meldet ein Dialog-Fragment außerhalb von dialogs/", () => {
    const ctx = createTestContext({
      files: { "webapp/view/Confirm.fragment.xml": '<Dialog xmlns="sap.m"></Dialog>' },
    });

    expect(runRule(dialogsFolderRule, ctx)).toHaveLength(1);
  });

  it("ignoriert Nicht-Dialog-Fragmente", () => {
    const ctx = createTestContext({
      files: { "webapp/view/Info.fragment.xml": '<VBox xmlns="sap.m"></VBox>' },
    });

    expect(runRule(dialogsFolderRule, ctx)).toEqual([]);
  });
});
