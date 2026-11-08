# @abap/ui5-blueprint-audit-plugin-core

The default rules. It is itself a regular plugin: the engine gives it no special treatment, except that its rule IDs have no prefix.

[Source on GitHub](https://github.com/tobiashofmann/UI5-BlueprintAudit/tree/main/packages/ui5-blueprint-audit-plugin-core) · [npm](https://www.npmjs.com/package/@abap/ui5-blueprint-audit-plugin-core)

## What it contains

- **33 rules**, one file each in [`src/rules/`](https://github.com/tobiashofmann/UI5-BlueprintAudit/tree/main/packages/ui5-blueprint-audit-plugin-core/src/rules), with a test file next to it. All rules are listed in the [rules table](/rules/).
- **Translations** for the rule descriptions and messages, in [`src/locales/`](https://github.com/tobiashofmann/UI5-BlueprintAudit/tree/main/packages/ui5-blueprint-audit-plugin-core/src/locales): `en` (the reference), `de`, and `pt-BR`.
- **Helpers** in [`src/util/`](https://github.com/tobiashofmann/UI5-BlueprintAudit/tree/main/packages/ui5-blueprint-audit-plugin-core/src/util): safe property access, XML and AST helpers, version comparison, `.properties` parsing, file helpers, library helpers, and a check for Fiori Launchpad plugins.
- **Test helpers** in [`src/test-utils.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/test-utils.ts): `createTestContext` and `runRule`.

The package default export is the plugin object, registered in [`src/index.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/index.ts):

```ts
const corePlugin: Plugin = {
  name: "core",
  apiVersion: "1",
  rules: {
    typescript: typescriptRule,
    "xml-views": xmlViewsRule,
    "controller-matches-view": controllerMatchesViewRule,
    // ... 30 more rules
  },
  locales,
};

export default corePlugin;
```

## What a rule looks like

Each rule is a small object with `meta` and `check`. This is the `odata-service` rule, trimmed to its first lines:

```ts
export const odataServiceRule: Rule<Options> = {
  meta: {
    descriptionKey: "odata-service.description",
    defaultSeverity: "error",
    projectTypes: ["fs", "fe"],
  },
  check(ctx) {
    // FLP plugins (sap.app/type: "component") only hook into the shell and, by design,
    // have no backend service of their own.
    if (isComponentApp(ctx.projectContext)) return;

    const min = ctx.options?.min ?? 1;
    const max = ctx.options?.max;
    // ...
  },
};
```

Source: [`src/rules/odata-service.ts`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/packages/ui5-blueprint-audit-plugin-core/src/rules/odata-service.ts). The first two comment lines above are shortened from the German comment in the source. The step-by-step flow of a rule is in [Project context and rules](/dev/context-and-rules).

## Why TypeScript is a runtime dependency

Some rules, such as `no-custom-controls`, analyze code through the TypeScript AST. For this reason `typescript` is a regular `dependency` of this package, not a `devDependency`. The package also depends on `fast-xml-parser` for XML views and fragments, and on `minimatch` for glob parameters.

## Add a rule to the core

Rule changes start in the catalog, then go to code:

1. Add or change the rule in [`docs/ui5-blueprint-audit-rules.md`](https://github.com/tobiashofmann/UI5-BlueprintAudit/blob/main/docs/ui5-blueprint-audit-rules.md).
2. Add the rule file in `src/rules/` and register it in `src/index.ts`.
3. Add messages to all three locale files. A missing key in `de` or `pt-BR` is a build error.
4. Add tests with a valid and an invalid fixture, for every project type the rule applies to.
5. Check `sample-prj/testcases.md` and the sample project test.

If you only need a rule for your own company, write a [plugin](/concepts/own-rules) instead.
