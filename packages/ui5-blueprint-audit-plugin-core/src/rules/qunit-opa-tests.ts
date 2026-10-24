import type { Rule } from "@abap/ui5-blueprint-audit-types";
import { listFiles } from "../util/files.js";
import { getTestRoot } from "../util/library.js";

interface Options {
  basePath?: string;
}

/**
 * Checks that the project has unit or integration tests using QUnit or OPA5 under `basePath`.
 *
 * Default severity: `warn`. Project types: FS, FE, LIB.
 */
export const qunitOpaTestsRule: Rule<Options> = {
  meta: {
    descriptionKey: "qunit-opa-tests.description",
    defaultSeverity: "warn",
    projectTypes: ["fs", "fe", "lib"],
  },
  check(ctx) {
    const basePath = ctx.options?.basePath ?? getTestRoot(ctx.projectContext);
    const projectContext = ctx.projectContext;
    const testFiles = listFiles(projectContext, (path) => path.startsWith(`${basePath}/`));

    const hasQUnit = testFiles.some((path) => /\.qunit\.(js|ts|html)$/.test(path));
    const hasOpa5 = testFiles.some((path) => {
      if (!/\.(js|ts)$/.test(path)) return false;
      const content = projectContext.readFile(path);
      return content !== undefined && /sap\/ui\/test\/Opa5/.test(content);
    });

    if (!hasQUnit && !hasOpa5) {
      ctx.report({ message: ctx.t("qunit-opa-tests.missing", { basePath }), file: basePath });
    }
  },
};
