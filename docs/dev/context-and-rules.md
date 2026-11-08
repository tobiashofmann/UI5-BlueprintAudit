# Project context and rules

Rules never read the file system. They read a **project context** that is built once per project. This keeps rules small, fast, and easy to test.

## The project context

[`loadProjectContext`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit/src/context/load-project-context.ts) walks the project folder (skipping `node_modules`, `dist`, and `.git`) and parses the files that rules need:

| Field | Source |
|---|---|
| `manifest` | `webapp/manifest.json` |
| `ui5Yaml` | `ui5.yaml` |
| `ui5YamlExtensions` | Other `ui5-*.yaml` files in the project root, keyed by file name |
| `packageJson` | `package.json` |
| `indexHtml` | `webapp/index.html` |
| `fileTree` | Every file and directory, with project-relative paths |
| `readFile(path)` | Reads any other project file on demand |

A file that is missing or cannot be parsed becomes `undefined`. Rules must handle that.

The contract is defined in [`ProjectContext`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-types/src/index.ts), and the end of the loader shows how it is assembled:

```ts
return {
  projectRoot,
  projectType,
  manifest,
  ui5Yaml,
  ui5YamlExtensions,
  packageJson,
  indexHtml,
  fileTree,
  readFile: (relPath: string) => readProjectFile(projectRoot, relPath),
};
```

## Anatomy of a rule

The `theme` rule ([source](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/rules/theme.ts)) is a good small example. It reads two values from the context, compares them, and reports through `ctx.report`:

```ts
export const themeRule: Rule<Options> = {
  meta: {
    descriptionKey: "theme.description",
    defaultSeverity: "error",
    projectTypes: ["fs"],
  },
  check(ctx) {
    const themes = ctx.options?.themes ?? ["sap_horizon"];
    const projectContext = ctx.projectContext;

    const hasIndexHtml = projectContext.indexHtml !== undefined;
    const hasUi5Yaml = projectContext.ui5Yaml !== undefined;
    if (!hasIndexHtml && !hasUi5Yaml) return;
    // ...
    if (hasIndexHtml && hasUi5Yaml && htmlTheme && yamlTheme && htmlTheme !== yamlTheme) {
      ctx.report({
        message: ctx.t("theme.conflict", { htmlTheme, yamlTheme }),
      });
      return;
    }
    // ...
    if (!themes.includes(detectedTheme)) {
      ctx.report({ message: ctx.t("theme.notAllowed", { theme: detectedTheme, allowed: themes.join(", ") }) });
    }
  },
};
```

Patterns used by almost every rule:

- **Defaults for parameters** come from the rule itself (`ctx.options?.themes ?? ["sap_horizon"]`). The config only overrides.
- **Messages** are translation keys resolved with `ctx.t(key, params)`. They are never hardcoded strings.
- **Skipping** is a plain early `return` when the rule does not apply.

## Skipping Fiori Launchpad plugins

If `sap.app/type` in the manifest is `component`, the project is a Launchpad plugin. Four data rules skip themselves. The check lives in [`util/component.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/util/component.ts):

```ts
export function isComponentApp(ctx: ProjectContext): boolean {
  return get(ctx.manifest, "sap.app", "type") === "component";
}
```

## Libraries

Libraries have no `manifest.json` and no `webapp/`. Rules that apply to libraries read different sources for `lib`: `src/<namespace-as-path>/` and `ui5.yaml` instead. See the [mapping table in the catalog](/rules/catalog#special-cases-for-libraries). The helpers are in [`util/library.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/util/library.ts).

## Helpers

| File | Purpose |
|---|---|
| [`util/get.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/util/get.ts) | Safe nested property access on parsed JSON and YAML |
| [`util/xml.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/util/xml.ts) | XML views and fragments, with `fast-xml-parser` |
| [`util/ast.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/util/ast.ts) | TypeScript AST, for rules such as `no-custom-controls` |
| [`util/version.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/util/version.ts) | Semantic version comparison |
| [`util/properties.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/util/properties.ts) | `.properties` files for i18n |
| [`util/files.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/util/files.ts) | Glob matching and file-tree helpers |

## Test a rule without the engine

[`test-utils.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/test-utils.ts) builds a context from plain objects and runs one rule. No files are needed:

```ts
const ctx = createTestContext({
  indexHtml: '<script data-sap-ui-theme="sap_bluecrystal"></script>',
  ui5Yaml: { framework: { libraries: [{ name: "themelib_sap_bluecrystal" }] } },
});

expect(runRule(themeRule, ctx)).toHaveLength(1);
```
