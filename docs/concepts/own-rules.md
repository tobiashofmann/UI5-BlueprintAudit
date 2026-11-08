# Bring your own rules

The core rules cover the shared blueprint. Your company may have rules of its own: a required `README.md`, a banned UI5 library, a fixed `package.json` script. Add them as a **plugin**. You do not need to fork the tool.

## A plugin in five minutes

A plugin is a JavaScript module (`.mjs` or `.js`) with a default export. This plugin adds one rule that fails if the project has no `README.md` in its root folder:

```js
// my-rules.mjs
export default {
  name: "acme",
  apiVersion: "1",
  rules: {
    "readme-present": {
      meta: {
        descriptionKey: "acme.readmePresent.description",
        defaultSeverity: "error",
        projectTypes: ["fs", "fe", "lib"],
      },
      check(ctx) {
        const hasReadme = ctx.projectContext.fileTree.some((entry) => entry.path === "README.md");
        if (!hasReadme) {
          ctx.report({ message: ctx.t("acme.readmePresent.missing"), file: "README.md" });
        }
      },
    },
  },
  locales: {
    en: {
      "acme.readmePresent.description": "The project has a README.md in its root folder.",
      "acme.readmePresent.missing": "README.md is missing in the project root.",
    },
  },
};
```

Load it in `ui5-blueprint-audit.yaml`:

```yaml
projectType: fs
languages: [en]
plugins:
  - ./my-rules.mjs
rules:
  acme/readme-present: error
```

Run the audit in a project without a `README.md`:

```bash
npx ui5-blueprint-audit --lang en
```

```text
✗ my-app (fs): 1 error(s), 0 warning(s)
  error  README.md: README.md is missing in the project root.
```

The finding is also in the reports. In `report_en.md` the rule shows up with its prefix:

```markdown
| `acme/readme-present` | error | ❌ | README.md: README.md is missing in the project root. |
```

## The plugin contract

| Field | Description |
|---|---|
| `name` | The plugin name. It becomes the prefix of its rule IDs: `<name>/<rule>`. |
| `apiVersion` | The plugin API version. Currently `"1"`. If it does not match, the tool reports it and does not load the plugin. |
| `rules` | An object of rules, keyed by rule ID (without the prefix). |
| `configs` | Optional. Part of the contract, but the current engine does not use it. |
| `locales` | Optional. Translations, as `{ [locale]: { [key]: template } }`. |

Each rule has:

| Field | Description |
|---|---|
| `meta.descriptionKey` | The translation key of the rule description shown in the reports. |
| `meta.defaultSeverity` | `off`, `warn`, or `error`. |
| `meta.projectTypes` | The project types the rule runs for: `fs`, `fe`, `lib`. |
| `check(ctx)` | The check. It can be `async`. |

The `ctx` object has:

| Member | Description |
|---|---|
| `ctx.projectContext` | The project, read once: `manifest`, `ui5Yaml`, `ui5YamlExtensions`, `packageJson`, `indexHtml`, `fileTree`, `projectType`, and `readFile(path)`. |
| `ctx.options` | The parameters from the config, for this rule. |
| `ctx.t(key, params?)` | Resolves a translated text. `{name}` placeholders are replaced from `params`. |
| `ctx.report({ message, file?, line?, column? })` | Reports one finding. The engine adds the rule ID and the severity. |

::: warning Do not read files directly
Rules read from `ctx.projectContext` only. Use `ctx.projectContext.readFile(path)` for any other file inside the project. This keeps the audit fast and easy to test.
:::

## Rule parameters

Parameters from the config arrive in `ctx.options`:

```yaml
rules:
  acme/readme-present:
    - warn
    - minLength: 200
```

```js
check(ctx) {
  const minLength = ctx.options?.minLength ?? 0;
  // ...
}
```

## Load a plugin from npm

Put the plugin in an npm package whose default export is the plugin object. Install it in the project, and list the package name:

```yaml
plugins:
  - "@my-company/ui5-blueprint-audit-rules"
```

npm packages are resolved from the **project** folder, so install the package next to the project's own dependencies.

## Add a language

A plugin can ship only translations. Add a plugin without rules and with `locales`:

```js
// my-locale-fr.mjs
export default {
  name: "my-locale-fr",
  apiVersion: "1",
  rules: {},
  locales: {
    fr: {
      "report.title": "Rapport UI5 BlueprintAudit",
      // further keys optional, anything missing falls back to English
    },
  },
};
```

Load it like any other plugin, then use `--lang fr`:

```yaml
plugins:
  - ./my-locale-fr.mjs
```

```bash
npx ui5-blueprint-audit --type fs --lang fr
```

A key that is missing in a language falls back to `en`. Locale bundles can also translate the texts of the report itself, such as titles and column headers.

## Types for plugin authors

The package [`@abap/ui5-blueprint-audit-types`](/packages/types) contains the TypeScript types for `Plugin`, `Rule`, `RuleContext`, and `ProjectContext`. Install it as a dev dependency if you write the plugin in TypeScript, and compile to `.mjs` or `.js`.
