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
  it("treats a FragmentDefinition wrapping a single dialog as a dialog", () => {
    const wrapped = '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><Dialog title="x"></Dialog></core:FragmentDefinition>';

    expect(
      runRule(dialogsFolderRule, createTestContext({ files: { "webapp/view/dialogs/Confirm.fragment.xml": wrapped } })),
    ).toEqual([]);
    expect(
      runRule(dialogsFolderRule, createTestContext({ files: { "webapp/view/fragments/Confirm.fragment.xml": wrapped } })),
    ).toHaveLength(1);
  });

  it("does not treat a FragmentDefinition with several controls as a dialog", () => {
    const ctx = createTestContext({
      files: { "webapp/view/fragments/Mixed.fragment.xml": '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><Dialog/><Button/></core:FragmentDefinition>' },
    });

    expect(runRule(dialogsFolderRule, ctx)).toEqual([]);
  });
});
